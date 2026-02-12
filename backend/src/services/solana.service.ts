import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import idl from "../idl/crypto.json" with { type: "json" };

const PROGRAM_ID = new PublicKey(idl.address);
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

const BACKEND_KEYPAIR = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.BACKEND_PRIVATE_KEY!))
);

/**
 * Initialize Solana connection and Anchor program
 */
export const initializeSolana = () => {
  const connection = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(BACKEND_KEYPAIR);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  // Cast to any to bypass type checking for methods
  const program = new anchor.Program(idl as any, provider);

  return { connection, program, provider };
};

/**
 * Derive PDA addresses needed for charge_subscription
 */
export const derivePDAs = (subscriptionId: string, payerPubkey: PublicKey) => {
  // Strip hyphens from UUID to fit within Solana's 32-byte seed limit
  const seedId = subscriptionId.replace(/-/g, "");

  const [delegateApprovalPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("delegate"),
      Buffer.from(seedId),
      payerPubkey.toBuffer(),
    ],
    PROGRAM_ID
  );

  const [delegatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegate_pda")],
    PROGRAM_ID
  );

  return { delegateApprovalPDA, delegatePDA };
};

/**
 * Detect which token program owns a mint by checking the account's owner
 */
const getTokenProgramForMint = async (
  connection: Connection,
  mintPubkey: PublicKey
): Promise<PublicKey> => {
  const mintAccountInfo = await connection.getAccountInfo(mintPubkey);
  if (!mintAccountInfo) {
    throw new Error("Mint account not found");
  }
  if (mintAccountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return TOKEN_2022_PROGRAM_ID;
  }
  return TOKEN_PROGRAM_ID;
};

/**
 * Execute payment on-chain by calling charge_subscription
 */
export const executePayment = async (params: {
  subscriptionId: string;
  amount: number;
  payerWallet: string;
  receiverWallet: string;
  tokenMint: string;
  tokenDecimals: number;
}) => {
  const { connection, program } = initializeSolana();

  const payerPubkey = new PublicKey(params.payerWallet);
  const receiverPubkey = new PublicKey(params.receiverWallet);
  const tokenMintPubkey = new PublicKey(params.tokenMint);

  // Detect which token program owns this mint (Token or Token-2022)
  const tokenProgramId = await getTokenProgramForMint(
    connection,
    tokenMintPubkey
  );

  const { delegateApprovalPDA, delegatePDA } = derivePDAs(
    params.subscriptionId,
    payerPubkey
  );

  const payerTokenAccount = await getAssociatedTokenAddress(
    tokenMintPubkey,
    payerPubkey,
    false,
    tokenProgramId
  );

  const receiverTokenAccount = await getAssociatedTokenAddress(
    tokenMintPubkey,
    receiverPubkey,
    false,
    tokenProgramId
  );

  const amountInSmallestUnit =
    params.amount * Math.pow(10, params.tokenDecimals);

  // Strip hyphens from UUID to match PDA seed derivation
  const seedId = params.subscriptionId.replace(/-/g, "");

  const tx = await (program.methods as any)
    .chargeSubscription(
      seedId,
      new anchor.BN(amountInSmallestUnit)
    )
    .accounts({
      delegateApproval: delegateApprovalPDA,
      delegatePda: delegatePDA,
      payerTokenAccount: payerTokenAccount,
      receiverTokenAccount: receiverTokenAccount,
      tokenMint: tokenMintPubkey,
      backend: BACKEND_KEYPAIR.publicKey,
      tokenProgram: tokenProgramId,
    })
    .rpc();

  await connection.confirmTransaction(tx, "confirmed");

  return tx;
};

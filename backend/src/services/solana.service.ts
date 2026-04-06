import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  type ParsedTransactionWithMeta,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import idl from "../idl/crypto.json" with { type: "json" };

const PROGRAM_ID = new PublicKey(idl.address);
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

const BACKEND_KEYPAIR = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.BACKEND_PRIVATE_KEY!)),
);

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

export const derivePDAs = (subscriptionId: string, payerPubkey: PublicKey) => {
  // Strip hyphens from UUID to fit within Solana's 32-byte seed limit
  const seedId = subscriptionId.replace(/-/g, "");

  const [delegateApprovalPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegate"), Buffer.from(seedId), payerPubkey.toBuffer()],
    PROGRAM_ID,
  );

  const [delegatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegate_pda")],
    PROGRAM_ID,
  );

  return { delegateApprovalPDA, delegatePDA };
};

const getTokenProgramForMint = async (
  connection: Connection,
  mintPubkey: PublicKey,
): Promise<PublicKey> => {
  const mintAccountInfo = await connection.getAccountInfo(mintPubkey);
  if (!mintAccountInfo) {
    throw new Error("Mint account not found");
  }
  // Use string comparison to avoid PublicKey class mismatch across package versions
  if (mintAccountInfo.owner.toBase58() === TOKEN_2022_PROGRAM_ID.toBase58()) {
    return TOKEN_2022_PROGRAM_ID;
  }
  return TOKEN_PROGRAM_ID;
};

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
    tokenMintPubkey,
  );

  const { delegateApprovalPDA, delegatePDA } = derivePDAs(
    params.subscriptionId,
    payerPubkey,
  );

  const payerTokenAccount = await getAssociatedTokenAddress(
    tokenMintPubkey,
    payerPubkey,
    false,
    tokenProgramId,
  );

  const receiverTokenAccount = await getAssociatedTokenAddress(
    tokenMintPubkey,
    receiverPubkey,
    false,
    tokenProgramId,
  );

  const amountInSmallestUnit = new anchor.BN(params.amount).mul(
    new anchor.BN(10).pow(new anchor.BN(params.tokenDecimals)),
  );

  // Strip hyphens from UUID to match PDA seed derivation
  const seedId = params.subscriptionId.replace(/-/g, "");

  const tx = await (program.methods as any)
    .chargeSubscription(seedId, amountInSmallestUnit)
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

  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

const fetchConfirmedTransaction = async (
  connection: Connection,
  signature: string,
): Promise<ParsedTransactionWithMeta | null> => {
  const tx = await connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "finalized",
  });

  if (!tx || tx.meta?.err) return null;
  return tx;
};

export const verifyOneTimePayment = async (params: {
  txSignature: string;
  expectedTokenMint: string;
  expectedAmount: number;
  expectedReceiverWallet: string;
  tokenDecimals: number;
}): Promise<{ valid: boolean; reason?: string }> => {
  const { connection } = initializeSolana();

  const tx = await fetchConfirmedTransaction(connection, params.txSignature);
  if (!tx) {
    return { valid: false, reason: "Transaction not found or failed on-chain" };
  }

  const instructions = tx.transaction.message.instructions;
  const innerInstructions = tx.meta?.innerInstructions ?? [];

  const allParsedInstructions: Array<{
    program: string;
    parsed?: { type: string; info: Record<string, unknown> };
  }> = [];

  for (const ix of instructions) {
    if ("parsed" in ix) allParsedInstructions.push(ix as any);
  }
  for (const inner of innerInstructions) {
    for (const ix of inner.instructions) {
      if ("parsed" in ix) allParsedInstructions.push(ix as any);
    }
  }

  const tokenMintPubkey = new PublicKey(params.expectedTokenMint);
  const tokenProgramId = await getTokenProgramForMint(
    connection,
    tokenMintPubkey,
  );

  const receiverPubkey = new PublicKey(params.expectedReceiverWallet);
  const expectedReceiverATA = await getAssociatedTokenAddress(
    tokenMintPubkey,
    receiverPubkey,
    false,
    tokenProgramId,
  );

  const expectedAmountRaw = BigInt(
    Math.floor(params.expectedAmount * Math.pow(10, params.tokenDecimals)),
  );

  for (const ix of allParsedInstructions) {
    if (ix.parsed?.type !== "transferChecked") continue;

    const info = ix.parsed.info;
    const mint = info.mint as string;
    const destination = info.destination as string;
    const tokenAmount = info.tokenAmount as { amount: string };

    if (mint !== params.expectedTokenMint) continue;
    if (destination !== expectedReceiverATA.toBase58()) continue;

    const actualAmount = BigInt(tokenAmount.amount);
    if (actualAmount < expectedAmountRaw) {
      return {
        valid: false,
        reason: `Amount mismatch: expected ${expectedAmountRaw}, got ${actualAmount}`,
      };
    }

    return { valid: true };
  }

  return {
    valid: false,
    reason: "No matching transferChecked instruction found in transaction",
  };
};

export const verifyDelegationTransaction = async (params: {
  txSignature: string;
  expectedPayerWallet: string;
}): Promise<{ valid: boolean; reason?: string }> => {
  const { connection } = initializeSolana();

  const tx = await fetchConfirmedTransaction(connection, params.txSignature);
  if (!tx) {
    return {
      valid: false,
      reason: "Delegation transaction not found or failed on-chain",
    };
  }

  const programIdStr = PROGRAM_ID.toBase58();
  const instructions = tx.transaction.message.instructions;

  const programInvoked = instructions.some(
    (ix) => ix.programId.toBase58() === programIdStr,
  );

  if (!programInvoked) {
    return {
      valid: false,
      reason: "Transaction did not invoke the PattPay program",
    };
  }

  const signers = tx.transaction.message.accountKeys
    .filter((ak) => ak.signer)
    .map((ak) => ak.pubkey.toBase58());

  if (!signers.includes(params.expectedPayerWallet)) {
    return {
      valid: false,
      reason: "Expected payer wallet did not sign the transaction",
    };
  }

  return { valid: true };
};

export const verifyRevokeTransaction = async (params: {
  txSignature: string;
  expectedPayerWallet: string;
  subscriptionId: string;
}): Promise<{ valid: boolean; reason?: string }> => {
  const { connection } = initializeSolana();

  const tx = await fetchConfirmedTransaction(connection, params.txSignature);
  if (!tx) {
    return {
      valid: false,
      reason: "Revoke transaction not found or failed on-chain",
    };
  }

  const programIdStr = PROGRAM_ID.toBase58();
  const instructions = tx.transaction.message.instructions;

  const programInvoked = instructions.some(
    (ix) => ix.programId.toBase58() === programIdStr,
  );

  if (!programInvoked) {
    return {
      valid: false,
      reason: "Transaction did not invoke the PattPay program",
    };
  }

  const signers = tx.transaction.message.accountKeys
    .filter((ak) => ak.signer)
    .map((ak) => ak.pubkey.toBase58());

  if (!signers.includes(params.expectedPayerWallet)) {
    return {
      valid: false,
      reason: "Expected payer wallet did not sign the revoke transaction",
    };
  }

  const payerPubkey = new PublicKey(params.expectedPayerWallet);
  const { delegateApprovalPDA } = derivePDAs(
    params.subscriptionId,
    payerPubkey,
  );
  const accountInfo = await connection.getAccountInfo(delegateApprovalPDA);

  if (accountInfo !== null) {
    return {
      valid: false,
      reason:
        "Delegate authority PDA still exists on-chain, revocation not confirmed",
    };
  }

  return { valid: true };
};

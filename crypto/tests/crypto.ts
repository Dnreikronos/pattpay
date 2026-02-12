import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crypto } from "../target/types/crypto";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("crypto", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Crypto as Program<Crypto>;

  let tokenMint: PublicKey;
  let payerTokenAccount: PublicKey;
  let receiverTokenAccount: PublicKey;
  let receiver: Keypair;
  let backend: Keypair;

  // Use a UUID without hyphens (32 chars) to match production behavior
  const subscriptionId = "a6d60718428e446ba9663f120f97b44b";
  const approvedAmount = 1000000;

  before(async () => {
    receiver = Keypair.generate();
    backend = Keypair.generate();

    const sig = await provider.connection.requestAirdrop(
      backend.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    tokenMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      6
    );

    const payerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      tokenMint,
      provider.wallet.publicKey
    );
    payerTokenAccount = payerAta.address;

    const receiverAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      tokenMint,
      receiver.publicKey
    );
    receiverTokenAccount = receiverAta.address;

    await mintTo(
      provider.connection,
      provider.wallet.payer,
      tokenMint,
      payerTokenAccount,
      provider.wallet.publicKey,
      approvedAmount * 2
    );
  });

  it("approves delegate", async () => {
    const [delegateApproval] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("delegate"),
        Buffer.from(subscriptionId),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .approveDelegate(subscriptionId, new anchor.BN(approvedAmount))
      .accounts({
        payer: provider.wallet.publicKey,
        receiver: receiver.publicKey,
        payerTokenAccount,
        receiverTokenAccount,
        tokenMint,
      })
      .rpc();

    const approval = await program.account.delegateApproval.fetch(delegateApproval);
    assert.equal(approval.approvedAmount.toNumber(), approvedAmount);
    assert.equal(approval.spentAmount.toNumber(), 0);
    assert.equal(approval.subscriptionId, subscriptionId);
  });

  it("charges subscription", async () => {
    const [delegateApproval] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("delegate"),
        Buffer.from(subscriptionId),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    const [delegatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegate_pda")],
      program.programId
    );

    const chargeAmount = 500000;

    const tx = await program.methods
      .chargeSubscription(subscriptionId, new anchor.BN(chargeAmount))
      .accountsPartial({
        delegateApproval,
        delegatePda,
        payerTokenAccount,
        receiverTokenAccount,
        tokenMint,
        backend: backend.publicKey,
      })
      .signers([backend])
      .rpc();

    const approval = await program.account.delegateApproval.fetch(delegateApproval);
    assert.equal(approval.spentAmount.toNumber(), chargeAmount);
  });

  it("fails charging with unauthorized backend", async () => {
    const [delegateApproval] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("delegate"),
        Buffer.from(subscriptionId),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    const [delegatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegate_pda")],
      program.programId
    );

    const unauthorized = Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      unauthorized.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    try {
      await program.methods
        .chargeSubscription(subscriptionId, new anchor.BN(100000))
        .accountsPartial({
          delegateApproval,
          delegatePda,
          payerTokenAccount,
          receiverTokenAccount,
          tokenMint,
          backend: unauthorized.publicKey,
        })
        .signers([unauthorized])
        .rpc();

      assert.fail("Should have failed with unauthorized");
    } catch (err) {
      assert.include(err.toString(), "Unauthorized");
    }
  });

  it("revokes delegate", async () => {
    const [delegateApproval] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("delegate"),
        Buffer.from(subscriptionId),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .revokeDelegate(subscriptionId)
      .accounts({
        payer: provider.wallet.publicKey,
      })
      .rpc();

    try {
      await program.account.delegateApproval.fetch(delegateApproval);
      assert.fail("Account should be closed");
    } catch (err) {
      assert.include(err.toString(), "Account does not exist");
    }
  });
});

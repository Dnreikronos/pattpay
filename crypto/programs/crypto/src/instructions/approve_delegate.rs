use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface};

use crate::state::DelegateApproval;

pub fn approve_delegate_handler(
    ctx: Context<ApproveDelegate>,
    subscription_id: String,
    approved_amount: u64,
) -> Result<()> {
    let delegate_approval = &mut ctx.accounts.delegate_approval;

    delegate_approval.payer = ctx.accounts.payer.key();
    delegate_approval.receiver = ctx.accounts.receiver.key();
    delegate_approval.token_mint = ctx.accounts.token_mint.key();
    delegate_approval.payer_token_account = ctx.accounts.payer_token_account.key();
    delegate_approval.receiver_token_account = ctx.accounts.receiver_token_account.key();
    delegate_approval.approved_amount = approved_amount;
    delegate_approval.spent_amount = 0;
    delegate_approval.subscription_id = subscription_id;
    delegate_approval.created_at = Clock::get()?.unix_timestamp;
    delegate_approval.bump = ctx.bumps.delegate_approval;

    token_interface::approve(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_interface::Approve {
                to: ctx.accounts.payer_token_account.to_account_info(),
                delegate: ctx.accounts.delegate_pda.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        ),
        approved_amount,
    )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(subscription_id: String, approved_amount: u64)]
pub struct ApproveDelegate<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + DelegateApproval::INIT_SPACE,
        seeds = [b"delegate", subscription_id.as_bytes(), payer.key().as_ref()],
        bump
    )]
    pub delegate_approval: Account<'info, DelegateApproval>,

    #[account(seeds = [b"delegate_pda"], bump)]
    /// CHECK: PDA that will have delegate authority
    pub delegate_pda: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Receiver wallet address
    pub receiver: UncheckedAccount<'info>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = payer,
    )]
    pub payer_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        token::mint = token_mint,
    )]
    pub receiver_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

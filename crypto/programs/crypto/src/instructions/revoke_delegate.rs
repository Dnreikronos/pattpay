use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface};

use crate::events::DelegateRevoked;
use crate::state::DelegateApproval;

pub fn revoke_delegate_handler(
    ctx: Context<RevokeDelegate>,
    _subscription_id: String,
) -> Result<()> {
    let approval = &ctx.accounts.delegate_approval;
    let subscription_id = approval.subscription_id.clone();
    let total_spent = approval.spent_amount;

    token_interface::revoke(CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        token_interface::Revoke {
            source: ctx.accounts.payer_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        },
    ))?;

    emit!(DelegateRevoked {
        subscription_id,
        payer: ctx.accounts.payer.key(),
        total_spent,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(subscription_id: String)]
pub struct RevokeDelegate<'info> {
    #[account(
        mut,
        seeds = [b"delegate", subscription_id.as_bytes(), payer.key().as_ref()],
        bump = delegate_approval.bump,
        close = payer
    )]
    pub delegate_approval: Account<'info, DelegateApproval>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = payer,
        constraint = payer_token_account.key() == delegate_approval.payer_token_account,
    )]
    pub payer_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
}

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface};

use crate::constants::AUTHORIZED_BACKEND;
use crate::errors::ErrorCode;
use crate::state::DelegateApproval;

pub fn charge_subscription_handler(
    ctx: Context<ChargeSubscription>,
    _subscription_id: String,
    amount: u64,
) -> Result<()> {
    require!(
        ctx.accounts.backend.key() == AUTHORIZED_BACKEND,
        ErrorCode::Unauthorized
    );

    let delegate_approval = &mut ctx.accounts.delegate_approval;

    let new_spent = delegate_approval
        .spent_amount
        .checked_add(amount)
        .ok_or(error!(ErrorCode::ArithmeticOverflow))?;

    require!(
        new_spent <= delegate_approval.approved_amount,
        ErrorCode::InsufficientAllowance
    );

    let seeds = &[b"delegate_pda".as_ref(), &[ctx.bumps.delegate_pda]];
    let signer = &[&seeds[..]];

    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.payer_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.receiver_token_account.to_account_info(),
                authority: ctx.accounts.delegate_pda.to_account_info(),
            },
            signer,
        ),
        amount,
        ctx.accounts.token_mint.decimals,
    )?;

    delegate_approval.spent_amount = new_spent;

    Ok(())
}

#[derive(Accounts)]
#[instruction(subscription_id: String, amount: u64)]
pub struct ChargeSubscription<'info> {
    #[account(
        mut,
        seeds = [b"delegate", subscription_id.as_bytes(), delegate_approval.payer.as_ref()],
        bump = delegate_approval.bump
    )]
    pub delegate_approval: Account<'info, DelegateApproval>,

    #[account(seeds = [b"delegate_pda"], bump)]
    /// CHECK: PDA with delegate authority
    pub delegate_pda: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = payer_token_account.key() == delegate_approval.payer_token_account @ ErrorCode::InvalidTokenAccount
    )]
    pub payer_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = receiver_token_account.key() == delegate_approval.receiver_token_account @ ErrorCode::InvalidTokenAccount
    )]
    pub receiver_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = token_mint.key() == delegate_approval.token_mint @ ErrorCode::InvalidTokenAccount
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    pub backend: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
}

use anchor_lang::prelude::*;

use crate::state::DelegateApproval;

pub fn revoke_delegate_handler(
    _ctx: Context<RevokeDelegate>,
    _subscription_id: String,
) -> Result<()> {
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
}

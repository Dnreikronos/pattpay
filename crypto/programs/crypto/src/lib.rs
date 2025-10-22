use anchor_lang::prelude::*;
use anchor_spl::token::{self, Approve, Token, TokenAccount};

declare_id!("8uswUaDvewbwKHkXF9j1RTuGXujbM2Bj3Wd7Tzzsd34X");

#[program]
pub mod crypto {
    use anchor_lang::context;

    use super::*;

    pub fn approve_delegate(
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
        delegate_approval.spent_money = 0;
        delegate_approval.subscription_id = subscription_id;
        delegate_approval.created_at = Clock::get()?.unix_timestamp;
        delegate_approval.bump = ctx.bumps.delegate_approval;

        // Delegate token authority to program PDA
        let cpi_accounts = Approve {
            to: ctx.accounts.payer_token_account.to_account_info(),
            delegate: ctx.accounts.delegate_pda.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::approve(cpi_ctx, approved_amount)?;

        Ok(())
    }

#[derive(Accounts)]
pub struct Initialize {}

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

    pub fn charge_subscription(
        ctx: Context<CharSubscription>,
        subscription_id: String,
        amount: u64,
    ) -> Result<()> {
        require!(
            ctx.accounts.backend.key() == AUTHORIZED_BACKEND,
            ErrorCode::Unauthorized
        );

        let delegate_approva = &mut ctx.accounts.delegate_approval;

        require!(
            delegate_approval.spent_amout + amount <= delegate_approval.approved_amount,
            ErrorCode::InsufficientAllowance
        );

        let seeds = &[b"delegate_pda", &[delegate_approval.bump]];
        let signer = &[seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.payer_token_account.to_account_info(),
            to: ctx.accounts.receiver_token_account.to_account_info(),
            authority: ctx.accounts.delegate_pda.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;

        delegate_approval.spent_amout += amount;

        Ok(())
    }

    pub fn revoke_delegate(ctx: Context<RevokeDelegate>, _subscription_id: String) -> Result<()> {
        // Handled by closing accounts and payer can revoke SPL approval separely
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(subscription_id: String, approved_amout: u64)]
pub struct ApproveDelegate<'info> {
    #[account (
         init,
         payer = payer,
         space = 8 + DelegateApproval::INIT_SPACE,
         seeds = [b"delegate_pda", subscription_id.as_bytes(), payer.key().as_ref()],
         bump
    )]
    pub delegate_approval: Account<'info, DelegateApproval>,

    // CHECK: PDA that will have delegate authority
    #[account(seeds = [b"delegate_pda"], bump)]
    pub delegate_pda: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    // CHECK: Receiver Wallet
    pub receiver: UncheckedAccount<'info>,

    #[account (
        mut,
        constraint = payer_token_account_owner = payer.key(),
        constraint = payer_token_account_mint = token_mint.key(),
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,

    pub token_mint: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

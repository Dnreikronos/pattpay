use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};

declare_id!("BrBYcBHWA7LkqDfMGQucbs3uLS7DTGKTTzwqYiBVf9sH");

const AUTHORIZED_BACKEND: Pubkey = pubkey!("9eGNzLdmUw6M84oo1H4iR8KMwxUnDHMMr6q85h69eKDH");

#[program]
pub mod crypto {
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
        delegate_approval.spent_amount = 0;
        delegate_approval.subscription_id = subscription_id;
        delegate_approval.created_at = Clock::get()?.unix_timestamp;
        delegate_approval.bump = ctx.bumps.delegate_approval;

        token::approve(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Approve {
                    to: ctx.accounts.payer_token_account.to_account_info(),
                    delegate: ctx.accounts.delegate_pda.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            approved_amount,
        )?;

        Ok(())
    }

    pub fn charge_subscription(
        ctx: Context<ChargeSubscription>,
        subscription_id: String,
        amount: u64,
    ) -> Result<()> {
        require!(
            ctx.accounts.backend.key() == AUTHORIZED_BACKEND,
            ErrorCode::Unauthorized
        );

        let delegate_approval = &mut ctx.accounts.delegate_approval;

        require!(
            delegate_approval.spent_amount + amount <= delegate_approval.approved_amount,
            ErrorCode::InsufficientAllowance
        );

        let seeds = &[b"delegate_pda".as_ref(), &[delegate_approval.bump]];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.payer_token_account.to_account_info(),
                    to: ctx.accounts.receiver_token_account.to_account_info(),
                    authority: ctx.accounts.delegate_pda.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        delegate_approval.spent_amount += amount;

        Ok(())
    }

    pub fn revoke_delegate(_ctx: Context<RevokeDelegate>, _subscription_id: String) -> Result<()> {
        Ok(())
    }
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

    /// CHECK: Receiver wallet
    pub receiver: UncheckedAccount<'info>,

    /// CHECK: This is the payer's token account
    #[account(mut)]
    pub payer_token_account: UncheckedAccount<'info>,

    /// CHECK: This is the receiver's token account  
    pub receiver_token_account: UncheckedAccount<'info>,

    /// CHECK: Token mint
    pub token_mint: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
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

    /// CHECK: This is the payer's token account
    #[account(mut)]
    pub payer_token_account: UncheckedAccount<'info>,

    /// CHECK: This is the receiver's token account
    #[account(mut)]
    pub receiver_token_account: UncheckedAccount<'info>,

    pub backend: Signer<'info>,
    pub token_program: Program<'info, Token>,
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

#[account]
#[derive(InitSpace)]
pub struct DelegateApproval {
    pub payer: Pubkey,
    pub receiver: Pubkey,
    pub token_mint: Pubkey,
    pub payer_token_account: Pubkey,
    pub receiver_token_account: Pubkey,
    pub approved_amount: u64,
    pub spent_amount: u64,
    #[max_len(36)]
    pub subscription_id: String,
    pub created_at: i64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: only backend can charge")]
    Unauthorized,
    #[msg("Insufficient allowance")]
    InsufficientAllowance,
}

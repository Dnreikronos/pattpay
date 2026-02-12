use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface};

declare_id!("Exfqqq3q9uqYAL4z5X1G1y2hSt1A7urEQTHJnvFpzhXb");

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
    #[max_len(32)]
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
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}

use anchor_lang::prelude::*;

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

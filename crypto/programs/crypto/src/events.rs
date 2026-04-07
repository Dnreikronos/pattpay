use anchor_lang::prelude::*;

#[event]
pub struct DelegateApproved {
    pub subscription_id: String,
    pub payer: Pubkey,
    pub receiver: Pubkey,
    pub token_mint: Pubkey,
    pub approved_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct SubscriptionCharged {
    pub subscription_id: String,
    pub payer: Pubkey,
    pub receiver: Pubkey,
    pub amount: u64,
    pub total_spent: u64,
    pub approved_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct DelegateRevoked {
    pub subscription_id: String,
    pub payer: Pubkey,
    pub total_spent: u64,
    pub timestamp: i64,
}

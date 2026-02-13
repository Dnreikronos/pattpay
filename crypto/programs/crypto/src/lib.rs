use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Exfqqq3q9uqYAL4z5X1G1y2hSt1A7urEQTHJnvFpzhXb");

#[program]
pub mod crypto {
    use super::*;

    pub fn approve_delegate(
        ctx: Context<ApproveDelegate>,
        subscription_id: String,
        approved_amount: u64,
    ) -> Result<()> {
        instructions::approve_delegate_handler(ctx, subscription_id, approved_amount)
    }

    pub fn charge_subscription(
        ctx: Context<ChargeSubscription>,
        subscription_id: String,
        amount: u64,
    ) -> Result<()> {
        instructions::charge_subscription_handler(ctx, subscription_id, amount)
    }

    pub fn revoke_delegate(
        ctx: Context<RevokeDelegate>,
        subscription_id: String,
    ) -> Result<()> {
        instructions::revoke_delegate_handler(ctx, subscription_id)
    }
}

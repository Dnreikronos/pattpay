use anchor_lang::prelude::*;

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
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Receiver does not match receiver token account owner")]
    InvalidReceiver,
    #[msg("Subscription ID does not match delegate approval")]
    InvalidSubscriptionId,
}

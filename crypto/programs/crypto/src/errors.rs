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
}

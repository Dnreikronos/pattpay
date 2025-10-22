use anchor_lang::prelude::*;
use anchor_spl::token::{self, Approve, Token, TokenAccount};

declare_id!("8uswUaDvewbwKHkXF9j1RTuGXujbM2Bj3Wd7Tzzsd34X");

#[program]
pub mod crypto {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

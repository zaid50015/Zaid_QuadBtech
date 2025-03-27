use anchor_lang::prelude::*;

declare_id!("Cf5364UL8LQktvr6oWXL7adgmrj8hWZ4tRPPe4mtJE7k");

#[program]
pub mod hello_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

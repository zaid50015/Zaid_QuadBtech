import { IdlAccounts, Program } from "@coral-xyz/anchor";
import {  Counter } from "./idl";
import IDL from "./counter.json";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const programId = new PublicKey("8kBjf5TU9araco6f9gSPzN9D6PVLpevAcFdUkSxnJyVL");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Initialize the program interface with the IDL, program ID, and connection.
// This setup allows us to interact with the on-chain program using the defined interface.
export const program = new Program<Counter>(IDL, programId, {
  connection,
});

export const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  program.programId,
);

// This is just a TypeScript type for the Counter data structure based on the IDL
// We need this so TypeScript doesn't yell at us
export type CounterData = IdlAccounts<Counter>["counter"];
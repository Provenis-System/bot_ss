import { Client } from "pg";

import { env } from "../config/env.js";

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function ensureDatabaseSchema() {
  const client = new Client({ connectionString: env.DATABASE_URL });

  await client.connect();

  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(env.DATABASE_SCHEMA)}`);
  } finally {
    await client.end();
  }
}
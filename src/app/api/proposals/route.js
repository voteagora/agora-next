// app/api/proposals/route.js

import { NextResponse } from "next/server";

import postgres from "postgres";

const conn = postgres();

async function getAllProposals() {
  return conn.query("SELECT * FROM goldsky_daos.proposals");
}
export async function GET(request) {
  // Do whatever you want
  const proposals = await getAllProposals();
  return NextResponse.json({ proposals });
}

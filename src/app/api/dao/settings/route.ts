import { NextRequest, NextResponse } from "next/server";
import { prismaWeb3Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daoId = searchParams.get("daoId");
    const { namespace } = Tenant.current();
    if (!daoId) {
      return NextResponse.json({ error: "daoId is required" }, { status: 400 });
    }

    const result = await prismaWeb3Client.$queryRawUnsafe<
      Array<{
        param_name: string;
        param_value: string;
      }>
    >(
      `SELECT param_name, param_value
      FROM ${namespace}.dao_settings 
      WHERE dao_id = $1`,
      daoId.toLowerCase()
    );

    const settings: Record<string, string> = {};
    for (const row of result) {
      settings[row.param_name] = row.param_value;
    }

    return NextResponse.json({
      votingPeriod: settings.voting_period
        ? parseInt(settings.voting_period, 10)
        : 7 * 24 * 60 * 60,
      votingDelay: settings.voting_delay
        ? parseInt(settings.voting_delay, 10)
        : 0,
      ...settings,
    });
  } catch (error) {
    console.error("Failed to fetch DAO settings:", error);
    return NextResponse.json(
      {
        votingPeriod: 7 * 24 * 60 * 60,
        votingDelay: 0,
      },
      { status: 200 }
    );
  }
}

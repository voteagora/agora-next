import { NextResponse, type NextRequest } from "next/server";
import { fetchDelegate } from "@/app/api/common/delegates/getDelegates";

export async function GET(request: NextRequest) {
    try {
        const addressOrENSName = request.nextUrl.pathname.split('/')[4];
        const delegate = await fetchDelegate(addressOrENSName);
        return NextResponse.json(delegate);
    }
    catch (e: any) {
        return new Response("Internal server error: " + e.toString(), { status: 500 });
    }
}
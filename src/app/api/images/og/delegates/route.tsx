import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { LogoPill } from "@/app/api/images/og/assets/shared";
import { TenantNamespace } from "@/lib/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") || "";
  const description = searchParams.get("description") || "";
  const namespace = (process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME ||
    "optimism") as TenantNamespace;

  const interBoldFont = await fetch(
    new URL("../assets/Inter-Black.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interRegularFont = await fetch(
    new URL("../assets/Inter-Medium.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const bg = await fetch(
    new URL("../assets/og-delegates-bg.png", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "white",
          height: "100%",
          width: "100%",
          display: "flex",
          fontFamily: '"Inter"',
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexDirection: "column",
          flexWrap: "nowrap",
        }}
      >
        {/* @ts-ignore */}
        <img src={bg} style={{ position: "absolute" }} />
        <div tw="flex h-full w-full px-[76px] pt-[70px] pb-[110px]">
          <div tw="flex flex-col justify-between h-full w-[470px]">
            <LogoPill namespace={namespace} />

            <div tw="flex flex-col">
              <div tw="font-bold text-5xl w-full">{title}</div>
              <div tw="font-normal mt-[30px] text-4xl text-secondary">
                {description}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          data: interBoldFont,
          name: "Inter",
          style: "normal",
          weight: 900,
        },
        {
          data: interRegularFont,
          name: "Inter",
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}

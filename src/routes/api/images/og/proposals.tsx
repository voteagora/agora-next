import { createFileRoute } from "@tanstack/react-router";
import { ImageResponse } from "@vercel/og";

import { LogoPill } from "./assets/shared";
import { TenantNamespace } from "@/lib/types";

export const Route = createFileRoute("/api/images/og/proposals")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { searchParams, origin } = new URL(request.url);

        const title = searchParams.get("title") || "";
        const description = searchParams.get("description") || "";
        const namespace = (process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME ||
          "optimism") as TenantNamespace;

        const [interBoldFont, interRegularFont, bg] = await Promise.all([
          fetch(new URL(`${origin}/fonts/Inter/Inter-Black.ttf`)).then((r) =>
            r.arrayBuffer()
          ),
          fetch(new URL(`${origin}/fonts/Inter/Inter-Medium.ttf`)).then((r) =>
            r.arrayBuffer()
          ),
          fetch(new URL(`${origin}/images/og-proposals-bg.png`)).then((r) =>
            r.arrayBuffer()
          ),
        ]);

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
      },
    },
  },
});

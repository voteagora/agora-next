import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { truncateString } from "@/app/lib/utils/text";
import { LogoPill } from "@/app/api/images/og/assets/shared";
import { TenantNamespace } from "@/lib/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const address = searchParams.get("address") || "voter.eth";

  const avatar = searchParams.get("avatar") || null;
  const votes = searchParams.get("votes") || null;
  const description = searchParams.get("description") || "";
  const statement = searchParams.has("statement")
    ? truncateString(searchParams.get("statement") || "", 220)
    : null;
  const namespace = (process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME ||
    "optimism") as TenantNamespace;

  const interBoldFont = await fetch(
    new URL("../assets/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interRegularFont = await fetch(
    new URL("../assets/Inter-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const bg = await fetch(
    new URL("../assets/og-delegate-bg.png", import.meta.url)
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
        <img src={bg} style={{ position: "absolute" }} alt="background" />
        <div tw="flex h-full w-full px-[76px] pt-[70px] pb-[110px]">
          <div tw="flex flex-col justify-between h-full w-[470px]">
            <LogoPill namespace={namespace} />
            <div tw="flex flex-col">
              <div tw="font-bold text-5xl w-1/2">
                {truncateString(address, 20)}
              </div>
              <div tw="font-normal mt-[30px] text-4xl text-secondary">
                {description}
              </div>
            </div>
          </div>

          <div tw="flex w-[430px] ml-[97px] mt-[34px]">
            <div tw="flex flex-col w-full">
              <div tw="flex mb-[26px]">
                <div tw="flex">
                  <div tw="flex">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="avatar"
                        width="60"
                        height="60"
                        style={{ borderRadius: "50%" }}
                      />
                    ) : (
                      <svg
                        style={{ width: 60, height: 61 }}
                        viewBox="0 0 60 61"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="2.03015"
                          y="0.333862"
                          width="58.0108"
                          height="58.0108"
                          rx="29.0054"
                          transform="rotate(2 2.03015 0.333862)"
                          fill="#2A2929"
                        />
                        <path
                          d="M25.8831 31.4012C26.6024 31.4012 27.1856 31.9536 27.1856 32.635C27.1856 33.9978 28.3519 35.1026 29.7906 35.1026C31.2293 35.1026 32.3956 33.9978 32.3956 32.635C32.3956 31.9536 32.9788 31.4012 33.6981 31.4012C34.4175 31.4012 35.0006 31.9536 35.0006 32.635C35.0006 35.3606 32.668 37.5702 29.7906 37.5702C26.9132 37.5702 24.5806 35.3606 24.5806 32.635C24.5806 31.9536 25.1637 31.4012 25.8831 31.4012Z"
                          fill="white"
                        />
                        <path
                          d="M17.4167 21.3767L18.1698 23.1854C18.8351 24.7832 20.1678 26.047 21.8502 26.6755L23.7665 27.3914L21.8502 28.1073C20.1678 28.7358 18.8351 29.9997 18.1698 31.5975L17.4167 33.4061L16.6637 31.5975C15.9984 29.9997 14.6657 28.7358 12.9832 28.1073L11.067 27.3914L12.9832 26.6755C14.6657 26.047 15.9984 24.7832 16.6637 23.1854L17.4167 21.3767Z"
                          fill="white"
                        />
                        <path
                          d="M42.4901 21.3767L43.2432 23.1854C43.9084 24.7832 45.2412 26.047 46.9236 26.6755L48.8398 27.3914L46.9236 28.1073C45.2412 28.7358 43.9084 29.9997 43.2432 31.5975L42.4901 33.4061L41.7371 31.5975C41.0718 29.9997 39.739 28.7358 38.0566 28.1073L36.1404 27.3914L38.0566 26.6755C39.739 26.047 41.0718 24.7832 41.737 23.1854L42.4901 21.3767Z"
                          fill="white"
                        />
                      </svg>
                    )}
                  </div>
                  <div tw="flex flex-col justify-center ml-[16px]">
                    <div tw="flex text-2xl mb-[4px]">
                      {truncateString(address, 30)}
                    </div>
                    {votes && (
                      <div tw="flex text-[17px] text-primary">{votes}</div>
                    )}
                  </div>
                </div>
              </div>

              <div tw="flex flex-col h-full">
                {statement && (
                  <div tw="flex text-2xl text-primary h-60">{statement}</div>
                )}
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
          weight: 700,
        },
        {
          data: interRegularFont,
          name: "Inter",
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}

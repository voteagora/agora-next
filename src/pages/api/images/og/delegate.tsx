import type { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function GET(
  req: NextApiRequest,
) {

  const { searchParams } = new URL(req.url);

  const title = searchParams.has("title") ? searchParams.get("title") : "Agora Proposal";
  const description = searchParams.has("description") ? searchParams.get("description") : "My default description";

  const fontData = await fetch(
    new URL("../../../../assets/fonts/Inter-Bold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());


  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "white",
          height: "100%",
          width: "100%",
          display: "flex",
          fontFamily: "\"Inter\"",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexDirection: "column",
          flexWrap: "nowrap",
        }}
      >

        <div tw="flex h-full w-full px-16 pt-16 pb-22">

          <div tw="flex flex-col justify-between h-full w-1/2">
            <div tw="flex">
              <div tw="flex flex-row items-center border border-gray-300 rounded-full px-8 py-6">
                <div tw="bg-gray-300 w-1 h-3/4 mx-8"></div>
              </div>
            </div>

            <div tw="flex flex-col">
              <div tw="font-medium text-[68px] mb-8">{title}</div>
              <div tw="font-black text-[42px] text-[#4F4F4F]">{description}</div>
            </div>
          </div>

          <div tw="flex w-1/2">
            <div tw="flex shadow-lg rounded-lg p-10 w-full">

              <div tw="flex border border-gray-300">
                <div tw="flex w-20 h-20 bg-gray-800 rounded-full"></div>
                <div tw="flex flex-col ml-5">
                  <div tw="flex">{title}</div>
                  <div tw="flex">{description}</div>
                </div>
              </div>
            <div>So much text here</div>
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
          name: "Inter",
          data: fontData,
        },
      ],
    },
  );
}
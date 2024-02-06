import type { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function GET(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse>,
) {


  const { searchParams } = new URL(req.url);

  const title = searchParams.has("title") ? searchParams.get("title")?.slice(0, 100) : "My default title";
  const description = searchParams.has("description") ? searchParams.get("description")?.slice(0, 100) : "My default description";

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "white",
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexDirection: "column",
          flexWrap: "nowrap",
        }}
      >
        <div tw="flex flex-col justify-between h-full px-16 pt-16 pb-20">

          <div tw="flex flex-row border border-[#E0E0E0] rounded-20 p-5">
            <div tw="bg-indigo-500 w-10 h-10"></div>
            <div tw="bg-[#E0E0E0] w-px h-full mx-5"></div>
            <div tw="bg-indigo-300 w-10 h-10"></div>
          </div>

          <div tw="flex flex-col">
            <div tw="font-normal text-4xl text-[#4F4F4F] mb-5">{title}</div>
            <div tw="font-black	text-7xl">{description}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
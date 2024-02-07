import type { NextApiRequest } from "next";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function GET(
  req: NextApiRequest,
) {

  const { searchParams } = new URL(req.url);

  const title = searchParams.has("title") ? searchParams.get("title") : "Agora Proposal";
  const description = searchParams.has("description") ? searchParams.get("description") : "My default description";

  const interBoldFont = await fetch(
    new URL("../../../../assets/fonts/Inter-Bold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const interRegularFont = await fetch(
    new URL("../../../../assets/fonts/Inter-Regular.ttf", import.meta.url),
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
              <div tw="font-bold text-[68px] mb-6">{title}</div>
              <div tw="font-regular text-[42px] text-[#4F4F4F]">{description}</div>
            </div>
          </div>

          <div tw="flex w-1/2">
            <div tw="flex flex-col shadow-lg rounded-lg p-10 w-full">

              <div tw="flex mb-6">

                <div tw="flex">
                  <div tw="flex w-16 h-16 bg-gray-800 rounded-full"></div>
                  <div tw="flex flex-col justify-center ml-5">
                    <div tw="flex text-2xl font-bold mb-1">{title}</div>
                    <div tw="flex text-xl text-slate-600">{description}</div>
                  </div>
                </div>
              </div>

              <div tw="text-2xl text-slate-600">So much text here hello worls lsjdflskjf sljfsldkfjsdl;fksdj fsdkl;fsdjfl;kdsj</div>
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
    },
  );
}
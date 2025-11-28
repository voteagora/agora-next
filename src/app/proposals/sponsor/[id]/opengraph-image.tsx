import { ImageResponse } from "next/og";
import { LogoPill } from "@/app/api/images/og/assets/shared";
import { loadFont, loadImage } from "@/app/lib/utils/og";
import { TenantNamespace } from "@/lib/types";
import { prismaWeb2Client } from "@/app/lib/web2";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const getDraftProposal = async (id: number) => {

  const draftProposal = await prismaWeb2Client.proposalDraft.findUnique({
    where: {
      id: id,
    },
  });

  return draftProposal;
};

export default async function OGImage({ params }: { params: { id: string } }) {
  const id = params.id;

  const draftProposal = await getDraftProposal(parseInt(id));
  const title = draftProposal?.title || "Agora Proposal";

  const interBoldFont = await loadFont("Inter/Inter-Black.ttf");
  const interRegularFont = await loadFont("Inter/Inter-Medium.ttf");
  const bgImage = await loadImage("og-generic-bg.png");

  const namespace = (process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME ||
    "optimism") as TenantNamespace;

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
        <img src={bgImage} style={{ position: "absolute" }} />
        <div tw="flex h-full w-full px-[76px] pt-[70px] pb-[110px]">
          <div tw="flex flex-col justify-between h-full w-full">
            <LogoPill namespace={namespace} />
            <div tw="flex flex-col">
              <div tw="font-bold text-5xl w-full">Sponsor proposal request</div>
              <div tw="font-normal mt-[30px] text-4xl text-secondary">
                {title}
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

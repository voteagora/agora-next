import { getResultsProjectId } from "@/app/retropgf/actions";
import { redirect } from "next/navigation";
import RetroPGFApplicationBanner from "@/components/RetroPGF/RetroPGFApplicationBanner";
import RetroPGFApplicationContent from "@/components/RetroPGF/RetroPGFApplicationContent";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const retroPGFProject = await getResultsProjectId(id);

  if (!retroPGFProject) {
    redirect("/retropgf/3");
  }

  return (
    <div className="mt-8">
      <RetroPGFApplicationBanner retroPGFProject={retroPGFProject} />
      <RetroPGFApplicationContent retroPGFProject={retroPGFProject} />
    </div>
  );
}

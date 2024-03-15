import { getResultsProjectId } from "@/app/retropgf/actions";
import { redirect } from "next/navigation";
import RetroPGFApplicationBanner from "@/components/RetroPGF/RetroPGFApplicationBanner";
import RetroPGFApplicationContent from "@/components/RetroPGF/RetroPGFApplicationContent";
import Tenant from "@/lib/tenant/tenant";

export default async function Page({
                                     params: { id },
                                   }: {
  params: { id: string };
}) {

  const { ui } = Tenant.current();

  if (!ui.toggle("retropgf")) {
    return <div>Route not supported for namespace</div>;
  }

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

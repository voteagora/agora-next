import { fetchProjectsApi } from "@/app/api/common/projects/getProjects";

export async function GET(request: Request) {
  const projects = await fetchProjectsApi();
  return new Response(JSON.stringify(projects), {
    status: 200,
  });
}

import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const fp = path.join(process.cwd(), "spec/oas_v1.yaml");

  try {
    const data = fs.readFileSync(fp, "utf8");
    // set headers
    const headers = new Headers();
    headers.set("Content-Type", "application/x-yaml");

    return new Response(data, {
      headers,
      status: 200,
    });
  } catch (err) {
    if (err) {
      console.error(err);
      return new Response(JSON.stringify(`{result: "error"}`), {
        status: 500,
      });
    }
  }
}

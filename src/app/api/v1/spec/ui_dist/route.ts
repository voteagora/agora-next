import { SwaggerUIBundle, SwaggerUIStandalonePreset } from "swagger-ui-dist";

export async function GET(request: Request) {
  const ui = SwaggerUIBundle({
    url: "/api/v1/spec",
    dom_id: "#swagger-api",
    presets: [
      SwaggerUIStandalonePreset,
    ],
  });

  return new Response(ui, {
    headers: {
      "Content-Type": "text/html",
    },
    status: 200,
  });
}

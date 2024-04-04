export async function GET(request: Request) {
  return new Response(JSON.stringify(`{result: "success"}`), {
    status: 200,
  });
}

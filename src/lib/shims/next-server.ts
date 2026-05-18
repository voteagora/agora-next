/*
 * Vite shim for `next/server`.
 *
 * Only the subset used outside Next.js API routes is shimmed here.
 * NextResponse wraps the standard Response class; NextRequest wraps Request.
 * The .next() / .rewrite() middleware helpers are no-ops since TanStack Start
 * has its own middleware mechanism and src/middleware.ts is deleted in Phase F.
 */

export class NextResponse extends Response {
  static json<T>(data: T, init?: ResponseInit): NextResponse {
    const body = JSON.stringify(data);
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return new NextResponse(body, { ...init, headers });
  }

  static redirect(
    url: string | URL,
    init?: number | ResponseInit
  ): NextResponse {
    const status = typeof init === "number" ? init : (init?.status ?? 307);
    return new NextResponse(null, {
      status,
      headers: { Location: url.toString() },
    });
  }

  static next(_init?: ResponseInit): NextResponse {
    return new NextResponse(null, { status: 200 });
  }

  static rewrite(
    destination: string | URL,
    _init?: ResponseInit
  ): NextResponse {
    return new NextResponse(null, {
      headers: { "x-middleware-rewrite": destination.toString() },
    });
  }
}

export class NextRequest extends Request {
  readonly nextUrl: URL;

  constructor(input: string | URL | Request, init?: RequestInit) {
    super(input, init);
    this.nextUrl = new URL(
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    );
  }
}

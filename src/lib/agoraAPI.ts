class AgoraAPI {
  private bearerToken: string;

  constructor() {
    this.bearerToken = `Bearer ${process.env.NEXT_PUBLIC_AGORA_API_KEY}`;
  }

  async get(endpoint: string, version = "v1") {
    const res = await fetch(`/api/${version}${endpoint}`, {
      method: "GET",
      headers: {
        authorization: this.bearerToken,
      },
    });

    const data = await res.json();
    if (Object.keys(data).length === 0 && data.constructor === Object) {
      throw new Error("Can't find resource");
    }

    return data;
  }

  async post(
    endpoint: string,
    version = "v1",
    data?: unknown,
    extraHeaders: HeadersInit = {}
  ) {
    const headers = new Headers(extraHeaders);
    headers.set("authorization", this.bearerToken);
    headers.set("Content-Type", "application/json");

    const res = await fetch(`/api/${version}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res;
  }
}

export default AgoraAPI;

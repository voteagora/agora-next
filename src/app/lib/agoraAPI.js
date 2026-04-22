/**
 * AgoraAPI class provides a method to perform requests to the Agora API.
 */
class AgoraAPI {
  /**
   * Initializes a create instance of the AgoraAPI class.
   */
  constructor() {
    this.bearerToken = `Bearer ${process.env.NEXT_PUBLIC_AGORA_API_KEY}`;
  }

  /**
   * Performs a GET request to the Agora API.
   */
  async get(endpoint, version = "v1") {
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

  /**
   * POST request to the Agora API.
   */
  async post(endpoint, version = "v1", data, extraHeaders = {}) {
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

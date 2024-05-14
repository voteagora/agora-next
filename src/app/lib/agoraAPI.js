import { NextResponse } from "next/server";

/**
 * AgoraAPI class provides a method to perform requests to the Agora API.
 */
class AgoraAPI {
  /**
   * Initializes a new instance of the AgoraAPI class.
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
  async post(endpoint, version = "v1", data) {
    const res = await fetch(`/api/${version}${endpoint}`, {
      method: "POST",
      headers: {
        authorization: this.bearerToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.status === 201) {
      throw new Error(res.statusText);
    }

    return NextResponse.json({ data }, { status: 201 });
  }
}

export default AgoraAPI;

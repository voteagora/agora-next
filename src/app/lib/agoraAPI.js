import { NextResponse } from "next/server";

/**
 * AgoraAPI class provides a method to perform requests to the Agora API.
 */
class AgoraAPI {
  /**
   * Initializes a new instance of the AgoraAPI class.
   */
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AGORA_API_KEY;
    this.instanceToken = process.env.NEXT_PUBLIC_AGORA_INSTANCE_TOKEN;
    this.baseURL =
      process.env.NEXT_PUBLIC_AGORA_BASE_URL || "http://localhost:3000/api/v1";
  }

  /**
   * Performs a GET request to the Agora API.
   */
  async get(endpoint, instanceToken = this.instanceToken) {
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: {
        "agora-api-key": this.apiKey,
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
  async post(endpoint, data) {
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: {
        "agora-api-key": this.apiKey,
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

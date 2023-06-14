/**
 * AgoraAPI class provides a method to perform requests to the Agora API.
 */
class AgoraAPI {
  /**
   * Initializes a new instance of the AgoraAPI class.
   */
  constructor() {
    this.apiKey = process.env.AGORA_API_KEY;
    this.instanceToken = process.env.NEXT_PUBLIC_AGORA_INSTANCE_TOKEN;
    this.baseURL = process.env.AGORA_BASE_URL || "http://localhost:8000/api/v1";
  }

  /**
   * Performs a GET request to the Agora API.
   */
  async get(endpoint, instanceToken = this.instanceToken) {
    console.log(process.env.AGORA_INSTANCE_TOKEN);
    const res = await fetch(`${this.baseURL}/${instanceToken}${endpoint}`, {
      method: "GET",
      headers: {
        "agora-api-key": this.apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  }
}

export default AgoraAPI;

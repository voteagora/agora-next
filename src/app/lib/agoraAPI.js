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
    this.baseURL = process.env.NEXT_PUBLIC_AGORA_BASE_URL;
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

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  }
}

export default AgoraAPI;

/**
 * AgoraAPI class provides a method to perform requests to the Agora API.
 */
export class AgoraAPI {
  /**
   * Performs a GET request to the Agora API.
   */
  static async get(endpoint: string) {
    const res = await fetch(`http://localhost:8000/api/v1${endpoint}`, {
      method: "GET",
      headers: {
        "agora-api-key": process.env.AGORA_API_KEY!
      },
      cache: "no-store"
    })

    if (!res.ok) {
      throw new Error(res.statusText)
    }

    return res.json()
  }
}

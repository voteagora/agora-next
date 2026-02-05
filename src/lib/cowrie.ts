type CowrieCheckResponse = {
  completed?: boolean;
};

const DEFAULT_BASE_URL = "https://api.cowrie.io";
const CHECK_PATH = "/check";
const REQUEST_TIMEOUT_MS = 10_000;
let missingConfigLogged = false;

export const checkCowrieVerification = async (
  address: string
): Promise<boolean | null> => {
  const clientSecret = process.env.COWRIE_CLIENT_SECRET;
  const baseUrl = process.env.COWRIE_BASE_URL || DEFAULT_BASE_URL;

  if (!clientSecret) {
    if (!missingConfigLogged) {
      console.warn(
        "Cowrie client secret missing, skipping verification check."
      );
      missingConfigLogged = true;
    }
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${CHECK_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: clientSecret,
      },
      body: JSON.stringify({ address }),
      signal: controller.signal,
    });

    if (response.status === 400) {
      console.warn("Cowrie verification invalid address payload");
      return false;
    }

    if (response.status === 401) {
      console.error("Cowrie verification unauthorized: check client secret");
      return null;
    }

    if (!response.ok) {
      console.error("Cowrie verification request failed", response.statusText);
      return null;
    }

    const payload = (await response.json()) as CowrieCheckResponse;
    return payload?.completed === true;
  } catch (error) {
    console.error("Cowrie verification request threw", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

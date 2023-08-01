// TODO
// Add fallback to Ethers if this is slow, or not responding.
// Pull out into another library
export async function resolveENSName(ensName) {
  const query = `
    query {
      ensProfiles(
        filters: {
          name: "${ensName}"
        }
      ) {
        addresses {
          address
          coinType
        }
        attributes {
          textKey
          textValue
        }
        contenthash
        name
        owner
      }
    }
  `;

  // TODO
  // Remove hardcode and make sure that we have a more flexible way of doing this in case we
  // get shut down
  const url = "https://query.indexing.co/graphql";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  };

  const response = await fetch(url, options);
  const data = await response.json();
  // TODO: Build a type or model around this. Feels ugly
  const address = data.data.ensProfiles[0].addresses[0]["address"];

  return address;
}

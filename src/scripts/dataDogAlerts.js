require("dotenv").config({ path: ".env.local" });
const axios = require("axios");

// DataDog API configuration
const DD_API_KEY = process.env.DD_API_KEY;
const DD_APP_KEY = process.env.DD_APP_KEY;
const DD_API_URL = "https://api.datadoghq.com/api/v1";

async function createAlert(alertConfig) {
  try {
    const response = await axios.post(`${DD_API_URL}/monitor`, alertConfig, {
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": DD_API_KEY,
        "DD-APPLICATION-KEY": DD_APP_KEY,
      },
    });

    console.log(`Alert "${alertConfig.name}" created successfully!`);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating DataDog alert:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function updateAlert(monitorId, alertConfig) {
  try {
    const response = await axios.put(
      `${DD_API_URL}/monitor/${monitorId}`,
      alertConfig,
      {
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": DD_API_KEY,
          "DD-APPLICATION-KEY": DD_APP_KEY,
        },
      }
    );

    console.log(`Alert ID ${monitorId} updated successfully!`);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating DataDog alert:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function createOrUpdateApiErrorRateAlert({
  name,
  service,
  threshold = 0.2,
  windowMinutes = 15,
  rollupSeconds = 1200,
  message = "Datadog Alert @slack-alerts-channel",
  additionalOptions = {},
  monitorId = null,
}) {
  if (!service) {
    throw new Error("Service name is required for API error rate alert");
  }

  const query = `avg(last_${windowMinutes}m):sum:${service}.api.requests{result:error,env:production}.rollup(count, ${rollupSeconds}) / sum:${service}.api.requests{env:production}.rollup(count, ${rollupSeconds}) > ${threshold}`;

  const alertConfig = {
    name: name || `${service} API error rate over ${threshold * 100}%`,
    type: "query alert",
    query: query,
    message: message,
    options: {
      thresholds: {
        critical: threshold,
      },
      notify_audit: false,
      on_missing_data: "default",
      include_tags: false,
      new_host_delay: 300,
      evaluation_delay: 900,
      ...additionalOptions,
    },
  };

  if (monitorId) {
    return updateAlert(monitorId, alertConfig);
  } else {
    return createAlert(alertConfig);
  }
}

async function createOrUpdateApiEndpointErrorRateAlert({
  name,
  service,
  apiEndpoint,
  threshold = 0.2,
  windowMinutes = 15,
  rollupSeconds = 1200,
  message = "Datadog Alert @slack-alerts-channel",
  additionalOptions = {},
  monitorId = null,
}) {
  if (!service) {
    throw new Error("Service name is required for API error rate alert");
  }

  if (!apiEndpoint) {
    throw new Error(
      "API endpoint name is required for endpoint error rate alert"
    );
  }

  const query = `avg(last_${windowMinutes}m):sum:${service}.api.requests{result:error,env:production,api:${apiEndpoint}}.rollup(count, ${rollupSeconds}) / sum:${service}.api.requests{env:production,api:${apiEndpoint}}.rollup(count, ${rollupSeconds}) > ${threshold}`;

  const alertConfig = {
    name:
      name ||
      `${service} ${apiEndpoint} API error rate over ${threshold * 100}%`,
    type: "query alert",
    query: query,
    message: message,
    options: {
      thresholds: {
        critical: threshold,
      },
      notify_audit: false,
      on_missing_data: "default",
      include_tags: false,
      new_host_delay: 300,
      ...additionalOptions,
    },
  };

  if (monitorId) {
    return updateAlert(monitorId, alertConfig);
  } else {
    return createAlert(alertConfig);
  }
}

async function getAllMonitors(options = {}) {
  try {
    const queryParams = new URLSearchParams(options).toString();
    const url = `${DD_API_URL}/monitor${queryParams ? `?${queryParams}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": DD_API_KEY,
        "DD-APPLICATION-KEY": DD_APP_KEY,
      },
    });

    console.log(`Retrieved ${response.data.length} monitors`);
    return response.data;
  } catch (error) {
    console.error(
      "Error retrieving DataDog monitors:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function findMonitorsByName(namePattern) {
  const monitors = await getAllMonitors();
  const matchingMonitors = monitors.filter((monitor) =>
    monitor.name.toLowerCase().includes(namePattern.toLowerCase())
  );

  console.log(
    `Found ${matchingMonitors.length} monitors matching "${namePattern}"`
  );
  return matchingMonitors;
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    if (!DD_API_KEY) {
      throw new Error(
        "DataDog API key not found. Please check your .env file."
      );
    }

    if (!DD_APP_KEY) {
      console.warn("DataDog APP key not found. Some API operations may fail.");
    }

    // Check for existing Optimism alerts
    const existingOptimismAlerts = await findMonitorsByName(
      "Optimism ALL API error rate"
    );
    let optimismMonitorId = null;
    if (existingOptimismAlerts.length > 0) {
      optimismMonitorId = existingOptimismAlerts[0].id;
      console.log(
        `Found existing Optimism alert with ID: ${optimismMonitorId}`
      );
    }

    // Check for existing Uniswap alerts
    const existingUniswapAlerts = await findMonitorsByName(
      "Uniswap ALL API error rate"
    );
    let uniswapMonitorId = null;
    if (existingUniswapAlerts.length > 0) {
      uniswapMonitorId = existingUniswapAlerts[0].id;
      console.log(`Found existing Uniswap alert with ID: ${uniswapMonitorId}`);
    }

    // Check for existing ENS alerts
    const existingEnsAlerts = await findMonitorsByName(
      "ENS ALL API error rate"
    );
    let ensMonitorId = null;
    if (existingEnsAlerts.length > 0) {
      ensMonitorId = existingEnsAlerts[0].id;
      console.log(`Found existing ENS alert with ID: ${ensMonitorId}`);
    }

    // Check for existing Scroll alerts
    const existingScrollAlerts = await findMonitorsByName(
      "Scroll ALL API error rate"
    );
    let scrollMonitorId = null;
    if (existingScrollAlerts.length > 0) {
      scrollMonitorId = existingScrollAlerts[0].id;
      console.log(`Found existing Scroll alert with ID: ${scrollMonitorId}`);
    }

    // Check for existing Cyber alerts
    const existingCyberAlerts = await findMonitorsByName(
      "Cyber ALL API error rate"
    );
    let cyberMonitorId = null;
    if (existingCyberAlerts.length > 0) {
      cyberMonitorId = existingCyberAlerts[0].id;
      console.log(`Found existing Cyber alert with ID: ${cyberMonitorId}`);
    }

    // Define API endpoints to monitor with custom thresholds
    const apiEndpoints = [
      "getvoterstats",
      "getdelegate",
      "getproposals",
      "getcurrentdelegateesforaddress",
      "getvotesforproposal",
      "getproposal",
      "getvotesfordelegateforaddress",
      "getcurrentdelegatorsforaddress",
      "getsnapshotvotesfordelegateforaddress",
      "getdelegates",
      "getdraftproposals",
      "getalldelegatorsinchainsforaddress",
      "getdraftproposalforsponsor",
      "getneedsmyvoteproposals",
      "getvotesforproposalanddelegate",
      "getvotingpowerforproposalbyaddress",
      "getuservotesforproposal",
      "getdirectdelegateeforaddress",
      "getvoterswhohavenotvotedforproposal",
      "getvotingpoweravailablefordirectdelegationforaddress",
      "getproposaltypes",
      "isaddressdelegatingtoproxy",
      "getproxyaddressforaddress",
      "getvotingpoweravailableforsubdelegationforaddress",
      "getcurrentadvanceddelegatorsforaddress",
    ];

    // Configuration for service-wide and endpoint-specific thresholds
    const serviceConfig = {
      Optimism: {
        key: "agora_next.optimism",
        overallThreshold: 0.2,
        endpoints: {
          getvoterstats: 0.2,
          getdelegate: 0.4,
          getproposals: 0.2,
          getcurrentdelegateesforaddress: 0.2,
          getvotesforproposal: 0.2,
          getproposal: 0.5,
          getvotesfordelegateforaddress: 0.2,
          getcurrentdelegatorsforaddress: 0.2,
          getsnapshotvotesfordelegateforaddress: 0.2,
          getdelegates: 0.2,
          getdraftproposals: 0.2,
          getalldelegatorsinchainsforaddress: 0.2,
          getdraftproposalforsponsor: 0.2,
          getneedsmyvoteproposals: 0.2,
          getvotesforproposalanddelegate: 0.2,
          getvotingpowerforproposalbyaddress: 0.2,
          getuservotesforproposal: 0.2,
          getdirectdelegateeforaddress: 0.2,
          getvoterswhohavenotvotedforproposal: 0.2,
          getvotingpoweravailablefordirectdelegationforaddress: 0.2,
          getproposaltypes: 0.2,
          isaddressdelegatingtoproxy: 0.2,
          getproxyaddressforaddress: 0.2,
          getvotingpoweravailableforsubdelegationforaddress: 0.2,
          getcurrentadvanceddelegatorsforaddress: 0.2,
        },
      },
      Uniswap: {
        key: "agora_next.uniswap",
        overallThreshold: 0.2,
        endpoints: {
          getvoterstats: 0.2,
          getdelegate: 0.5,
          getproposals: 0.3,
          getcurrentdelegateesforaddress: 0.2,
          getvotesforproposal: 0.2,
          getproposal: 0.5,
          getvotesfordelegateforaddress: 0.2,
          getcurrentdelegatorsforaddress: 0.2,
          getsnapshotvotesfordelegateforaddress: 0.2,
          getdelegates: 0.2,
          getdraftproposals: 0.2,
          getalldelegatorsinchainsforaddress: 0.2,
          getdraftproposalforsponsor: 0.2,
          getneedsmyvoteproposals: 0.2,
          getvotesforproposalanddelegate: 0.2,
          getvotingpowerforproposalbyaddress: 0.2,
          getuservotesforproposal: 0.2,
          getdirectdelegateeforaddress: 0.2,
          getvoterswhohavenotvotedforproposal: 0.2,
          getvotingpoweravailablefordirectdelegationforaddress: 0.2,
          getproposaltypes: 0.2,
          isaddressdelegatingtoproxy: 0.2,
          getproxyaddressforaddress: 0.2,
          getvotingpoweravailableforsubdelegationforaddress: 0.2,
          getcurrentadvanceddelegatorsforaddress: 0.2,
        },
      },
      ENS: {
        key: "agora_next.ens",
        overallThreshold: 0.2,
        endpoints: {
          getvoterstats: 0.2,
          getdelegate: 0.3,
          getproposals: 0.5,
          getcurrentdelegateesforaddress: 0.2,
          getvotesforproposal: 0.2,
          getproposal: 0.3,
          getvotesfordelegateforaddress: 0.2,
          getcurrentdelegatorsforaddress: 0.2,
          getsnapshotvotesfordelegateforaddress: 0.2,
          getdelegates: 0.2,
          getdraftproposals: 0.2,
          getalldelegatorsinchainsforaddress: 0.2,
          getdraftproposalforsponsor: 0.2,
          getneedsmyvoteproposals: 0.2,
          getvotesforproposalanddelegate: 0.2,
          getvotingpowerforproposalbyaddress: 0.2,
          getuservotesforproposal: 0.2,
          getdirectdelegateeforaddress: 0.2,
          getvoterswhohavenotvotedforproposal: 0.2,
          getvotingpoweravailablefordirectdelegationforaddress: 0.2,
          getproposaltypes: 0.2,
          isaddressdelegatingtoproxy: 0.2,
          getproxyaddressforaddress: 0.2,
          getvotingpoweravailableforsubdelegationforaddress: 0.2,
          getcurrentadvanceddelegatorsforaddress: 0.2,
        },
      },
      Scroll: {
        key: "agora_next.scroll",
        overallThreshold: 0.2,
        endpoints: {
          getvoterstats: 0.2,
          getdelegate: 0.5,
          getproposals: 0.2,
          getcurrentdelegateesforaddress: 0.2,
          getvotesforproposal: 0.2,
          getproposal: 0.5,
          getvotesfordelegateforaddress: 0.2,
          getcurrentdelegatorsforaddress: 0.2,
          getsnapshotvotesfordelegateforaddress: 0.2,
          getdelegates: 0.2,
          getdraftproposals: 0.2,
          getalldelegatorsinchainsforaddress: 0.2,
          getdraftproposalforsponsor: 0.2,
          getneedsmyvoteproposals: 0.2,
          getvotesforproposalanddelegate: 0.2,
          getvotingpowerforproposalbyaddress: 0.2,
          getuservotesforproposal: 0.2,
          getdirectdelegateeforaddress: 0.2,
          getvoterswhohavenotvotedforproposal: 0.2,
          getvotingpoweravailablefordirectdelegationforaddress: 0.2,
          getproposaltypes: 0.2,
          isaddressdelegatingtoproxy: 0.2,
          getproxyaddressforaddress: 0.2,
          getvotingpoweravailableforsubdelegationforaddress: 0.2,
          getcurrentadvanceddelegatorsforaddress: 0.2,
        },
      },
      Cyber: {
        key: "agora_next.cyber",
        overallThreshold: 0.2,
        endpoints: {
          getvoterstats: 0.2,
          getdelegate: 0.4,
          getproposals: 0.2,
          getcurrentdelegateesforaddress: 0.2,
          getvotesforproposal: 0.2,
          getproposal: 0.2,
          getvotesfordelegateforaddress: 0.2,
          getcurrentdelegatorsforaddress: 0.2,
          getsnapshotvotesfordelegateforaddress: 0.2,
          getdelegates: 0.2,
          getdraftproposals: 0.2,
          getalldelegatorsinchainsforaddress: 0.2,
          getdraftproposalforsponsor: 0.2,
          getneedsmyvoteproposals: 0.2,
          getvotesforproposalanddelegate: 0.2,
          getvotingpowerforproposalbyaddress: 0.2,
          getuservotesforproposal: 0.2,
          getdirectdelegateeforaddress: 0.2,
          getvoterswhohavenotvotedforproposal: 0.2,
          getvotingpoweravailablefordirectdelegationforaddress: 0.2,
          getproposaltypes: 0.2,
          isaddressdelegatingtoproxy: 0.2,
          getproxyaddressforaddress: 0.2,
          getvotingpoweravailableforsubdelegationforaddress: 0.2,
          getcurrentadvanceddelegatorsforaddress: 0.2,
        },
      },
    };

    // Create or update the overall service alerts
    const monitorIds = {
      Optimism: optimismMonitorId,
      Uniswap: uniswapMonitorId,
      ENS: ensMonitorId,
      Scroll: scrollMonitorId,
      Cyber: cyberMonitorId,
    };

    // Create overall service alerts
    for (const [serviceName, config] of Object.entries(serviceConfig)) {
      await createOrUpdateApiErrorRateAlert({
        name: `${serviceName} ALL API error rate over ${config.overallThreshold * 100}%`,
        service: config.key,
        threshold: config.overallThreshold,
        message: `${serviceName} API error rate is too high! @slack-carls-test`,
        monitorId: monitorIds[serviceName],
      });
    }

    // Now create or update endpoint-specific alerts for each service
    for (const [serviceName, config] of Object.entries(serviceConfig)) {
      for (const endpoint of apiEndpoints) {
        // Get the custom threshold for this endpoint, or use the overall threshold as fallback
        const threshold = config.endpoints[endpoint] || config.overallThreshold;

        // Check for existing endpoint-specific alerts
        const existingAlerts = await findMonitorsByName(
          `${serviceName} ${endpoint} API error rate`
        );

        let monitorId = null;
        if (existingAlerts.length > 0) {
          monitorId = existingAlerts[0].id;
          console.log(
            `Found existing ${serviceName} ${endpoint} alert with ID: ${monitorId}`
          );
        }

        await createOrUpdateApiEndpointErrorRateAlert({
          name: `${serviceName} ${endpoint} API error rate over ${threshold * 100}%`,
          service: config.key,
          apiEndpoint: endpoint,
          threshold: threshold,
          message: `${serviceName} ${endpoint} API error rate is too high! @slack-carls-test`,
          monitorId: monitorId,
        });
      }
    }

    console.log("All alerts created or updated successfully!");
  } catch (error) {
    console.error("Error in main function:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

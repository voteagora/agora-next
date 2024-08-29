export function setEnv(envConfig: { [key: string]: string }) {
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}

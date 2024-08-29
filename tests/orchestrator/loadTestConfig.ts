import fs from "fs";
import yaml from "js-yaml";

export function loadConfig() {
  const fileContents = fs.readFileSync("tenant-config.yml", "utf8");
  return yaml.load(fileContents);
}

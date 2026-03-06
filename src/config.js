import fs from "fs";
import os from "os";
import path from "path";

const configPath = path.join(".gcommit.json");

export function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    return {};
  }
}

export function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

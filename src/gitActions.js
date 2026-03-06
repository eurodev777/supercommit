import { execSync } from "child_process";

export function gitAdd() {
  // limpa o stage
  execSync("git reset", { stdio: "inherit" });
  execSync("git add .", { stdio: "inherit" });
}

export function gitCommit(message) {
  execSync(`git commit -m "${message}"`, { stdio: "inherit" });
}

export function gitPush(branch) {
  execSync(`git push origin ${branch}`, { stdio: "inherit" });
}

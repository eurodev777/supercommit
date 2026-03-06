import { execSync } from "child_process";
import inquirer from "inquirer";
import { loadConfig, saveConfig } from "./config.js";

export async function checkGit(branch = "master") {
  const config = loadConfig();
  let repo = config.repo || "";

  // 1️⃣ Verifica se estamos dentro de um repositório Git
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    console.log("✅ Repositório Git encontrado.");
  } catch {
    console.log("❌ Nenhum repositório Git encontrado. Inicializando...");
    try {
      execSync("git init", { stdio: "inherit" });
      console.log("✅ Repositório Git inicializado com sucesso!");
    } catch (err) {
      console.error("❌ Falha ao inicializar o repositório Git:", err.message);
      return false;
    }
  }

  // 2️⃣ Pergunta pelo repositório remoto se não tiver
  if (!repo) {
    const answer = await inquirer.prompt([
      {
        name: "repo",
        message: "Digite o SSH do repositório (ou ENTER para ignorar):",
        default: "",
      },
    ]);
    repo = answer.repo;
  }

  // 3️⃣ Adiciona o remoto se fornecido
  if (repo) {
    try {
      const remotes = execSync("git remote", { stdio: "pipe" }).toString();
      if (!remotes.includes("origin")) {
        execSync(`git remote add origin ${repo}`, { stdio: "inherit" });
        console.log(`✅ Repositório remoto adicionado: ${repo}`);
      } else {
        console.log(`ℹ Repositório remoto 'origin' já existe.`);
      }
      saveConfig({ ...config, repo });
    } catch (err) {
      console.error("❌ Falha ao adicionar remoto:", err.message);
      return false;
    }

    // 4️⃣ Certifica que a branch local existe
    try {
      execSync(`git checkout ${branch}`, { stdio: "inherit" });
    } catch {
      execSync(`git checkout -b ${branch}`, { stdio: "inherit" });
    }

    // 5️⃣ Verifica se o remoto tem commits nessa branch
    let remoteHasCommits = false;
    try {
      const lsRemote = execSync(`git ls-remote --heads origin ${branch}`, {
        stdio: "pipe",
      })
        .toString()
        .trim();
      if (lsRemote) remoteHasCommits = true;
    } catch {
      remoteHasCommits = false;
    }

    // 6️⃣ Só faz pull --rebase se o remoto tiver commits
    if (remoteHasCommits) {
      try {
        execSync(`git pull --rebase origin ${branch}`, { stdio: "inherit" });
        console.log("✅ Histórico remoto sincronizado com sucesso!");
      } catch (err) {
        console.log(
          "⚠ Atenção: houve conflito ao rebasing. Resolva manualmente e depois rode 'git rebase --continue'.",
        );
      }
    } else {
      console.log(
        "ℹ Repositório remoto vazio ou branch não encontrada. Continuando sem pull...",
      );
    }
  }

  return true;
}

import inquirer from "inquirer";
import { execSync } from "child_process";
import { loadConfig, saveConfig } from "./config.js";

const types = [
  { name: "🚀 feat - Nova funcionalidade", value: "🚀 feat" },
  { name: "🐛 fix - Correção de bug", value: "🐛 fix" },
  { name: "📚 docs - Documentação", value: "📚 docs" },
  { name: "♻️ refactor - Refatoração", value: "♻️ refactor" },
  { name: "⚡ perf - Performance", value: "⚡ perf" },
  { name: "🎨 style - Formatação", value: "🎨 style" },
  { name: "🧪 test - Testes", value: "🧪 test" },
  { name: "🔧 chore - Tarefas internas", value: "🔧 chore" },
];

export async function runCommitFlow() {
  const config = loadConfig();

  const { type } = await inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "Escolha o tipo de commit:",
      choices: types,
    },
  ]);

  const { desc } = await inquirer.prompt([
    {
      name: "desc",
      message: "Digite a descrição do commit:",
      validate: (input) =>
        input.trim() !== "" || "A descrição não pode ficar vazia!",
    },
  ]);

  // Escolha da branch
  let branch = config.branch || "master";
  const { useBranch } = await inquirer.prompt([
    {
      type: "input",
      name: "useBranch",
      message: `Digite a branch para commit [${branch}]:`,
      default: branch,
    },
  ]);
  branch = useBranch;
  saveConfig({ ...config, branch });

  const message = `${type}: ${desc}`;

  try {
    execSync("git add .", { stdio: "inherit" });
    execSync(`git commit -m "${message}"`, { stdio: "inherit" });
  } catch (err) {
    console.error("❌ Erro ao criar commit:", err.message);
    return;
  }

  function gitPush(branch = "master") {
    try {
      console.log(`🚀 Tentando push normal...`);
      execSync("git push", { stdio: "inherit" });
      console.log("✅ Push realizado com sucesso!");
    } catch {
      try {
        console.log(
          `⚡ Push falhou. Tentando definir upstream para '${branch}'...`,
        );
        execSync(`git push -u origin ${branch}`, { stdio: "inherit" });
        console.log("✅ Push com upstream definido realizado com sucesso!");
      } catch {
        try {
          console.log(
            `🔥 Push ainda falhou. Tentando push forçado seguro (--force-with-lease)...`,
          );
          execSync(`git push -u origin ${branch} --force-with-lease`, {
            stdio: "inherit",
          });
          console.log("✅ Push forçado seguro realizado com sucesso!");
        } catch (err) {
          console.error("❌ Falha ao enviar para o remoto:", err.message);
        }
      }
    }
  }
  // Exemplo de uso:
  gitPush(branch);
}

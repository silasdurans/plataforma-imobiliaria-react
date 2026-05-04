import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const backendEnvPath = resolve(repoRoot, "backend/.env");
const envExamplePath = resolve(repoRoot, "backend/.env.example");

const parseEnvFile = (filepath) => {
  if (!existsSync(filepath)) {
    return {};
  }

  return readFileSync(filepath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        return acc;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
};

const env = {
  ...parseEnvFile(envExamplePath),
  ...parseEnvFile(backendEnvPath),
  ...process.env,
};

const ollamaBaseUrl = env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const ollamaModel = env.OLLAMA_MODEL || "qwen2.5:3b";
const backendPort = env.PORT || "3001";
const backendBaseUrl = env.BACKEND_BASE_URL || `http://127.0.0.1:${backendPort}`;
const strictMode = process.argv.includes("--strict");

const fail = (message) => {
  console.error(`\n[dev:ai] ${message}\n`);
  process.exit(1);
};

const warn = (message) => {
  console.warn(`\n[dev:ai] ${message}\n`);
};

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const hasOllamaBinary = () => {
  const result = spawnSync("bash", ["-lc", "command -v ollama"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  return result.status === 0 && Boolean(result.stdout.trim());
};

const fetchOllamaTags = async () => {
  const response = await fetch(`${ollamaBaseUrl}/api/tags`);

  if (!response.ok) {
    throw new Error(`Ollama respondeu com status ${response.status}.`);
  }

  return response.json();
};

const isBackendAlreadyRunning = async () => {
  try {
    const response = await fetch(`${backendBaseUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};

const startBackend = (mode = "ai") => {
  if (mode === "fallback") {
    console.log("[dev:ai] Backend iniciado em modo fallback local.");
  } else {
    console.log(`[dev:ai] Ollama pronto com o modelo ${ollamaModel}. Subindo backend...`);
  }

  const child = spawn("npm", ["--prefix", "backend", "run", "dev"], {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
};

const startBackendWithFallback = (message) => {
  warn(`${message} Subindo backend mesmo assim com fallback local da busca.`);
  startBackend("fallback");
};

if (await isBackendAlreadyRunning()) {
  console.log(`[dev:ai] Backend ja esta ativo em ${backendBaseUrl}. Reutilizando processo existente.`);
  process.exit(0);
}

let payload;

try {
  payload = await fetchOllamaTags();
} catch {
  if (!hasOllamaBinary()) {
    if (strictMode) {
      fail("Ollama nao esta instalado. Instale primeiro e depois rode 'npm run dev:full' novamente.");
    }

    startBackendWithFallback("Ollama nao esta instalado.");
    process.exit(0);
  }

  console.log("[dev:ai] Ollama instalado, mas ainda nao esta ativo. Tentando iniciar 'ollama serve'...");

  const child = spawn("ollama", ["serve"], {
    cwd: repoRoot,
    stdio: "ignore",
    detached: true,
  });

  child.unref();

  let lastError = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    await sleep(1000);

    try {
      payload = await fetchOllamaTags();
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    if (strictMode) {
      fail(`Nao foi possivel conectar em ${ollamaBaseUrl}. Rode 'ollama serve' e tente novamente.`);
    }

    startBackendWithFallback(`Nao foi possivel conectar em ${ollamaBaseUrl}.`);
    process.exit(0);
  }
}

const models = Array.isArray(payload?.models) ? payload.models : [];
const hasModel = models.some((item) => item?.name === ollamaModel);

if (!hasModel) {
  if (strictMode) {
    fail(`Modelo ${ollamaModel} nao encontrado. Rode: ollama pull ${ollamaModel}`);
  }

  startBackendWithFallback(`Modelo ${ollamaModel} nao encontrado.`);
  process.exit(0);
}

startBackend();

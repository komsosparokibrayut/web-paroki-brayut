const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCommand(cmd) {
  try {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`Failed to run`);
  }
}

const envPath = path.resolve(__dirname, "../.env.local");
const content = fs.readFileSync(envPath, "utf-8");
const lines = content.split("\n");

let currentKey = "";
let currentValue = "";
let inMultiLine = false;

const firebaseKeys = {};

for (const line of lines) {
  if (inMultiLine) {
    currentValue += "\n" + line;
    if (line.includes('"') && !line.endsWith("\\")) {
      firebaseKeys[currentKey] = currentValue.replace(/^"|"$/g, "");
      inMultiLine = false;
    }
    continue;
  }

  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;

  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;

  currentKey = trimmed.substring(0, eqIdx).trim();
  currentValue = trimmed.substring(eqIdx + 1).trim();

  if (currentValue.startsWith('"') && !currentValue.endsWith('"')) {
    inMultiLine = true;
    continue;
  }

  if (currentValue.startsWith('"') && currentValue.endsWith('"')) {
    currentValue = currentValue.slice(1, -1);
  }

  // We only want to push FIREBASE related keys AND the Github Key too since we removed it globally
  if (currentKey.includes("FIREBASE") || currentKey === "GITHUB_APP_PRIVATE_KEY") {
    firebaseKeys[currentKey] = currentValue;
  }
}

// Clean TEST_KEY
runCommand('npx vercel env rm TEST_KEY preview -y');

for (const [key, value] of Object.entries(firebaseKeys)) {
  try {
    const tmpFile = path.resolve(__dirname, `../.tmp-env-${key}.txt`);
    fs.writeFileSync(tmpFile, value);
    console.log(`Adding ${key} to preview...`);
    // Note the explicit empty string `""` at the end for git branch
    execSync(`npx vercel env add ${key} preview "" -y < "${tmpFile}"`, { stdio: "inherit" });
    fs.unlinkSync(tmpFile);
  } catch (err) {
    console.error(`Failed to add ${key} to preview`);
  }
}

console.log("Finished updating Vercel preview environment variables!");

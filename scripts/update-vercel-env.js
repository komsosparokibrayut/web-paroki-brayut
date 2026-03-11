const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCommand(cmd) {
  try {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`Failed to run: ${cmd}`);
    // Ignore errors for `rm` since keys might not exist
  }
}

const environments = ["production", "preview", "development"];

// 1. Remove Clerk keys
const clerkKeys = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"
];

for (const key of clerkKeys) {
  for (const env of environments) {
    runCommand(`npx vercel env rm ${key} ${env} -y`);
  }
}

// 2. Parse .env.local and add Firebase keys
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

  // We only want to push FIREBASE related keys
  if (currentKey.includes("FIREBASE")) {
    firebaseKeys[currentKey] = currentValue;
  }
}

// 3. Add Firebase keys
for (const [key, value] of Object.entries(firebaseKeys)) {
  for (const env of environments) {
    // We first remove it to overwrite safely if it already exists
    runCommand(`npx vercel env rm ${key} ${env} -y`);

    try {
      const tmpFile = path.resolve(__dirname, `../.tmp-env-${key}.txt`);
      fs.writeFileSync(tmpFile, value);
      console.log(`Adding ${key} to ${env}...`);
      execSync(`npx vercel env add ${key} ${env} < "${tmpFile}"`, { stdio: "inherit" });
      fs.unlinkSync(tmpFile);
    } catch (err) {
      console.error(`Failed to add ${key} to ${env}`);
    }
  }
}

console.log("Finished updating Vercel environment variables!");

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "NebulaNotes";

// <root>/fhevm-hardhat-template
const rel = "../fhevm-hardhat-template";

// <root>/nebulanotes-frontend/abi
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

// Check if we're in a CI/CD environment (like Vercel) where deployment files might not exist
const isCI = process.env.CI || process.env.VERCEL || process.env.VERCEL_ENV;

if (!fs.existsSync(dir)) {
  if (isCI) {
    console.warn(
      `${line}Warning: Unable to locate ${rel} in CI environment. Using existing ABI files if available.${line}`
    );
    // Check if ABI files already exist
    const abiFile = path.join(outdir, `${CONTRACT_NAME}ABI.ts`);
    const addressesFile = path.join(outdir, `${CONTRACT_NAME}Addresses.ts`);
    if (fs.existsSync(abiFile) && fs.existsSync(addressesFile)) {
      console.log(`Using existing ABI files: ${abiFile}, ${addressesFile}`);
      process.exit(0);
    }
  }
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/${dirname}${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function deployOnHardhatNode() {
  if (process.platform === "win32") {
    // Not supported on Windows
    return;
  }
  try {
    execSync(`./deploy-hardhat-node.sh`, {
      cwd: path.resolve("./scripts"),
      stdio: "inherit",
    });
  } catch (e) {
    console.error(`${line}Script execution failed: ${e}${line}`);
    process.exit(1);
  }
}

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir) && chainId === 31337) {
    // Try to auto-deploy the contract on hardhat node!
    deployOnHardhatNode();
  }

  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Auto deployed on Linux/Mac (will fail on windows)
// In CI environments, make localhost optional too
const deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, isCI /* optional in CI */);

// Sepolia is optional
let deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true /* optional */);

// If we're in CI and don't have deployments, try to use existing ABI files
if (isCI && !deployLocalhost) {
  const abiFile = path.join(outdir, `${CONTRACT_NAME}ABI.ts`);
  const addressesFile = path.join(outdir, `${CONTRACT_NAME}Addresses.ts`);
  if (fs.existsSync(abiFile) && fs.existsSync(addressesFile)) {
    console.log(`CI environment: Using existing ABI files`);
    process.exit(0);
  }
  console.error(`${line}No deployment files found and no existing ABI files in CI environment.${line}`);
  process.exit(1);
}

if (!deploySepolia) {
  deploySepolia = { abi: deployLocalhost.abi, address: "0x0000000000000000000000000000000000000000" };
}

if (deployLocalhost && deploySepolia) {
  if (
    JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)
  ) {
    console.error(
      `${line}Deployments on localhost and Sepolia differ. Cant use the same abi on both networks. Consider re-deploying the contracts on both networks.${line}`
    );
    process.exit(1);
  }
}


const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: deployLocalhost.abi }, null, 2)} as const;
\n`;
const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = {
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" },
};
`;

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);
console.log(tsAddresses);

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);


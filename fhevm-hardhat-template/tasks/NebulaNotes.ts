import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact with NebulaNotes (--network localhost)
 * ===================================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the NebulaNotes contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the NebulaNotes contract
 *
 *   npx hardhat --network localhost task:add-note --title "My Note" --content "Note content" --tags "personal"
 *   npx hardhat --network localhost task:get-note-count
 *   npx hardhat --network localhost task:get-note-meta --index 0
 *   npx hardhat --network localhost task:decrypt-title --index 0
 *   npx hardhat --network localhost task:decrypt-content --index 0
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the NebulaNotes contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the NebulaNotes contract
 *
 *   npx hardhat --network sepolia task:add-note --title "My Note" --content "Note content" --tags "personal"
 *   npx hardhat --network sepolia task:get-note-count
 *   npx hardhat --network sepolia task:get-note-meta --index 0
 *   npx hardhat --network sepolia task:decrypt-title --index 0
 *   npx hardhat --network sepolia task:decrypt-content --index 0
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:nebula-address
 *   - npx hardhat --network sepolia task:nebula-address
 */
task("task:nebula-address", "Prints the NebulaNotes address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const nebulaNotes = await deployments.get("NebulaNotes");

  console.log("NebulaNotes address is " + nebulaNotes.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:add-note --title "My Title" --content "My Content" --tags "personal,work"
 *   - npx hardhat --network sepolia task:add-note --title "My Title" --content "My Content" --tags "personal"
 */
task("task:add-note", "Adds an encrypted note to NebulaNotes")
  .addOptionalParam("address", "Optionally specify the NebulaNotes contract address")
  .addParam("title", "The note title")
  .addParam("content", "The note content")
  .addParam("tags", "The note tags")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const NebulaNotesDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("NebulaNotes");
    console.log(`NebulaNotes: ${NebulaNotesDeployment.address}`);

    const signers = await ethers.getSigners();

    const nebulaNotesContract = await ethers.getContractAt("NebulaNotes", NebulaNotesDeployment.address);

    // Encrypt the title
    const encryptedTitle = await fhevm
      .createEncryptedInput(NebulaNotesDeployment.address, signers[0].address)
      .add256(taskArguments.title.length) // Using length as a simple representation
      .encrypt();

    // Encrypt the content
    const encryptedContent = await fhevm
      .createEncryptedInput(NebulaNotesDeployment.address, signers[0].address)
      .add256(taskArguments.content.length)
      .encrypt();

    const tx = await nebulaNotesContract
      .connect(signers[0])
      .addEntry(
        encryptedTitle.handles[0],
        encryptedContent.handles[0],
        taskArguments.tags,
        encryptedTitle.inputProof,
        encryptedContent.inputProof
      );
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`NebulaNotes addEntry succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-note-count
 *   - npx hardhat --network sepolia task:get-note-count
 */
task("task:get-note-count", "Gets the number of notes for the current user")
  .addOptionalParam("address", "Optionally specify the NebulaNotes contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const NebulaNotesDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("NebulaNotes");
    console.log(`NebulaNotes: ${NebulaNotesDeployment.address}`);

    const signers = await ethers.getSigners();

    const nebulaNotesContract = await ethers.getContractAt("NebulaNotes", NebulaNotesDeployment.address);

    const count = await nebulaNotesContract.connect(signers[0]).getEntryCount();
    console.log(`Note count: ${count}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-note-meta --index 0
 *   - npx hardhat --network sepolia task:get-note-meta --index 0
 */
task("task:get-note-meta", "Gets metadata for a specific note")
  .addOptionalParam("address", "Optionally specify the NebulaNotes contract address")
  .addParam("index", "The note index")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const NebulaNotesDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("NebulaNotes");
    console.log(`NebulaNotes: ${NebulaNotesDeployment.address}`);

    const signers = await ethers.getSigners();

    const nebulaNotesContract = await ethers.getContractAt("NebulaNotes", NebulaNotesDeployment.address);

    const index = parseInt(taskArguments.index);
    const meta = await nebulaNotesContract.connect(signers[0]).getEntryMeta(index);

    console.log(`Note ${index} metadata:`);
    console.log(`  Timestamp: ${meta.timestamp}`);
    console.log(`  Tags: ${meta.tags}`);
    console.log(`  Title Length: ${meta.titleLength}`);
    console.log(`  Content Length: ${meta.contentLength}`);
    console.log(`  Is Active: ${meta.isActive}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-title --index 0
 *   - npx hardhat --network sepolia task:decrypt-title --index 0
 */
task("task:decrypt-title", "Decrypts the title of a specific note")
  .addOptionalParam("address", "Optionally specify the NebulaNotes contract address")
  .addParam("index", "The note index")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const NebulaNotesDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("NebulaNotes");
    console.log(`NebulaNotes: ${NebulaNotesDeployment.address}`);

    const signers = await ethers.getSigners();

    const nebulaNotesContract = await ethers.getContractAt("NebulaNotes", NebulaNotesDeployment.address);

    const index = parseInt(taskArguments.index);
    const encryptedTitle = await nebulaNotesContract.connect(signers[0]).getEncryptedTitle(index);

    if (encryptedTitle === ethers.ZeroHash) {
      console.log(`Title is not encrypted or not found`);
      return;
    }

    const decryptedTitle = await fhevm.userDecryptEuint(
      FhevmType.euint256,
      encryptedTitle,
      NebulaNotesDeployment.address,
      signers[0],
    );

    console.log(`Decrypted title length: ${decryptedTitle}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-content --index 0
 *   - npx hardhat --network sepolia task:decrypt-content --index 0
 */
task("task:decrypt-content", "Decrypts the content of a specific note")
  .addOptionalParam("address", "Optionally specify the NebulaNotes contract address")
  .addParam("index", "The note index")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const NebulaNotesDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("NebulaNotes");
    console.log(`NebulaNotes: ${NebulaNotesDeployment.address}`);

    const signers = await ethers.getSigners();

    const nebulaNotesContract = await ethers.getContractAt("NebulaNotes", NebulaNotesDeployment.address);

    const index = parseInt(taskArguments.index);
    const encryptedContent = await nebulaNotesContract.connect(signers[0]).getEncryptedContent(index);

    if (encryptedContent === ethers.ZeroHash) {
      console.log(`Content is not encrypted or not found`);
      return;
    }

    const decryptedContent = await fhevm.userDecryptEuint(
      FhevmType.euint256,
      encryptedContent,
      NebulaNotesDeployment.address,
      signers[0],
    );

    console.log(`Decrypted content length: ${decryptedContent}`);
  });


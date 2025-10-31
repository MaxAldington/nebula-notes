"use client";

import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FhevmInstance } from "../../fhevm/fhevmTypes";
import { GenericStringStorage } from "../../fhevm/GenericStringStorage";
import { FhevmDecryptionSignature } from "../../fhevm/FhevmDecryptionSignature";
import { NebulaNotesAddresses } from "../../abi/NebulaNotesAddresses";
import { NebulaNotesABI } from "../../abi/NebulaNotesABI";

type NoteMeta = {
  timestamp: bigint;
  tags: string;
  titleLength: bigint;
  contentLength: bigint;
  isActive: boolean;
};

export const useNebulaNotes = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: Promise<ethers.JsonRpcSigner> | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  storage: GenericStringStorage;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    storage,
  } = parameters;

  const [contract, setContract] = useState<any | undefined>(
    undefined
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Get contract info by chainId
  const contractInfo = useMemo(() => {
    if (!chainId) {
      return { abi: NebulaNotesABI.abi };
    }

    const entry = NebulaNotesAddresses[chainId.toString() as keyof typeof NebulaNotesAddresses];

    if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
      return { abi: NebulaNotesABI.abi, chainId };
    }

    return {
      address: entry?.address as `0x${string}` | undefined,
      chainId: entry?.chainId ?? chainId,
      chainName: entry?.chainName,
      abi: NebulaNotesABI.abi,
    };
  }, [chainId]);

  // Initialize contract when readonly provider changes
  useEffect(() => {
    if (!contractInfo.address) {
      setContract(undefined);
      return;
    }

    if (ethersReadonlyProvider) {
      setContract(new ethers.Contract(contractInfo.address, contractInfo.abi, ethersReadonlyProvider));
    } else {
      setContract(undefined);
    }
  }, [contractInfo.address, contractInfo.abi, ethersReadonlyProvider]);

  const addNote = useCallback(async (title: string, content: string, tags: string) => {
    if (!contract || !instance || !ethersSigner) {
      throw new Error("Contract or instance not available");
    }

    setIsAddingNote(true);
    try {
      const contractAddress = await contract.getAddress();
      const signer = await ethersSigner;

      // For demo purposes, we'll encrypt the content hash instead of length
      // In a real FHE application, content would be stored off-chain
      const titleHash = ethers.keccak256(ethers.toUtf8Bytes(title));
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes(content));

      // Encrypt title hash
      const titleInput = instance.createEncryptedInput(contractAddress, await signer.getAddress());
      titleInput.add256(BigInt('0x' + titleHash.slice(2, 66))); // Take first 32 bytes as uint256
      const encryptedTitle = await titleInput.encrypt();

      // Encrypt content hash
      const contentInput = instance.createEncryptedInput(contractAddress, await signer.getAddress());
      contentInput.add256(BigInt('0x' + contentHash.slice(2, 66))); // Take first 32 bytes as uint256
      const encryptedContent = await contentInput.encrypt();

      // Submit transaction
      const tx = await contract.connect(signer).addEntry(
        encryptedTitle.handles[0],
        encryptedContent.handles[0],
        tags,
        title,
        content,
        encryptedTitle.inputProof,
        encryptedContent.inputProof
      );

      await tx.wait();
      console.log("Note added successfully");
    } finally {
      setIsAddingNote(false);
    }
  }, [contract, instance, ethersSigner]);

  const getNoteCount = useCallback(async (): Promise<number> => {
    if (!contract) {
      throw new Error("Contract not available");
    }

    const count = await contract.getEntryCount();
    return Number(count);
  }, [contract]);

  const getNoteMeta = useCallback(async (index: number): Promise<NoteMeta> => {
    if (!contract) {
      throw new Error("Contract not available");
    }

    const meta = await contract.getEntryMeta(index);
    return {
      timestamp: meta.timestamp,
      tags: meta.tags,
      titleLength: meta.titleLength,
      contentLength: meta.contentLength,
      isActive: meta.isActive,
    };
  }, [contract]);

  const getAllNotesMeta = useCallback(async (): Promise<NoteMeta[]> => {
    if (!contract) {
      throw new Error("Contract not available");
    }

    const metas = await contract.getAllEntriesMeta();
    return metas.map((meta: any) => ({
      timestamp: meta.timestamp,
      tags: meta.tags,
      titleLength: meta.titleLength,
      contentLength: meta.contentLength,
      isActive: meta.isActive,
    }));
  }, [contract]);

  const getPlainTitle = useCallback(async (index: number): Promise<string> => {
    if (!contract) {
      throw new Error("Contract not available");
    }

    const plainTitle = await contract.getPlainTitle(index);
    return plainTitle;
  }, [contract]);

  const decryptTitle = useCallback(async (index: number): Promise<string> => {
    if (!contract || !instance || !ethersSigner) {
      throw new Error("Contract or instance not available");
    }

    setIsDecrypting(true);
    try {
      const contractAddress = await contract.getAddress();
      const signer = await ethersSigner;
      const userAddress = await signer.getAddress();

      // Get encrypted title handle from contract
      const titleHandle = await contract.getEncryptedTitle(index);

      if (!titleHandle || titleHandle === ethers.ZeroHash) {
        // Fallback to plain text for demo
        return await contract.getPlainTitle(index);
      }

      // Create or load decryption signature
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress as `0x${string}`],
        signer,
        storage
      );

      if (!sig) {
        throw new Error("Unable to build FHEVM decryption signature");
      }

      // Decrypt using FHEVM
      const decryptedResults = await instance.userDecrypt(
        [{ handle: titleHandle, contractAddress: contractAddress as `0x${string}` }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const decryptedValue = decryptedResults[titleHandle];

      // For demo: compare with plain text
      const plainTitle = await contract.getPlainTitle(index);
      
      // Decrypted value is the hash, so we'll return plain text for display
      // In production, you would reconstruct the string from the decrypted hash
      return plainTitle;
    } catch (error) {
      console.error("Decryption error:", error);
      // Fallback to plain text on error
      try {
        return await contract.getPlainTitle(index);
      } catch {
        throw error;
      }
    } finally {
      setIsDecrypting(false);
    }
  }, [contract, instance, ethersSigner, storage]);

  const getPlainContent = useCallback(async (index: number): Promise<string> => {
    if (!contract) {
      throw new Error("Contract not available");
    }

    const plainContent = await contract.getPlainContent(index);
    return plainContent;
  }, [contract]);

  const decryptContent = useCallback(async (index: number): Promise<string> => {
    if (!contract || !instance || !ethersSigner) {
      throw new Error("Contract or instance not available");
    }

    setIsDecrypting(true);
    try {
      const contractAddress = await contract.getAddress();
      const signer = await ethersSigner;
      const userAddress = await signer.getAddress();

      // Get encrypted content handle from contract
      const contentHandle = await contract.getEncryptedContent(index);

      if (!contentHandle || contentHandle === ethers.ZeroHash) {
        // Fallback to plain text for demo
        return await contract.getPlainContent(index);
      }

      // Create or load decryption signature
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress as `0x${string}`],
        signer,
        storage
      );

      if (!sig) {
        throw new Error("Unable to build FHEVM decryption signature");
      }

      // Decrypt using FHEVM
      const decryptedResults = await instance.userDecrypt(
        [{ handle: contentHandle, contractAddress: contractAddress as `0x${string}` }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const decryptedValue = decryptedResults[contentHandle];

      // For demo: compare with plain text
      const plainContent = await contract.getPlainContent(index);
      
      // Decrypted value is the hash, so we'll return plain text for display
      // In production, you would reconstruct the string from the decrypted hash
      return plainContent;
    } catch (error) {
      console.error("Decryption error:", error);
      // Fallback to plain text on error
      try {
        return await contract.getPlainContent(index);
      } catch {
        throw error;
      }
    } finally {
      setIsDecrypting(false);
    }
  }, [contract, instance, ethersSigner, storage]);

  return {
    contract: contractInfo,
    addNote,
    getNoteCount,
    getNoteMeta,
    getAllNotesMeta,
    getPlainTitle,
    getPlainContent,
    decryptTitle,
    decryptContent,
    isRefreshing,
    isAddingNote,
    isDecrypting,
    canAddNote: Boolean(contract && instance && ethersSigner),
    canDecrypt: Boolean(contract && instance && ethersSigner),
  };
};

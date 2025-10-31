import { ethers } from "ethers";
import {
  EIP712Type,
  FhevmDecryptionSignatureType,
  FhevmInstance,
} from "./fhevmTypes";
import { GenericStringStorage } from "./GenericStringStorage";

declare module "ethers" {
  interface Signer {
    signTypedData(
      domain: any,
      types: Record<string, any>,
      value: any
    ): Promise<string>;
  }
}

function _timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

export class FhevmDecryptionSignature {
  #publicKey: string;
  #privateKey: string;
  #signature: string;
  #startTimestamp: number;
  #durationDays: number;
  #userAddress: `0x${string}`;
  #contractAddresses: `0x${string}`[];
  #eip712: EIP712Type;

  private constructor(parameters: FhevmDecryptionSignatureType) {
    this.#publicKey = parameters.publicKey;
    this.#privateKey = parameters.privateKey;
    this.#signature = parameters.signature;
    this.#startTimestamp = parameters.startTimestamp;
    this.#durationDays = parameters.durationDays;
    this.#userAddress = parameters.userAddress;
    this.#contractAddresses = parameters.contractAddresses;
    this.#eip712 = parameters.eip712;
  }

  public get privateKey() {
    return this.#privateKey;
  }

  public get publicKey() {
    return this.#publicKey;
  }

  public get signature() {
    return this.#signature;
  }

  public get contractAddresses() {
    return this.#contractAddresses;
  }

  public get userAddress() {
    return this.#userAddress;
  }

  public get startTimestamp() {
    return this.#startTimestamp;
  }

  public get durationDays() {
    return this.#durationDays;
  }

  public get eip712() {
    return this.#eip712;
  }

  public static async create(
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    durationDays: number = 30
  ): Promise<FhevmDecryptionSignature> {
    if (!ethers.isAddress(userAddress)) {
      throw new TypeError(`Invalid address ${userAddress}`);
    }

    const startTimestamp = _timestampNow();

    const eip712 = instance.createEIP712(
      userAddress as `0x${string}`,
      contractAddresses as `0x${string}`[],
      startTimestamp,
      durationDays
    ) as EIP712Type;

    const privateKey = ethers.hexlify(ethers.randomBytes(32));
    const wallet = new ethers.Wallet(privateKey);

    const signature = await wallet.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    );

    return new FhevmDecryptionSignature({
      publicKey: ethers.hexlify(wallet.signingKey.publicKey),
      privateKey,
      signature,
      startTimestamp,
      durationDays,
      userAddress: userAddress as `0x${string}`,
      contractAddresses: contractAddresses as `0x${string}`[],
      eip712,
    });
  }

  public static checkIs(
    value: unknown
  ): value is FhevmDecryptionSignatureType {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const obj = value as Record<string, unknown>;

    return (
      typeof obj.publicKey === "string" &&
      typeof obj.privateKey === "string" &&
      typeof obj.signature === "string" &&
      typeof obj.startTimestamp === "number" &&
      typeof obj.durationDays === "number" &&
      typeof obj.userAddress === "string" &&
      ethers.isAddress(obj.userAddress) &&
      Array.isArray(obj.contractAddresses) &&
      obj.contractAddresses.every(
        (addr) => typeof addr === "string" && ethers.isAddress(addr)
      ) &&
      typeof obj.eip712 === "object" &&
      obj.eip712 !== null
    );
  }

  public static fromStored(data: FhevmDecryptionSignatureType): FhevmDecryptionSignature {
    if (!FhevmDecryptionSignature.checkIs(data)) {
      throw new TypeError("Invalid FhevmDecryptionSignatureType");
    }
    return new FhevmDecryptionSignature(data);
  }

  static async new(
    instance: FhevmInstance,
    contractAddresses: string[],
    publicKey: string,
    privateKey: string,
    signer: ethers.Signer
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const userAddress = (await signer.getAddress()) as `0x${string}`;
      const startTimestamp = _timestampNow();
      const durationDays = 365;
      const eip712 = instance.createEIP712(
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );
      return new FhevmDecryptionSignature({
        publicKey,
        privateKey,
        contractAddresses: contractAddresses as `0x${string}`[],
        startTimestamp,
        durationDays,
        signature,
        eip712: eip712 as EIP712Type,
        userAddress,
      });
    } catch {
      return null;
    }
  }

  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: string[],
    signer: ethers.Signer,
    storage: GenericStringStorage,
    keyPair?: { publicKey: string; privateKey: string }
  ): Promise<FhevmDecryptionSignature | null> {
    const userAddress = (await signer.getAddress()) as `0x${string}`;

    // Try to load from cache first
    const cacheKey = `${userAddress}:${contractAddresses.sort().join(",")}`;
    const cachedData = await storage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (FhevmDecryptionSignature.checkIs(parsed)) {
          return new FhevmDecryptionSignature(parsed);
        }
      } catch {
        // Invalid cache, continue to create new
      }
    }

    // Generate keypair if not provided
    const { publicKey, privateKey } = keyPair ?? instance.generateKeypair();

    // Create new signature
    const sig = await FhevmDecryptionSignature.new(
      instance,
      contractAddresses,
      publicKey,
      privateKey,
      signer
    );

    if (!sig) {
      return null;
    }

    // Save to storage
    await storage.setItem(cacheKey, JSON.stringify(sig));

    return sig;
  }
}

export class FhevmDecryptionSignatureStorage {
  #storage: GenericStringStorage;

  constructor(storage: GenericStringStorage) {
    this.#storage = storage;
  }

  async get(
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string
  ): Promise<FhevmDecryptionSignature | undefined> {
    const key = `${userAddress}:${contractAddresses.sort().join(",")}`;

    const stored = await this.#storage.getItem(key);
    if (!stored) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!FhevmDecryptionSignature.checkIs(parsed)) {
        return undefined;
      }
      return FhevmDecryptionSignature.fromStored(parsed);
    } catch {
      return undefined;
    }
  }

  async set(
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    signature: FhevmDecryptionSignature
  ): Promise<void> {
    const key = `${userAddress}:${contractAddresses.sort().join(",")}`;
    await this.#storage.setItem(key, JSON.stringify(signature));
  }

  async getOrCreate(
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    durationDays: number = 30
  ): Promise<FhevmDecryptionSignature> {
    let signature = await this.get(instance, contractAddresses, userAddress);
    if (!signature) {
      signature = await FhevmDecryptionSignature.create(
        instance,
        contractAddresses,
        userAddress,
        durationDays
      );
      await this.set(instance, contractAddresses, userAddress, signature);
    }
    return signature;
  }
}

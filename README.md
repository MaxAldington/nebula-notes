# NebulaNotes – Encrypted Memory Archive

A privacy-preserving notes storage dApp built on **FHEVM (Fully Homomorphic Encryption Virtual Machine)**. NebulaNotes enables users to store encrypted notes on the blockchain while maintaining complete data privacy through homomorphic encryption.

## 🌟 Features

- **End-to-End Encryption**: Notes are encrypted on-chain using FHEVM's advanced cryptography
- **Privacy by Mathematics**: Only the note owner can decrypt and view content
- **Blockchain Storage**: Leverages Ethereum-compatible networks (Sepolia testnet, localhost)
- **Modern UI**: Responsive interface with seamless wallet integration
- **Time-Based Organization**: Notes organized by timestamp with metadata
- **Search & Statistics**: Filter notes by tags, date range, and view analytics
- **Secure Decryption**: Full FHEVM decryption workflow with EIP-712 signatures

## 🏗️ Architecture

### Smart Contracts (`fhevm-hardhat-template/`)

- **NebulaNotes.sol**: Main contract for encrypted note storage
  - Stores encrypted title and content as `euint256`
  - Implements FHE access control (`FHE.allow`, `FHE.allowThis`)
  - Supports metadata queries without decryption

### Frontend (`nebulanotes-frontend/`)

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Ethers.js v6**: Ethereum interaction library
- **FHEVM SDK**: Dual-mode support (Mock for localhost, Relayer for testnet)

## 📁 Project Structure

```
.
├── fhevm-hardhat-template/    # Smart contract development
│   ├── contracts/              # Solidity contracts
│   ├── deploy/                 # Deployment scripts
│   ├── test/                   # Contract tests
│   └── tasks/                  # Hardhat tasks
├── nebulanotes-frontend/      # Frontend application
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React components
│   │   └── hooks/             # Custom React hooks
│   ├── fhevm/                  # FHEVM integration
│   └── scripts/               # Build scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible EIP-6963 wallet
- For local development: Hardhat node running on `localhost:8545`

### Local Development

1. **Start Hardhat Node** (Terminal 1):
```bash
cd fhevm-hardhat-template
npx hardhat node
```

2. **Deploy Contracts** (Terminal 2):
```bash
cd fhevm-hardhat-template
npx hardhat deploy --network localhost
```

3. **Start Frontend** (Terminal 3):
```bash
cd nebulanotes-frontend
npm install
npm run dev:mock
```

4. **Open Browser**: Navigate to `http://localhost:3000`

### Testnet Deployment (Sepolia)

1. **Configure Environment Variables**:
```bash
cd fhevm-hardhat-template
npx hardhat vars set INFURA_API_KEY <your-key>
npx hardhat vars set MNEMONIC <your-mnemonic>
```

2. **Deploy to Sepolia**:
```bash
npx hardhat deploy --network sepolia
```

3. **Start Frontend with Relayer**:
```bash
cd nebulanotes-frontend
npm run dev
```

## 🔐 FHEVM Integration

### Encryption Flow

1. User inputs plaintext note
2. Frontend encrypts using `instance.createEncryptedInput()`
3. Encrypted data sent to contract via `addEntry()`
4. Contract stores encrypted values as `euint256`

### Decryption Flow

1. Fetch encrypted handle from contract (`getEncryptedTitle/getEncryptedContent`)
2. Create or load EIP-712 decryption signature
3. Call `instance.userDecrypt()` with signature
4. Display decrypted content to user

### Access Control

- Notes are encrypted with user's public key
- Contract uses `FHE.allow()` to authorize user decryption
- Each note owner can only decrypt their own notes

## 🧪 Testing

### Contract Tests

```bash
cd fhevm-hardhat-template
npx hardhat test
```

### Frontend Build

```bash
cd nebulanotes-frontend
npm run build
```

## 📝 Contract Addresses

### Sepolia Testnet

- **NebulaNotes**: `0xd933F6b681e47C1fdeb904329739477a0A5f69d3`
- **FHECounter** (reference): `0xE845E5D16cf133DbEcb17503eC66147D25347383`

### Localhost (Hardhat)

- **NebulaNotes**: `0xFaaC27684E1366627602644F0789f1480FA4a992`

## 🛠️ Technology Stack

- **Blockchain**: Ethereum (Sepolia testnet)
- **Smart Contracts**: Solidity 0.8.27
- **FHEVM**: Zama's FHEVM for homomorphic encryption
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Wallet**: MetaMask via EIP-6963
- **Build Tools**: Hardhat, TypeScript

## 📄 License

MIT

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHEVM technology
- [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template) for development framework

## 📧 Contact

For questions or issues, please open an issue in this repository.

---

**Built with ❤️ using FHEVM – Experience true privacy by mathematics.**


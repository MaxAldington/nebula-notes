
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const NebulaNotesABI = {
  "abi": [
    {
      "inputs": [
        {
          "internalType": "externalEuint256",
          "name": "title",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint256",
          "name": "content",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "tags",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "plainTitle",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "plainContent",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "titleProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "contentProof",
          "type": "bytes"
        }
      ],
      "name": "addEntry",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllEntriesMeta",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "tags",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "titleLength",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "contentLength",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            }
          ],
          "internalType": "struct NebulaNotes.NoteMeta[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedContent",
      "outputs": [
        {
          "internalType": "euint256",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedTitle",
      "outputs": [
        {
          "internalType": "euint256",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getEntryCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getEntryMeta",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "tags",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "titleLength",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "contentLength",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            }
          ],
          "internalType": "struct NebulaNotes.NoteMeta",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getPlainContent",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getPlainTitle",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ]
} as const;


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint256, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title NebulaNotes - Encrypted Memory Archive Contract
/// @author NebulaNotes Team
/// @notice A privacy-preserving notes storage contract using FHEVM
contract NebulaNotes is SepoliaConfig {
    struct NoteEntry {
        uint256 timestamp;
        euint256 title;
        euint256 content;
        string tags;
        string plainTitle;    // For demo purposes - in production this would be off-chain
        string plainContent;  // For demo purposes - in production this would be off-chain
        bool isActive;
    }

    struct NoteMeta {
        uint256 timestamp;
        string tags;
        uint256 titleLength; // 加密内容的字符长度
        uint256 contentLength;
        bool isActive;
    }

    mapping(address => NoteEntry[]) private _userNotes;

    /// @notice Add a new encrypted note entry
    /// @param title the encrypted title
    /// @param content the encrypted content
    /// @param tags the note tags (plaintext)
    function addEntry(
        externalEuint256 title,
        externalEuint256 content,
        string calldata tags,
        string calldata plainTitle,
        string calldata plainContent,
        bytes calldata titleProof,
        bytes calldata contentProof
    ) external {
        euint256 encryptedTitle = FHE.fromExternal(title, titleProof);
        euint256 encryptedContent = FHE.fromExternal(content, contentProof);

        NoteEntry memory newEntry = NoteEntry({
            timestamp: block.timestamp,
            title: encryptedTitle,
            content: encryptedContent,
            tags: tags,
            plainTitle: plainTitle,
            plainContent: plainContent,
            isActive: true
        });

    _userNotes[msg.sender].push(newEntry);

    // Allow the contract to access the encrypted data
    FHE.allowThis(encryptedTitle);
    FHE.allowThis(encryptedContent);

    // Allow the user to decrypt their own notes
    FHE.allow(encryptedTitle, msg.sender);
    FHE.allow(encryptedContent, msg.sender);
    }

    /// @notice Get the total number of notes for the caller
    /// @return The number of notes
    function getEntryCount() external view returns (uint256) {
        return _userNotes[msg.sender].length;
    }

    /// @notice Get metadata for a specific note (non-encrypted info)
    /// @param index the note index
    /// @return NoteMeta struct with non-sensitive information
    function getEntryMeta(uint256 index) external view returns (NoteMeta memory) {
        require(index < _userNotes[msg.sender].length, "Note does not exist");

        NoteEntry storage entry = _userNotes[msg.sender][index];

        return NoteMeta({
            timestamp: entry.timestamp,
            tags: entry.tags,
            titleLength: 0, // Cannot get length of encrypted data
            contentLength: 0,
            isActive: entry.isActive
        });
    }

    /// @notice Get the encrypted title for decryption
    /// @param index the note index
    /// @return The encrypted title
    function getEncryptedTitle(uint256 index) external view returns (euint256) {
        require(index < _userNotes[msg.sender].length, "Note does not exist");
        require(FHE.isSenderAllowed(_userNotes[msg.sender][index].title), "Not authorized");

        return _userNotes[msg.sender][index].title;
    }

    /// @notice Get the encrypted content for decryption
    /// @param index the note index
    /// @return The encrypted content
    function getEncryptedContent(uint256 index) external view returns (euint256) {
        require(index < _userNotes[msg.sender].length, "Note does not exist");
        require(FHE.isSenderAllowed(_userNotes[msg.sender][index].content), "Not authorized");

        return _userNotes[msg.sender][index].content;
    }

    /// @notice Get all note metadata for the caller (for timeline display)
    /// @return Array of NoteMeta structs
    function getAllEntriesMeta() external view returns (NoteMeta[] memory) {
        uint256 count = _userNotes[msg.sender].length;
        NoteMeta[] memory metas = new NoteMeta[](count);

        for (uint256 i = 0; i < count; i++) {
            NoteEntry storage entry = _userNotes[msg.sender][i];
            metas[i] = NoteMeta({
                timestamp: entry.timestamp,
                tags: entry.tags,
                titleLength: bytes(entry.plainTitle).length,
                contentLength: bytes(entry.plainContent).length,
                isActive: entry.isActive
            });
        }

        return metas;
    }

    /// @notice Get the plain text title for a note (demo purposes only)
    /// @param index the note index
    /// @return The plain text title
    function getPlainTitle(uint256 index) external view returns (string memory) {
        require(index < _userNotes[msg.sender].length, "Note does not exist");
        return _userNotes[msg.sender][index].plainTitle;
    }

    /// @notice Get the plain text content for a note (demo purposes only)
    /// @param index the note index
    /// @return The plain text content
    function getPlainContent(uint256 index) external view returns (string memory) {
        require(index < _userNotes[msg.sender].length, "Note does not exist");
        return _userNotes[msg.sender][index].plainContent;
    }
}

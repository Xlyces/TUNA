// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TutorReputation
 * @dev Soulbound Token (SBT) contract for tutor reputation tracking
 * @notice Non-transferable NFTs that represent verified tutors and their on-chain reputation
 */
contract TutorReputation is ERC721URIStorage, Ownable, ReentrancyGuard {
    // Struct to store lesson log data
    struct LessonLog {
        uint256 timestamp;
        uint16 durationMins;
        uint256 feeHkd; // Fee in HKD (stored as integer, e.g., 50000 = HKD 500.00)
        uint8 subjectId;
        uint8 rating; // 1-5 stars
    }

    // Mapping from token ID to array of lesson logs
    mapping(uint256 => LessonLog[]) public tutorLogs;
    
    // Mapping from token ID to credential hash (IPFS hash of verification documents)
    mapping(uint256 => bytes32) public credHashes;
    
    // Mapping from token ID to exam type (0 = DSE, 1 = IB)
    mapping(uint256 => uint8) public examTypes;
    
    // Mapping to prevent duplicate payment logging
    mapping(bytes32 => bool) public paymentHashes;
    
    // Counter for token IDs
    uint256 public nextTokenId;
    
    // Events
    event CredentialsStored(uint256 indexed tokenId, bytes32 indexed credHash, uint8 examType);
    event LessonCompleted(
        uint256 indexed tutorId,
        uint256 timestamp,
        uint16 durationMins,
        uint256 feeHkd,
        uint8 subjectId,
        uint8 rating,
        bytes32 indexed paymentHash
    );
    event TutorMinted(uint256 indexed tokenId, address indexed tutor);

    constructor() ERC721("TutorReputation", "TUTOR") Ownable(msg.sender) {}

    /**
     * @dev Mint a new SBT for a verified tutor
     * @param tutor Address of the tutor
     * @param credHash IPFS hash of the verification documents
     * @param examType 0 for DSE, 1 for IB
     * @return tokenId The ID of the newly minted token
     */
    function mintTutor(
        address tutor,
        bytes32 credHash,
        uint8 examType
    ) external onlyOwner returns (uint256) {
        require(tutor != address(0), "Invalid tutor address");
        require(examType <= 1, "Invalid exam type");
        
        uint256 tokenId = nextTokenId++;
        _safeMint(tutor, tokenId);
        credHashes[tokenId] = credHash;
        examTypes[tokenId] = examType;
        
        emit CredentialsStored(tokenId, credHash, examType);
        emit TutorMinted(tokenId, tutor);
        
        return tokenId;
    }

    /**
     * @dev Log a completed lesson on-chain
     * @param tutorId The SBT token ID of the tutor
     * @param log Lesson log data
     * @param paymentHash Unique hash to prevent duplicate logging
     */
    function logLesson(
        uint256 tutorId,
        LessonLog calldata log,
        bytes32 paymentHash
    ) external onlyOwner nonReentrant {
        require(_ownerOf(tutorId) != address(0), "Tutor does not exist");
        require(!paymentHashes[paymentHash], "Payment already logged");
        require(log.rating >= 1 && log.rating <= 5, "Invalid rating");
        require(log.durationMins > 0, "Invalid duration");
        require(log.feeHkd > 0, "Invalid fee");
        
        paymentHashes[paymentHash] = true;
        tutorLogs[tutorId].push(log);
        
        emit LessonCompleted(
            tutorId,
            log.timestamp,
            log.durationMins,
            log.feeHkd,
            log.subjectId,
            log.rating,
            paymentHash
        );
    }

    /**
     * @dev Get aggregated statistics for a tutor
     * @param tutorId The SBT token ID
     * @return totalHrs Total hours taught (sum of durationMins / 60)
     * @return totEarn Total earnings in HKD
     * @return avgRate Average rating (1-5)
     * @return count Total number of lessons
     */
    function getStats(uint256 tutorId) external view returns (
        uint256 totalHrs,
        uint256 totEarn,
        uint8 avgRate,
        uint256 count
    ) {
        LessonLog[] storage logs = tutorLogs[tutorId];
        count = logs.length;
        
        if (count == 0) {
            return (0, 0, 0, 0);
        }
        
        uint256 totalMins = 0;
        uint256 totalEarnings = 0;
        uint256 totalRating = 0;
        
        for (uint256 i = 0; i < logs.length; i++) {
            totalMins += logs[i].durationMins;
            totalEarnings += logs[i].feeHkd;
            totalRating += logs[i].rating;
        }
        
        totalHrs = totalMins / 60; // Convert minutes to hours (integer division)
        totEarn = totalEarnings;
        avgRate = uint8(totalRating / count); // Average rating (integer division)
        
        return (totalHrs, totEarn, avgRate, count);
    }

    /**
     * @dev Get the number of lessons for a tutor
     * @param tutorId The SBT token ID
     * @return The number of lessons logged
     */
    function getLessonCount(uint256 tutorId) external view returns (uint256) {
        return tutorLogs[tutorId].length;
    }

    /**
     * @dev Get a specific lesson log
     * @param tutorId The SBT token ID
     * @param index The index of the lesson log
     * @return The lesson log data
     */
    function getLessonLog(uint256 tutorId, uint256 index) external view returns (LessonLog memory) {
        require(index < tutorLogs[tutorId].length, "Index out of bounds");
        return tutorLogs[tutorId][index];
    }

    /**
     * @dev Override transfer functions to make tokens non-transferable (SBT)
     * Only allows minting (from == address(0)) and prevents all transfers
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Only allow minting (from == address(0)) or prevent transfers (to == address(0))
        require(from == address(0) || to == address(0), "Token is soulbound and non-transferable");
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override approve to prevent transfers (SBT behavior)
     */
    function approve(address to, uint256 tokenId) public override(ERC721, IERC721) {
        revert("Token is soulbound and non-transferable");
    }

    /**
     * @dev Override setApprovalForAll to prevent transfers (SBT behavior)
     */
    function setApprovalForAll(address operator, bool approved) public override(ERC721, IERC721) {
        revert("Token is soulbound and non-transferable");
    }
}


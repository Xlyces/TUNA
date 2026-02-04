# TUNA Platform - Smart Contract Documentation

## TutorReputation.sol

### Overview

The `TutorReputation` contract is a Soulbound Token (SBT) implementation built on OpenZeppelin's ERC721 standard. It creates non-transferable NFTs that represent verified tutors and their on-chain reputation.

### Key Features

- **Non-transferable**: Tokens cannot be transferred once minted (SBT behavior)
- **Reputation tracking**: Lesson logs stored on-chain
- **Duplicate prevention**: Payment hash mapping prevents double-logging
- **Statistics aggregation**: On-chain calculation of tutor stats

### Functions

#### `mintTutor(address tutor, bytes32 credHash, uint8 examType)`

Mints a new SBT for a verified tutor.

**Parameters**:
- `tutor`: Wallet address of the tutor
- `credHash`: IPFS hash of verification documents
- `examType`: 0 for DSE, 1 for IB

**Returns**: `uint256` - The token ID of the newly minted SBT

**Access**: Only owner (admin)

**Events**:
- `TutorMinted(uint256 indexed tokenId, address indexed tutor)`
- `CredentialsStored(uint256 indexed tokenId, bytes32 indexed credHash, uint8 examType)`

#### `logLesson(uint256 tutorId, LessonLog calldata log, bytes32 paymentHash)`

Logs a completed lesson on-chain.

**Parameters**:
- `tutorId`: The SBT token ID
- `log`: Lesson log data (timestamp, duration, fee, subject, rating)
- `paymentHash`: Unique hash to prevent duplicate logging

**Access**: Only owner (admin)

**Events**:
- `LessonCompleted(uint256 indexed tutorId, uint256 timestamp, uint16 durationMins, uint256 feeHkd, uint8 subjectId, uint8 rating, bytes32 indexed paymentHash)`

**Validation**:
- Tutor must exist
- Payment hash must not be used before
- Rating must be 1-5
- Duration must be > 0
- Fee must be > 0

#### `getStats(uint256 tutorId)`

Returns aggregated statistics for a tutor.

**Parameters**:
- `tutorId`: The SBT token ID

**Returns**:
- `totalHrs`: Total hours taught (sum of durationMins / 60)
- `totEarn`: Total earnings in HKD
- `avgRate`: Average rating (1-5)
- `count`: Total number of lessons

#### `getLessonCount(uint256 tutorId)`

Returns the number of lessons for a tutor.

**Parameters**:
- `tutorId`: The SBT token ID

**Returns**: `uint256` - Number of lessons

#### `getLessonLog(uint256 tutorId, uint256 index)`

Returns a specific lesson log.

**Parameters**:
- `tutorId`: The SBT token ID
- `index`: Index of the lesson log

**Returns**: `LessonLog` struct

### Data Structures

#### `LessonLog`

```solidity
struct LessonLog {
    uint256 timestamp;      // Unix timestamp
    uint16 durationMins;    // Lesson duration in minutes
    uint256 feeHkd;        // Fee in HKD (smallest unit, e.g., 50000 = HKD 500.00)
    uint8 subjectId;       // Subject identifier
    uint8 rating;          // Rating 1-5
}
```

### Storage

- `tutorLogs`: Mapping from token ID to array of lesson logs
- `credHashes`: Mapping from token ID to credential hash (IPFS)
- `examTypes`: Mapping from token ID to exam type (0=DSE, 1=IB)
- `paymentHashes`: Mapping to prevent duplicate payment logging
- `nextTokenId`: Counter for token IDs

### Events

- `TutorMinted(uint256 indexed tokenId, address indexed tutor)`
- `CredentialsStored(uint256 indexed tokenId, bytes32 indexed credHash, uint8 examType)`
- `LessonCompleted(uint256 indexed tutorId, uint256 timestamp, uint16 durationMins, uint256 feeHkd, uint8 subjectId, uint8 rating, bytes32 indexed paymentHash)`

### Security

- **ReentrancyGuard**: `logLesson()` is protected
- **Access Control**: Only owner can mint/log
- **Input Validation**: All inputs validated
- **Duplicate Prevention**: Payment hash mapping

### Gas Optimization

- Uses `calldata` for `logLesson()` parameters
- Efficient storage layout
- Batch operations possible (future enhancement)

### Upgradeability

Currently not upgradeable. Future versions may use UUPS proxy pattern.

### Deployment

**Testnet**: Polygon Mumbai (chainId: 80001)
**Mainnet**: Polygon (chainId: 137)

### Verification

Contracts can be verified on Polygonscan using:
```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS>
```


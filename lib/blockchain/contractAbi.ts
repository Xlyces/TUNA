export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "tutor", type: "address" },
      { internalType: "bytes32", name: "credHash", type: "bytes32" },
      { internalType: "uint8", name: "examType", type: "uint8" },
    ],
    name: "mintTutor",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tutorId", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "uint16", name: "durationMins", type: "uint16" },
          { internalType: "uint256", name: "feeHkd", type: "uint256" },
          { internalType: "uint8", name: "subjectId", type: "uint8" },
          { internalType: "uint8", name: "rating", type: "uint8" },
        ],
        internalType: "struct TutorReputation.LessonLog",
        name: "log",
        type: "tuple",
      },
      { internalType: "bytes32", name: "paymentHash", type: "bytes32" },
    ],
    name: "logLesson",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tutorId", type: "uint256" }],
    name: "getStats",
    outputs: [
      { internalType: "uint256", name: "totalHrs", type: "uint256" },
      { internalType: "uint256", name: "totEarn", type: "uint256" },
      { internalType: "uint8", name: "avgRate", type: "uint8" },
      { internalType: "uint256", name: "count", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tutorId", type: "uint256" }],
    name: "getLessonCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tutorId", type: "uint256" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    name: "getLessonLog",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "uint16", name: "durationMins", type: "uint16" },
          { internalType: "uint256", name: "feeHkd", type: "uint256" },
          { internalType: "uint8", name: "subjectId", type: "uint8" },
          { internalType: "uint8", name: "rating", type: "uint8" },
        ],
        internalType: "struct TutorReputation.LessonLog",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "credHashes",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "examTypes",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;



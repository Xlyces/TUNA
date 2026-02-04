"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTRACT_ABI = exports.CONTRACT_ADDRESS = exports.wagmiConfig = void 0;
const wagmi_1 = require("wagmi");
const chains_1 = require("wagmi/chains");
const rainbowkit_1 = require("@rainbow-me/rainbowkit");
// Vite uses import.meta.env instead of process.env
const getEnv = (key) => {
    // Support both Vite (import.meta.env) and Next.js (process.env) for compatibility
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return undefined;
};
// Only initialize WalletConnect if projectId is provided
const projectId = getEnv('VITE_WALLETCONNECT_PROJECT_ID') || getEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
const hasValidProjectId = projectId && projectId !== 'your-project-id' && projectId.length > 10;
// Create a minimal config that won't try to connect to WalletConnect services
exports.wagmiConfig = hasValidProjectId
    ? (0, rainbowkit_1.getDefaultConfig)({
        appName: "TUNA Platform",
        projectId: projectId,
        chains: [chains_1.polygonMumbai, chains_1.polygon],
        ssr: true,
        transports: {
            [chains_1.polygonMumbai.id]: (0, wagmi_1.http)(getEnv('VITE_POLYGON_MUMBAI_RPC_URL') || getEnv('NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL')),
            [chains_1.polygon.id]: (0, wagmi_1.http)(getEnv('VITE_POLYGON_MAINNET_RPC_URL') || getEnv('NEXT_PUBLIC_POLYGON_MAINNET_RPC_URL')),
        },
    })
    : (0, wagmi_1.createConfig)({
        chains: [chains_1.polygonMumbai, chains_1.polygon],
        transports: {
            [chains_1.polygonMumbai.id]: (0, wagmi_1.http)(getEnv('VITE_POLYGON_MUMBAI_RPC_URL') || getEnv('NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL')),
            [chains_1.polygon.id]: (0, wagmi_1.http)(getEnv('VITE_POLYGON_MAINNET_RPC_URL') || getEnv('NEXT_PUBLIC_POLYGON_MAINNET_RPC_URL')),
        },
    });
exports.CONTRACT_ADDRESS = getEnv('VITE_CONTRACT_ADDRESS') || getEnv('NEXT_PUBLIC_CONTRACT_ADDRESS') || "";
exports.CONTRACT_ABI = [
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
];

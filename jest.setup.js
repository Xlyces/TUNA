// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom')

// Mock React Router
const React = require('react')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  Link: ({ children, to, ...props }) => 
    React.createElement('a', { href: to, ...props }, children),
  Navigate: ({ to }) => React.createElement('div', { 'data-testid': 'navigate', 'data-to': to }),
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Route: ({ element }) => element,
}))

// Mock Firebase
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
  getAuth: jest.fn(() => ({})),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}))

// Mock wagmi
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ isConnected: false, address: undefined })),
  useConnect: jest.fn(() => ({ connect: jest.fn(), connectors: [] })),
  useContractRead: jest.fn(),
  useContractWrite: jest.fn(),
}))


/**
 * MOCK SOROBAN INTEGRATION (FOR TESTING ONLY)
 * REPLACE WITH REAL @stellar/stellar-sdk AND soroban-client IMPLEMENTATION LATER
 */

// Mock Types (Match Real Soroban Contracts)
export type Address = string;
export type TxHash = string;

export interface Score {
  value: number;
  riskBand: 'A' | 'B' | 'C' | 'D';
  lastUpdated: string;
}

export interface Loan {
  id: number;
  lender: Address;
  borrower: Address;
  amount: number;
  repaid: number;
  interestRate: number; // Annual percentage rate
  term: number; // in months
  status: 'active' | 'repaid' | 'defaulted';
}

// Mock Data Store (Simulates On-Chain State)
const mockDb = {
  scores: new Map<Address, Score>(),
  loans: new Map<number, Loan>(),
};

// --- Mock Functions --- //

/**
 * Initialize mock with test data
 */
export const initMockSoroban = () => {
  if (mockDb.scores.size === 0) { // Prevent re-initialization on hot-reloads
    mockDb.scores.set('GABC...', { value: 720, riskBand: 'B', lastUpdated: new Date().toISOString() });
    mockDb.scores.set('GUSERWALLETMOCK', { value: 720, riskBand: 'B', lastUpdated: new Date().toISOString() });
    mockDb.loans.set(1, {
      id: 1,
      lender: 'GDEF...',
      borrower: 'GABC...',
      amount: 500,
      repaid: 0,
      interestRate: 10,
      term: 12,
      status: 'active'
    });
  }
};

/**
 * Mock: Get user's credit score from "Soroban"
 * REPLACE WITH REAL CONTRACT CALL:
 * const score = await soroban.getScore(userAddress);
 */
export const getScore = async (userAddress: Address): Promise<Score> => {
  await simulateNetworkDelay();
  
  const score = mockDb.scores.get(userAddress);
  if (!score) throw new Error(`Score not found for address: ${userAddress}`);
  
  return score;
};

/**
 * Mock: Create loan agreement on "Soroban"
 * REPLACE WITH REAL CONTRACT CALL:
 * const txHash = await soroban.createLoan(terms);
 */
export const createLoan = async (
  lender: Address,
  borrower: Address,
  amount: number,
  interestRate: number,
  term: number,
): Promise<TxHash> => {
  await simulateNetworkDelay();
  
  const loanId = mockDb.loans.size + 1;
  mockDb.loans.set(loanId, {
    id: loanId,
    lender,
    borrower,
    amount,
    repaid: 0,
    interestRate,
    term,
    status: 'active'
  });
  
  return `mock-tx-hash-${loanId}`;
};

/**
 * Mock: Repay loan on "Soroban"
 * REPLACE WITH REAL CONTRACT CALL:
 * await soroban.repay(loanId, amount);
 */
export const repayLoan = async (loanId: number, amount: number): Promise<TxHash> => {
  await simulateNetworkDelay();
  
  const loan = mockDb.loans.get(loanId);
  if (!loan) throw new Error('Loan not found');

  const monthlyRate = loan.interestRate / 100 / 12;
  const totalRepayment = loan.amount * (1 + monthlyRate * loan.term);
  
  loan.repaid += amount;
  if (loan.repaid >= totalRepayment) {
    loan.status = 'repaid';
    loan.repaid = totalRepayment; // Cap repayment at total
  }
  
  return `mock-tx-hash-repay-${loanId}`;
};

/**
 * Mock: Get a loan by its ID
 */
export const getLoan = async (loanId: number): Promise<Loan | undefined> => {
    await simulateNetworkDelay();
    return mockDb.loans.get(loanId);
}

// --- Test Utilities --- //
const simulateNetworkDelay = () => 
  new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

// Initialize mock data on import
initMockSoroban();



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
  status: 'Active' | 'Paid Off' | 'Delinquent' | 'active' | 'repaid' | 'defaulted';
}

// Mock Data Store (Simulates On-Chain State)
const mockDb = {
  scores: new Map<Address, Score>(),
  loans: new Map<number, Loan>(),
  nextLoanId: 1,
};

// --- Mock Functions --- //

/**
 * Initialize mock with test data
 */
export const initMockSoroban = () => {
  if (mockDb.scores.size === 0) { // Prevent re-initialization on hot-reloads
    mockDb.scores.set('GABC...', { value: 720, riskBand: 'B', lastUpdated: new Date().toISOString() });
    mockDb.scores.set('GUSERWALLETMOCK', { value: 720, riskBand: 'B', lastUpdated: new Date().toISOString() });
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
  if (!score) {
    // If no score, create a random one to simulate new user
    const newScore = {
      value: Math.floor(Math.random() * (850 - 550 + 1)) + 550,
      riskBand: 'C' as const,
      lastUpdated: new Date().toISOString()
    };
    mockDb.scores.set(userAddress, newScore);
    return newScore;
  }
  
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
  
  const loanId = mockDb.nextLoanId++;
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
  
  if (isNaN(loanId) || loanId <= 0) {
      throw new Error(`Invalid Loan ID provided for repayment: ${loanId}`);
  }

  // ** SELF-HEALING MOCK **
  // If loan doesn't exist due to hot-reload, create a plausible mock loan to prevent crash
  if (!mockDb.loans.has(loanId)) {
    console.warn(`Loan ID ${loanId} not found in mock DB, likely due to hot-reload. Re-creating mock loan.`);
    mockDb.loans.set(loanId, {
      id: loanId,
      lender: "GMOCKLENDER",
      borrower: "GMOCKBORROWER",
      amount: 1000,
      repaid: 0,
      interestRate: 10,
      term: 12,
      status: 'active'
    });
  }
  
  const loan = mockDb.loans.get(loanId);
  if (!loan) throw new Error('Loan not found'); // Should be unreachable now

  const rate = loan.interestRate / 100 / 12; // monthly rate
  const principal = loan.amount;
  const totalRepayment = loan.term > 0 
    ? (principal * rate * (Math.pow(1 + rate, loan.term))) / (Math.pow(1 + rate, loan.term) - 1) * loan.term
    : principal;
    
  const totalInterest = totalRepayment > principal ? totalRepayment - principal : 0;

  loan.repaid += amount;
  
  if (loan.repaid >= (principal + totalInterest)) {
    loan.status = 'Paid Off';
    loan.repaid = principal + totalInterest; 
  }
  
  return `mock-tx-hash-repay-${loanId}`;
};

/**
 * Mock: Get a loan by its ID
 */
export const getLoan = async (loanId: number): Promise<Loan | undefined> => {
    await simulateNetworkDelay();
    if (isNaN(loanId)) return undefined;
    
     // ** SELF-HEALING MOCK **
    // If loan doesn't exist, create a plausible mock to prevent downstream errors
    if (!mockDb.loans.has(loanId)) {
        mockDb.loans.set(loanId, {
            id: loanId,
            lender: "GMOCKLENDER",
            borrower: "GMOCKBORROWER",
            amount: 1000,
            repaid: 0,
            interestRate: 10,
            term: 12,
            status: 'active'
        });
    }
    return mockDb.loans.get(loanId);
}

// --- Test Utilities --- //
const simulateNetworkDelay = () => 
  new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

// Initialize mock data on import
initMockSoroban();

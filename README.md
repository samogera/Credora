# 🌿 Credora

**Tagline:** *Reimagining creditworthiness for the world’s underserved.*

---

## 🌍 Overview

**Credora** is a decentralized, AI-powered credit scoring platform built on **Stellar** and **Soroban smart contracts**.

We’re reinventing how individuals and small businesses — particularly in **emerging markets** — access credit. By replacing centralized, exclusionary models with transparent, inclusive, and programmable on-chain intelligence, **Credora** unlocks trust where traditional systems fail.

Our platform enables **privacy-preserving credit scores** using a blend of **on-chain activity**, **off-chain alternative data**, and **AI analytics** — empowering lenders, DeFi protocols, and fintechs to make smarter, fairer lending decisions.

---

## 💡 Problem

> Over **1.7 billion** people are unbanked — many of them creditworthy, yet excluded.

Traditional credit systems are:

- ❌ Centralized and opaque  
- ❌ Biased against users with little formal data  
- ❌ Expensive, slow, and limited in reach  

Without valid credit histories, millions are denied access to loans, entrepreneurship, and financial mobility.

---

## ✅ Solution: Credora

**Credora** converts behavioral, transactional, and alternative data into a **verifiable**, **user-owned**, and **on-chain** credit profile.

### 🔑 Key Features

- **🧠 AI-Powered Scoring**  
  Machine learning models trained on diverse, permissioned data (utility bills, mobile usage, remittance history, DeFi activity).

- **🔐 On-Chain Verifiability**  
  Credit scores are cryptographically anchored via Soroban smart contracts — auditable, immutable, and transparent.

- **🆔 User-Owned Identity**  
  Decentralized identifiers (DIDs) allow users to control their data and selectively disclose it.

- **📦 Developer SDK**  
  Seamless integration for wallets, lenders, and dApps via REST APIs or Soroban interfaces.

- **🔒 Privacy by Design** *(Future Roadmap)*  
  zk-Proofs to ensure score verifiability without revealing sensitive data.

---

## 🚀 MVP Scope (SCF-Funded Milestone)

### 1. **User Data Collection dApp**
- Web + mobile dApp  
- Stellar wallet connection  
- Upload utility bills and verify off-chain data  
- Smart contract-based identity linkage

### 2. **AI Credit Scoring Engine**
- Local MVP model using:
  - On-chain Stellar activity (txs, assets)
  - Basic off-chain inputs
- Simulated testing with synthetic users

### 3. **Score Oracle on Soroban**
- Smart contract interface for:
  - Verifiable score anchoring  
  - Non-custodial score retrieval  
  - Integration with lending dApps

### 4. **Partner Dashboard (Alpha)**
- API + UI for fintech partners and lenders  
- Request scores, receive risk metrics  
- Simulate onboarding flows with test profiles

---

## 🌐 Use Cases

| Use Case | Description |
|----------|-------------|
| 💸 DeFi Lending | Onboard undercollateralized borrowers using risk-assessed scores |
| 🌱 Microfinance | Score thin-file users with utility and phone data |
| 🌍 Remittance Apps | Incentivize credit-positive behavior in recurring senders |
| 👩‍💼 Gig Platforms | Verify financial trustworthiness of freelance users |

---

## 📈 Impact Potential

- 🌍 **Financial Inclusion at Scale**: Open credit access for 100M+ people globally  
- 🧠 **De-Risking DeFi**: Smarter, safer, and human-centric lending  
- 🗃️ **New Data Economy**: Users own, control, and monetize their financial reputation  

---

## 🛠️ Tech Stack

| Layer | Tools |
|-------|-------|
| **Blockchain** | Stellar, Soroban |
| **Smart Contracts** | Soroban Rust |
| **Frontend** | Next.js, TypeScript, TailwindCSS |
| **AI / ML** | Python (scikit-learn, XGBoost), Federated Learning (future) |
| **Data Sources** | IPFS, Arweave (for encrypted vaults), Airtime API, Utility APIs |
| **Wallet Integration** | Stellar SDK, Freighter Wallet |
| **Security** | Smart contract audits, data encryption, role-based access |

---

## 👥 Roles & Dashboards

### 🧑‍💼 **User Dashboard**
- Connect wallet  
- View Credora Score  
- AI-powered loan recommendations  
- Apply for loans from partner lenders  
- Track application status

### 🏦 **Partner Dashboard**
- View borrower applications  
- See on-chain credit score and risk band  
- Approve or deny requests  
- Sign loan agreement via Soroban smart contract  
- Track portfolio: loans issued, repayments, ROI

---

## 🧠 AI & Smart Logic

- **AI Loan Matchmaking**: Personalized suggestions for users based on score + loan eligibility  
- **AI Score Breakdown**: Visual + textual explanation of risk factors and how to improve  
- **Smart Contract Enforceability**: Lending agreements tied to Soroban logic (repayment, dispute resolution)

---

## 🛡️ Security & Compliance

- Encrypted data storage (IPFS/Arweave v2)  
- Privacy-first: consented data use  
- Smart contract audits  
- Roadmap to zk-proofs and federated scoring

---

## 🧪 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/credora.git
   cd credora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a new file named `.env` in the root of your project by copying the example file:
     ```bash
     cp .env.example .env
     ```
   - Open the `.env` file and add your Google AI (Gemini) API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
     ```
     GEMINI_API_KEY="YOUR_API_KEY_HERE"
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

>Requires: *Node.js 18+, Stellar SDK, Soroban CLI, Freighter Wallet (for browser testing)*

## 🤝 Contributing

We welcome contributions to:

- AI scoring models  
- Soroban contract development  
- Data integrations (utility APIs, mobile usage, etc.)  
- UX feedback and accessibility improvements  

Open a PR or issue — let’s build inclusive finance together.

---

## 📬 Contact & Links

- Project Lead: **Samogera**  
- Website: [credora.app](https://credora.app) *(placeholder)*  
- Email: hello@credora.app  

---

> © 2025 Credora — *Built with purpose on Stellar*

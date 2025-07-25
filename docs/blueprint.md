# **App Name**: Credora

## Core Features:

- Data Collection: A decentralized web/mobile dApp where users: Connect their Stellar wallet to track on-chain activity, Upload utility bills or other proof-of-expense data, Link off-chain identifiers (e.g. phone number) to a smart contract–based identity, Retain full control of their data via consented disclosure
- AI Credit Scoring Engine: An MVP machine learning model tool that: Operates locally using synthetic + opt-in real user data, Combines Stellar activity (tx frequency, asset holdings) with uploaded off-chain signals, Produces a Credora Score with risk category, trust level, and confidence band, Built to iterate into a privacy-preserving, federated model in future phases
- Score Oracle on Soroban: A Soroban-based smart contract module that: Issues verifiable, on-chain credit scores tied to user wallets, Allows any dApp, wallet, or lender to query scores with user permission, Provides on-chain audit trail for transparency, Anchors scores cryptographically without exposing raw input data
- Partner Dashboard (Alpha): A web interface for fintechs, lenders, and ecosystem partners to: Request test scores via API or UI, View simulated risk profiles, Evaluate scoring reliability and adjust risk appetite, Simulate borrower onboarding with Credora credentials

## Style Guidelines:

- Primary: Vibrant Green `#50D890` — evokes trust, innovation, and financial empowerment
- Background: Light Green `#EBF9F2` — subtle and calming, ideal for dashboards and forms
- Accent: Warm Yellow `#F4D03F` — used sparingly for highlights, CTAs, and alert states
- UI Font: `Inter` — clean, highly legible, ideal for multilingual interfaces and mobile
- Code/On-chain Data Font: `Source Code Pro` — monospace font for technical fidelity and Web3 feel
- Use clean, modern icons to represent: Data sources (wallet, documents, utility API), Score health (green/yellow/red indicators), Actions (sync, score, share)
- Prioritize information hierarchy with card-based UI, collapsible score breakdowns, and sticky action bars
- Ensure mobile-first responsiveness for accessibility in low-bandwidth regions
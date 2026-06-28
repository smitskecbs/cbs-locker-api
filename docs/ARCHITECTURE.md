# Architecture

This document describes the planned system architecture for CBS Locker API.

## High-Level Data Flow

```
Browser / Client
       │
       ▼
┌─────────────────────┐
│   CBS Locker API    │
│   (Read-only HTTP)  │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│    Solana RPC       │
│  (Mainnet cluster)  │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│  CBS Locker Program │
│  DA1sh6XTa13QQ23... │
└─────────────────────┘
```

## Components

### Browser / Client

Any HTTP client that consumes verification data:

- Web dashboards and token pages
- Third-party explorers (DexScreener, Birdeye, etc.)
- Wallets and dApps displaying lock badges
- Automated monitoring and alerting tools

Clients send read-only GET requests. No wallet connection or transaction signing is required.

### CBS Locker API

The application layer responsible for:

- Accepting and validating HTTP requests
- Resolving lock PDAs, mints, and pair addresses
- Fetching and decoding on-chain account data
- Aggregating lock information where applicable
- Returning structured JSON responses
- Caching frequently requested data (planned)
- Rate limiting and error handling (planned)

The API has no access to private keys and performs no on-chain writes.

### Solana RPC

The API connects to Solana mainnet via RPC to:

- Fetch account data for lock PDAs
- Query program-owned accounts filtered by mint or pair
- Retrieve current slot and block time for response metadata

RPC provider selection and failover strategy will be defined during Phase 2 implementation.

### CBS Locker Program

The on-chain source of truth for all lock state.

| Property | Value |
|----------|-------|
| Network | Solana Mainnet |
| Program ID | `DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU` |

The program stores lock accounts containing:

- Locked asset type (SPL token, LP token, CLMM position NFT)
- Token mint or position identifier
- Locked amount
- Unlock timestamp
- Lock owner

All verification logic ultimately derives from decoding and validating data against this program's account schema.

## Supported Asset Verification Paths

```
SPL Token
  └── GET /verify/mint/{mint}
  └── GET /verify/lock/{lockPda}

Standard AMM LP Token
  └── GET /verify/mint/{lpMint}
  └── GET /verify/pair/{pairAddress}

Raydium CLMM Position NFT
  └── GET /verify/mint/{positionMint}
  └── GET /verify/pair/{poolAddress}
```

## Planned Source Layout

```
src/
├── routes/       # HTTP route handlers
├── services/     # On-chain data fetching and verification logic
├── types/        # Shared TypeScript types and response schemas
└── utils/        # Helpers (address validation, encoding, etc.)
```

Implementation details for each layer will be added during Phase 2.

## Design Principles

1. **Read-only** — The API never submits transactions or holds funds.
2. **On-chain truth** — All verification is derived from live Solana state, not cached assumptions.
3. **Stateless requests** — Each verification request is independently verifiable.
4. **Public access** — No authentication required for standard verification endpoints.
5. **Transparency** — Responses include slot and program ID so clients can audit freshness.

## Security Considerations (Planned)

- Input validation on all address parameters (Base58, length checks)
- Confirmation that fetched accounts are owned by the CBS Locker program
- Rate limiting to protect RPC infrastructure
- No exposure of internal RPC endpoints or credentials

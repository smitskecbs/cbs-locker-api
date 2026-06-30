# CBS Locker Integration Guide

This guide describes how third-party platforms — including DexScreener, Birdeye, wallets, and block explorers — can integrate CBS Token Locker verification into their products.

---

## Overview

CBS Token Locker is a Solana program that lets a wallet deposit tokens or position assets into a program-controlled vault until a fixed unlock time. Each lock is represented by an on-chain account (a lock PDA) that stores the owner, mint, amount, unlock schedule, token type, and unlock state.

The CBS Locker API is a read-only verification service. It fetches live data from Solana mainnet and returns structured JSON. Integrators do not need to run their own RPC infrastructure or decode program accounts to display basic lock status.

Supported lock categories:

| Type | Description |
|------|-------------|
| SPL | Standard fungible SPL tokens |
| LP | Standard AMM liquidity pool tokens |
| CLMM | Raydium concentrated-liquidity position NFTs |

Verification confirms on-chain account ownership and lock data. It does not evaluate project quality, token price, pool safety, or future performance.

---

## Mainnet Program ID

```
DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU
```

All lock accounts verified through this API must be owned by this program on Solana mainnet.

---

## API

**Base URL:** https://cbs-locker-api.vercel.app/api

**Metadata endpoint:** `GET /api` returns service version, network, program ID, and available endpoint paths.

No authentication is required. All endpoints are read-only `GET` requests.

---

## Swagger Documentation

Interactive API documentation is available at:

https://cbs-locker-api.vercel.app/docs

The OpenAPI 3.0 specification is available at:

https://cbs-locker-api.vercel.app/openapi.json

---

## Health Check

```
GET /health
```

**Full URL:** https://cbs-locker-api.vercel.app/health

Use this endpoint to confirm the service is running. It does not call Solana RPC.

**Example response:**

```json
{
  "status": "ok",
  "service": "CBS Locker API",
  "version": "1.0.0",
  "network": "mainnet",
  "programId": "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU"
}
```

---

## Verify a Lock

```
GET /api/v1/verify/lock/{lockPda}
```

**Full URL example:**

```
https://cbs-locker-api.vercel.app/api/v1/verify/lock/ANwBf2LnyJZ7YimEGNGZwbtAJ6M5ZU1P8w1gZCQPrvyG
```

Use this endpoint when you have a specific lock account address (PDA) and need to confirm it is a valid CBS Locker account with decoded lock data.

### Important fields

| Field | Type | Description |
|-------|------|-------------|
| `verified` | `boolean` | `true` when the account exists, is owned by the CBS Locker program, and decodes as a valid TokenLock account |
| `accountExists` | `boolean` | Whether an account was found at the given address |
| `programMatches` | `boolean` | Whether the account owner equals the CBS Locker program ID |
| `lock.isUnlocked` | `boolean` | On-chain unlock state. `false` means the lock has not been withdrawn yet |
| `lock.unlockTimestamp` | `number` | Unix timestamp (seconds) after which the owner may unlock |
| `lock.tokenType` | `string` | Lock category: `spl`, `lp`, `clmm`, or `unknown` |

A lock with `verified: true` and `lock.isUnlocked: false` where the current time is before `lock.unlockTimestamp` is actively locked.

---

## Verify a Mint

```
GET /api/v1/verify/mint/{mint}
```

**Full URL example:**

```
https://cbs-locker-api.vercel.app/api/v1/verify/mint/6JNhvBSgbkZr66PDmZUmrtGaJj43qQZb51YerWoZhqSU
```

Use this endpoint to find all CBS Locker lock accounts associated with a token mint. The API queries the CBS Locker program on-chain and filters accounts by mint address.

### Important fields

| Field | Type | Description |
|-------|------|-------------|
| `verified` | `boolean` | `true` when one or more CBS Locker accounts were found for the mint |
| `totalLocks` | `number` | Total number of lock accounts found for this mint (active and inactive) |
| `activeLocks` | `number` | Locks where `isUnlocked` is `false` and the current time is before `unlockTimestamp` |
| `locks` | `array` | List of `{ lockPda, lock }` entries with full decoded lock data |

An active lock is one that has not been unlocked on-chain and whose unlock time is still in the future.

---

## Token Summary

```
GET /api/v1/verify/token/{mint}
```

**Full URL example:**

```
https://cbs-locker-api.vercel.app/api/v1/verify/token/6JNhvBSgbkZr66PDmZUmrtGaJj43qQZb51YerWoZhqSU
```

Use this endpoint for integration-friendly summaries. It uses the same on-chain search as `/verify/mint` but returns aggregate fields suitable for badges and token profile displays.

### Important fields

| Field | Type | Description |
|-------|------|-------------|
| `verified` | `boolean` | `true` when at least one active lock exists for the mint |
| `activeLockedAmount` | `string` | Sum of locked amounts across all active locks, in base units (string for JSON safety) |
| `nextUnlockTimestamp` | `number` | Earliest `unlockTimestamp` among active locks (Unix seconds) |
| `largestActiveLock` | `object` | The active lock with the highest amount: `lockPda`, `amount`, `unlockTimestamp` |
| `tokenType` | `string` | `spl`, `lp`, `clmm`, or `unknown` — derived from active locks, or the first known lock if none are active |
| `locker` | `string` | Locker identifier: `CBS Token Locker` |

`verified: false` is returned when no locks exist, or when locks exist but none are currently active.

---

## Integration Flow

Recommended flow for displaying a lock badge on a token page:

```
Mint address
      │
      ▼
GET /api/v1/verify/token/{mint}
      │
      ▼
verified === true  AND  activeLocks > 0 ?
      │
      ├── No  →  Do not display lock badge
      │
      └── Yes →  Display lock badge
                 Use activeLockedAmount, nextUnlockTimestamp,
                 tokenType, and largestActiveLock for display
```

### Example integration logic

```javascript
const response = await fetch(
  `https://cbs-locker-api.vercel.app/api/v1/verify/token/${mintAddress}`
);
const data = await response.json();

if (data.verified && data.activeLocks > 0) {
  // Show lock badge
  // data.activeLockedAmount  — total locked (base units)
  // data.nextUnlockTimestamp — earliest unlock (Unix seconds)
  // data.tokenType           — spl | lp | clmm
  // data.largestActiveLock   — largest single active lock
}
```

### When to use each endpoint

| Use case | Endpoint |
|----------|----------|
| Token page lock badge | `GET /api/v1/verify/token/{mint}` |
| List all locks for a mint | `GET /api/v1/verify/mint/{mint}` |
| Verify a specific lock account | `GET /api/v1/verify/lock/{lockPda}` |
| Service availability check | `GET /health` |

---

## GitHub

| Repository | Description |
|------------|-------------|
| [cbs-locker-api](https://github.com/smitskecbs/cbs-locker-api) | CBS Locker verification API (this project) |
| [cbs-token-locker](https://github.com/cbs-token-locker) | CBS Token Locker Solana program and specifications |

Additional documentation in this repository:

- [API Reference](API.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)

---

## License

This API and its documentation are released under the [MIT License](../LICENSE).

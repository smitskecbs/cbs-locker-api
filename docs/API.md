# API Reference

> **Status:** Documentation only. Endpoints are not yet implemented.

Base URL (planned): `https://api.cbslocker.io`

All endpoints are read-only and return JSON. Version prefix: `/api/v1`.

## Authentication

No authentication is required for verification endpoints. Rate limiting may apply in production.

---

## GET /health

Simple service health check. Does not call Solana RPC.

### Example Request

```
GET /health
```

### Example Response

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

## GET /api

Service metadata and available endpoint paths.

### Example Request

```
GET /api
```

### Example Response

```json
{
  "name": "CBS Locker API",
  "version": "1.0.0",
  "network": "mainnet",
  "programId": "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU",
  "documentation": "/docs",
  "health": "/health",
  "endpoints": [
    "/api/v1/verify/lock/:lockPda",
    "/api/v1/verify/mint/:mint",
    "/api/v1/verify/token/:mint"
  ]
}
```

---

## GET /openapi.json

OpenAPI 3.0 specification for this API (JSON).

### Example Request

```
GET /openapi.json
```

---

## GET /docs

Interactive Swagger UI for this API. Loads the spec from `/openapi.json`.

### Example Request

```
GET /docs
```

Open in a browser to explore and try endpoints.

---

## GET /api/v1/verify/lock/{lockPda}

Verify a specific CBS Locker lock account by its Program Derived Address (PDA).

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `lockPda` | `string` | Base58-encoded lock account address |

### Example Request

```
GET /api/v1/verify/lock/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### Example Response (Planned)

```json
{
  "verified": true,
  "lockPda": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "programId": "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU",
  "assetType": "spl_token",
  "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "lockedAmount": "1000000000",
  "unlockTimestamp": 1735689600,
  "owner": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "slot": 285000000,
  "blockTime": 1735600000
}
```

### Error Responses (Planned)

| Status | Description |
|--------|-------------|
| `400` | Invalid PDA format |
| `404` | Lock account not found or not owned by CBS Locker program |
| `503` | Solana RPC unavailable |

---

## GET /api/v1/verify/mint/{mint}

Find all CBS Locker lock accounts for a token mint. Uses `getProgramAccounts` with a memcmp filter on the mint field at byte offset 40.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `mint` | `string` | Base58-encoded SPL token mint address |

### Example Request

```
GET /api/v1/verify/mint/6JNhvBSgbkZr66PDmZUmrtGaJj43qQZb51YerWoZhqSU
```

### Example Response (locks found)

```json
{
  "verified": true,
  "mint": "6JNhvBSgbkZr66PDmZUmrtGaJj43qQZb51YerWoZhqSU",
  "programId": "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU",
  "totalLocks": 1,
  "activeLocks": 1,
  "locks": [
    {
      "lockPda": "ANwBf2LnyJZ7YimEGNGZwbtAJ6M5ZU1P8w1gZCQPrvyG",
      "lock": {
        "owner": "8Y7wEBB15f8mpQ7H5Wa1pVdo1TNSg2KE7rLKApHUk5Zd",
        "mint": "6JNhvBSgbkZr66PDmZUmrtGaJj43qQZb51YerWoZhqSU",
        "vault": "7kKtRoQuE3ZRJHRUtcUX7HPwJB3t6tLDeZuDXN3gJx7v",
        "amount": "10916771364",
        "unlockTimestamp": 1784359800,
        "createdAt": 1781767586,
        "lockSeed": "1781767584981",
        "isUnlocked": false,
        "bump": 255,
        "vaultBump": 254,
        "projectName": "CBS_Coin (2/2)",
        "tokenProgram": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "tokenType": "lp"
      }
    }
  ],
  "message": "CBS Locker locks found for mint."
}
```

### Example Response (no locks)

```json
{
  "verified": false,
  "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "programId": "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU",
  "totalLocks": 0,
  "activeLocks": 0,
  "locks": [],
  "message": "No CBS Locker locks found for mint."
}
```

### Active lock definition

A lock counts as **active** when:

- `lock.isUnlocked === false`
- current Unix time is before `lock.unlockTimestamp`

### Supported Asset Types

- SPL Tokens
- Standard AMM LP Tokens (when the mint represents an LP token)
- Raydium CLMM Position NFTs (when queried by position mint)

### Error Responses

| Status | Description |
|--------|-------------|
| `200` | Invalid mint address (`verified: false` in body) |
| `200` | No locks found (`verified: false` in body) |
| `503` | Solana RPC unavailable |

---

## GET /api/v1/verify/token/{mint}

Integration-friendly summary for a token mint. Uses the same on-chain lock search as `/verify/mint`, but returns aggregate fields only.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `mint` | `string` | Base58-encoded SPL token mint address |

### Example Request

```
GET /api/v1/verify/token/6JNhvBSgbkZr66PDmZUmrtGaJj43qQZb51YerWoZhqSU
```

### Example Response (active locks)

```json
{
  "verified": true,
  "mint": "6JNhvBSgbkZr66PDmZUmrtGaJj43qQZb51YerWoZhqSU",
  "programId": "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU",
  "locker": "CBS Token Locker",
  "tokenType": "lp",
  "totalLocks": 7,
  "activeLocks": 1,
  "activeLockedAmount": "10916771364",
  "nextUnlockTimestamp": 1784359800,
  "largestActiveLock": {
    "lockPda": "ANwBf2LnyJZ7YimEGNGZwbtAJ6M5ZU1P8w1gZCQPrvyG",
    "amount": "10916771364",
    "unlockTimestamp": 1784359800
  },
  "message": "Active CBS Locker lock found for mint."
}
```

### Example Response (locks exist, none active)

```json
{
  "verified": false,
  "mint": "6JNhvBSgbkZr66PDmZUmrtGaJj43qQZb51YerWoZhqSU",
  "programId": "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU",
  "locker": "CBS Token Locker",
  "tokenType": "lp",
  "totalLocks": 7,
  "activeLocks": 0,
  "message": "No active CBS Locker locks found for mint."
}
```

### Summary field rules

| Field | Rule |
|-------|------|
| `activeLocks` | Locks where `isUnlocked === false` and `now < unlockTimestamp` |
| `activeLockedAmount` | Sum of active lock `amount` values (string) |
| `tokenType` | From active locks if any, else first known lock, else `unknown` |
| `nextUnlockTimestamp` | Earliest `unlockTimestamp` among active locks |
| `largestActiveLock` | Active lock with the highest `amount` |

### Error Responses

| Status | Description |
|--------|-------------|
| `200` | Invalid mint address (`verified: false` in body) |
| `200` | No locks or no active locks (`verified: false` in body) |
| `503` | Solana RPC unavailable |

---

## GET /api/v1/verify/pair/{pairAddress}

Verify lock status for a liquidity pair. Useful for DEX integrations that need to confirm LP token or CLMM position locks tied to a specific trading pair.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pairAddress` | `string` | Base58-encoded pair or pool address |

### Example Request

```
GET /api/v1/verify/pair/58oQChx4yWmvKdwLLZzBiPb9m64b9F9XQHk2d3K8s7N
```

### Example Response (Planned)

```json
{
  "verified": true,
  "pairAddress": "58oQChx4yWmvKdwLLZzBiPb9m64b9F9XQHk2d3K8s7N",
  "pairType": "amm",
  "baseMint": "So11111111111111111111111111111111111111112",
  "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "lockedLpSupply": "1500000000",
  "lockedPercentage": 75.5,
  "locks": [
    {
      "lockPda": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      "assetType": "lp_token",
      "lockedAmount": "1500000000",
      "unlockTimestamp": 1735689600
    }
  ],
  "slot": 285000000
}
```

### Error Responses (Planned)

| Status | Description |
|--------|-------------|
| `400` | Invalid pair address format |
| `404` | Pair not found or no associated locks |
| `503` | Solana RPC unavailable |

---

## Common Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `verified` | `boolean` | Whether on-chain verification succeeded |
| `programId` | `string` | CBS Locker program ID on mainnet |
| `slot` | `number` | Solana slot at time of verification |
| `blockTime` | `number` | Unix timestamp of the slot (when available) |

## Program ID

All verification is performed against the CBS Locker program on Solana mainnet:

```
DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU
```

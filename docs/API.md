# API Reference

> **Status:** Documentation only. Endpoints are not yet implemented.

Base URL (planned): `https://api.cbslocker.io`

All endpoints are read-only and return JSON. Version prefix: `/api/v1`.

## Authentication

No authentication is required for verification endpoints. Rate limiting may apply in production.

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

Verify lock coverage for a token mint. Returns aggregate and individual lock information for all CBS Locker accounts associated with the mint.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `mint` | `string` | Base58-encoded SPL token mint address |

### Example Request

```
GET /api/v1/verify/mint/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Example Response (Planned)

```json
{
  "verified": true,
  "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "totalLocked": "5000000000",
  "lockCount": 3,
  "locks": [
    {
      "lockPda": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      "lockedAmount": "2000000000",
      "unlockTimestamp": 1735689600,
      "owner": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
    }
  ],
  "slot": 285000000
}
```

### Supported Asset Types

- SPL Tokens
- Standard AMM LP Tokens (when the mint represents an LP token)
- Raydium CLMM Position NFTs (when queried by position mint)

### Error Responses (Planned)

| Status | Description |
|--------|-------------|
| `400` | Invalid mint address format |
| `404` | No locks found for this mint |
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

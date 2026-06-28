# CBS Locker API

The official public verification API for [CBS Token Locker](https://github.com/cbs-token-locker) on Solana.

This service provides read-only endpoints that allow anyone to verify lock status, mint-level lock coverage, and liquidity pair lock information without interacting with the blockchain directly.

## Overview

CBS Locker API will become the canonical verification layer for CBS Token Locker. Third-party platforms, explorers, and dashboards can integrate with this API to display accurate lock data for tokens and liquidity positions secured by the CBS Locker program.

All responses are derived from on-chain state via Solana RPC and the CBS Locker program. No custodial keys or write operations are involved.

## Supported Assets

| Asset Type | Description |
|------------|-------------|
| **SPL Tokens** | Standard fungible tokens locked via CBS Locker |
| **Standard AMM LP Tokens** | Liquidity pool tokens from supported AMM protocols |
| **Raydium CLMM Position NFTs** | Concentrated liquidity position NFTs on Raydium CLMM |

## Program ID (Mainnet)

```
DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU
```

## API Endpoints (Planned)

The following endpoints are documented for future implementation. They are not yet available.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/verify/lock/{lockPda}` | Verify a specific lock account by its PDA |
| `GET` | `/api/v1/verify/mint/{mint}` | Verify lock status for a token mint |
| `GET` | `/api/v1/verify/pair/{pairAddress}` | Verify lock status for a liquidity pair |

See [docs/API.md](docs/API.md) for detailed endpoint specifications.

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/API.md) | Endpoint specifications and response schemas |
| [Architecture](docs/ARCHITECTURE.md) | System design and data flow |
| [Roadmap](docs/ROADMAP.md) | Development phases and milestones |

## Project Status

This repository is in **Phase 1: Documentation**. No server or endpoints are implemented yet.

## License

[MIT](LICENSE)

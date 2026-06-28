# Roadmap

Development phases for CBS Locker API, from documentation through public integration.

---

## Phase 1 — Documentation

**Status:** In progress

Establish project foundation and specifications before any implementation.

- [x] Repository structure and licensing
- [x] README with project overview and supported assets
- [x] API endpoint specifications (`docs/API.md`)
- [x] Architecture documentation (`docs/ARCHITECTURE.md`)
- [x] Development roadmap (`docs/ROADMAP.md`)
- [ ] Finalize response schemas with real on-chain account layouts
- [ ] Define error code standards and HTTP status conventions

**Goal:** A complete, reviewable specification that implementation can follow without ambiguity.

---

## Phase 2 — Verification API

Build and deploy the core read-only verification service.

- [ ] Select runtime and HTTP framework
- [ ] Implement Solana RPC client integration
- [ ] Decode CBS Locker program account data
- [ ] `GET /api/v1/verify/lock/{lockPda}`
- [ ] `GET /api/v1/verify/mint/{mint}`
- [ ] `GET /api/v1/verify/pair/{pairAddress}`
- [ ] Support for SPL Tokens, Standard AMM LP Tokens, and Raydium CLMM Position NFTs
- [ ] Input validation and structured error responses
- [ ] RPC caching and rate limiting
- [ ] Deploy to production infrastructure
- [ ] Health check and monitoring endpoints

**Goal:** A reliable, publicly accessible verification API backed by live mainnet data.

---

## Phase 3 — Public Documentation

Make the API discoverable and easy to integrate for external developers.

- [ ] Interactive API documentation (OpenAPI / Swagger)
- [ ] Integration guides and code examples (JavaScript, Python, curl)
- [ ] Response schema reference with field descriptions
- [ ] Changelog and versioning policy
- [ ] Status page for API uptime and incidents
- [ ] Developer portal or dedicated docs site

**Goal:** Third-party developers can integrate verification in minutes without contacting the team.

---

## Phase 4 — Third-Party Platform Integration

Partner with major Solana ecosystem platforms to surface CBS Locker verification natively.

- [ ] DexScreener lock badge integration
- [ ] Birdeye token profile lock indicator
- [ ] Additional DEX and explorer partnerships
- [ ] Embeddable verification widget for project websites
- [ ] Webhook or subscription API for lock status changes (evaluate demand)

**Goal:** CBS Locker verification is visible wherever tokens and pairs are displayed across the Solana ecosystem.

---

## Program Reference

| Property | Value |
|----------|-------|
| Network | Solana Mainnet |
| Program ID | `DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU` |

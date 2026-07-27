# AapdaSetu Blockchain Module

This folder contains the Ethereum audit layer for AapdaSetu AI.

The blockchain module does not run AI, create a token, move real money, or store large files. It records compact, immutable proof of AI recommendations, government approvals, rejections, and release status updates.

## Commands

```bash
npm run compile
npm test
npm run export:abi
npm run deploy:sepolia
```

## Key Files

- `contracts/AapdaSetu.sol` - Solidity smart contract for disaster recommendation audit records.
- `test/AapdaSetu.test.js` - Hardhat unit tests for access control, status transitions, history, and validation.
- `scripts/deploy.js` - Deploys the contract and writes network deployment metadata.
- `scripts/export-abi.js` - Exports ABI for backend/frontend integration.
- `abi/AapdaSetu.json` - Generated ABI consumed by app services.
- `deployments/*.json` - Generated contract addresses per network.
- `docs/BLOCKCHAIN_ARCHITECTURE.md` - Full implementation blueprint.

# Candid-to-Zod Generator ⚡️

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3068b7?style=for-the-badge&logo=zod&logoColor=white)
![Internet Computer](https://img.shields.io/badge/Internet%20Computer-29ABE2?style=for-the-badge&logo=internetcomputer&logoColor=white)

Candid-to-Zod Generator is an isomorphic TypeScript tool that bridges the gap between the Internet Computer frontend requests and robust client-side typing. It converts `dfx` generated `.did.js` AST structures instantly into powerful TypeScript Zod validation schemas.

## Web App Interface
A sleek, dual-pane glassmorphism GUI allows developers to instantly paste their Candid `.did.js` exports and securely render Zod types natively in their browser.

To run the local web server:
```bash
npm install
npm run dev
```

## Node CLI (Local Engine)
The core logic resides under the isomorphic `candid-to-zod` engine! It's structured as a library to be used natively across JS/TS.

```bash
# Example generating types locally in terminal
candid-to-zod -i declarations/my_canister.did.js -o src/schemas/my_canister.ts
```

## How to use Zod?
Once your schemas are generated, you can validate canister data instantly and assure your client state perfectly mirrors the blockchain state!

```ts
import { getUserRetSchema } from './schema';

// Calling a canister function that returns a complex UserRecord
const response = await actor.getUser(principal);

// Securely parse data using Zod inferred typing
const safeData = getUserRetSchema.parse(response);

// safeData is now thoroughly validated to match the original Candid layout!
console.log(safeData.name);
```

## Built by
Developed and maintained by [Ibnyahyah](https://github.com/Ibnyahyah).

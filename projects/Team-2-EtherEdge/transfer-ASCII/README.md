# Nft-Solidity
 Homework for Blockchain class, creating an Nft ERC721 token using Solidity.

## Task

Non-fungible tokens can represent ownership over digital or physical assets. These tokens are distinguishable, and you must track the ownership of each one separately.

Design and implement an **ERC721 compliant digital image token.** (You can find the associated Ethereum Improvement Proposal here: https://eips.ethereum.org/EIPS/eip-721 If your platform is not Solidity, adapt the ERC721 specification accordingly.)

Each digital image token shall have a **unique identifier** and an **URL** (the location of the image). Users can **create new tokens** and then **buy and sell** them among themselves (in Solidity, for Ether. Otherwise, create some sort of *“unit of value”* on the ledger that we assume the participants accept). Each token should have one owner at any time. The number of tokens a user may own is not limited.

Homework owner: Bendegúz Gyönki

## Developer enviroment setup

1. Install [Visual Studio Code](https://code.visualstudio.com)
2. Install [Solidity](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) plugin for Visual Studio Code (used for proper syntax highlighting)
3. Install [Ganche](https://www.trufflesuite.com/ganache) for a local blockchain
4. Clone this project to a desired folder

## Installing dependencies

```bash
npm install
```

## Building the Token

```bash
npm run compile
```

## Testing

Test files can be located under `/test` folder

To run the tests run the following command

```bash
npm test
```
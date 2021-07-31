## Team#16: Treasury research
#### - A decentralized Quant Trading platform

### Product direction
Quant-trading, Decentralized data market, Off-chain computation, Cross-chain interaction, theGraph, Chainlink, MCDEX, Arbitrum

### Introduction
Treasury research is a decentralized quant trading platform. Treasury research built upon highly secured and trustless data flow architecture, **which allows professional quants/traders to create advanced trading strategies with seamless on-chain / off-chain data access, trustworthy decentralized off-chain calculation and cross-chain trading execution.**  

- TR will provides a variety of data market
- TR is a de-quant strategy cross-chain & cross-platform fulfilling master board.


### Product design highlights

Data accessibility and seamlessly - To allow quants access to universal data factors on-chain / off-chain in a seamless manner, Treasury research uses theGraph to query on-chain data, such that executable quants program can query fresh data directly from blockchain. Also, TR uses Chainlink oracle to handle a variety of data queries and post aggregation, such that the entire data flow is entirely implemented in a trustworthy manner.

Another thing worth to highlight, Treasury research uses Chainlink oracle as a trading strategy executable environment to consolidate different types of row data and signals, and make executable calculation and, eventually, fulfill the execution on trading platform MCDEX.

With MCDEX’s Mai protocol, we can easily fulfill quants’ execution strategy on-chain instantly and securely.

In Treasury research, we are empowered by
the Graph’s versatility of on-chain indexing and query;
Chainlink oracle capability of on-chain/off-chain data access and off-chain computation, additionally, we also benefited by Chainlink’s accessibility on different blockchains.
With MCDEX, Quant strategy can be easily executed in MCDEX derivatives platform instantly and securely, MCDEX is building upon Arbitrum, which is a layer 2 solution with high performance and low cost. 



### Code  Struct

```
+-- contracts
    +-- keeper
    |   +-- theGraphEAKeeper.sol
    +-- oracle
    |   +-- oracle.sol
    +-- mcdex-mai
    |   +-- mcdex.sol
    priceConsumerV3.sol
    theGraphDataEA.sol
```

#### **oracle.sol** 
chainlink oracle contracts

#### **mcdex.sol** 
mcdex contracts ,this contains **approve**、**deposit**、**tradeBuy**、**tradeSell**

#### **priceConsumerV3.sol**
get Arbitrum UNI-USD price.sol

#### **theGraphDataEA.sol**
chianlink External Adapters.

#### **theGraphEAKeeper.sol**
chianlink keeper. this auto call theGraphDataEA.


### Github link
https://github.com/Treasury-research/TR-theGraph-Chainlink-EA

### Demo link


### Ethereum Wallet Address
0x2858F95DBf90FA9876972150DD303b1024E86179

### Documentation
#### Product & tech docs
https://docs.google.com/document/d/1lXZnjveEo0auYCogztoEqjKRZnxsyqEQE9CaevpH6O4/edit?usp=sharing

#### Pitch deck
https://docs.google.com/presentation/d/1dK8rBgWmJkh5w2fzypOWWTOcGu6gPXXzElGZZADZFxw/edit?usp=sharing

### Twitter handle
https://twitter.com/wenqingyu


### Team information
**Yu Wenqing** - Team leader & product manager, previously worked for BTCChina and Fundamental labs, He is also worked for Chainlink as a Developer advocate and solution architect.

**Wei Yang** - Smart contract developer, previously worked for multiple internet startups, Wei has strong development experience on Python, Node.js, and Solidity.

**Harry Hong** - Data engineering, previously worked for Web3 foundation and multiple blockchain startups, Harry has plenty of blockchain technology experience, he is also a crypto enthusiast.

**Jamie Cheng** - Solution architect, previously worked for BTCChina, Jamie also found a blockchain startup in 2018, he also worked for some famous blockchain projects as architect and technology advisors.

**Ms. X** - Financial product manager, Ms. X requires to stay anonymous, she worked for a topped crypto corporate institution as a research analyst, she has strong capability in financial data analysis and solid experience on on-chain DeFi data analysis.




### Credit
This EA was built upon a Chainlink EA template which created by @Patrick Collions
https://blog.chain.link/build-and-use-external-adapters/
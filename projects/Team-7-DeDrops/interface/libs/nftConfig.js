export const tabList = [
  {
    key: "all",
    text: "全部",
  },
  {
    key: "dedrops",
    text: "DeDrops",
  },
  {
    key: "chainlink",
    text: "Chainlink",
  },
  {
    key: "thegraph",
    text: "TheGraph",
  },
];

export const mintConditions = [
  {
    key: "sushi-swap",
    text: "Sushiswap 交易",
  },
  {
    key: "uniswap-swap",
    text: "Uniswap 交易",
  },
  {
    key: "uniswap-addlp",
    text: "Uniswap 添加流动性",
  },
  {
    key: "sushi-gov",
    text: "Sushi 治理",
  },
  {
    key: "gitcoin-grant",
    text: "Gitcoin grant 捐赠",
  },
  {
    key: "l2-hack",
    text: "参与 Layer2 Hackthon 2021",
  },
];

export const fakeData = [
  {
    id: "0",
    name: "资深 Defi 玩家",
    img: "https://images.unsplash.com/photo-1623973792500-d2fa0aad9723?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2450&q=80",
    desc: "热衷在DeFi世界里进行探索的玩家",
    claimed: "10",
    total: "100",
    contract: "asdfasdfasdfasdfsdasdfasdfasdf",
    mintBy: "adfasdfasdf2314234234dfdfasdf",
    tag: "DeDrops",
    key: "dedrops",
    claimCondition: [
      {
        id: "uniswap-swap",
        count: "1",
      },
      {
        id: "uniswap-addlp",
        count: "1",
      },
      {
        id: "sushi-gov",
        count: "1",
      },
    ],
  },
  {
    id: "1",
    name: "Graph 开发者",
    img: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80",
    desc: "TheGraph 的高级玩家",
    claimed: "10",
    total: "100",
    contract: "asdfasdfasdfasdfsdasdfasdfasdf",
    mintBy: "adfasdfasdf2314234234dfdfasdf",
    tag: "TheGraph",
    key: "thegraph",
    claimCondition: [
      {
        id: "uniswap-swap",
        count: "1",
      },
      {
        id: "uniswap-addlp",
        count: "1",
      },
      {
        id: "sushi-gov",
        count: "1",
      },
    ],
  },
  {
    id: "2",
    name: "L2 Hackthon 参与者",
    img: "https://images.unsplash.com/photo-1602529710584-458a995c8785?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2550&q=80",
    desc: "L2 Hackthon 参赛选手，观众，评委等",
    claimed: "10",
    total: "100",
    contract: "asdfasdfasdfasdfsdasdfasdfasdf",
    mintBy: "adfasdfasdf2314234234dfdfasdf",
    tag: "Chainlink",
    key: "chainlink",
    claimCondition: [
      {
        id: "uniswap-swap",
        count: "1",
      },
      {
        id: "uniswap-addlp",
        count: "1",
      },
      {
        id: "sushi-gov",
        count: "1",
      },
    ],
  },
];

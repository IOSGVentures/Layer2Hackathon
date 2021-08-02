const tbodyTarget = document.querySelector('#synth tbody'); //const graphTotalIssuedTarget = document.querySelector('#graphTotalIssued');

const changeBtn = document.getElementById('change');
const networkTarget = document.querySelector('#network var');
const SUPPORTED_NETWORKS = {
  'mainnet': 1,
  'ropsten': 3,
  'rinkeby': 4,
  'kovan': 42
};
const network = 1;
const networkId = SUPPORTED_NETWORKS[network];
const snxjs = new SynthetixJs.SynthetixJs({
  networkId
});
const fromBlock = 0;
const blockOptions = fromBlock ? {
  blockTag: Number(fromBlock)
} : {};

if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask is installed!');
}

const loadingGIF = '<img src="https://media.giphy.com/media/TvLuZ00OIADoQ/giphy.gif" width=150 />';
const accounts = ethereum.request({
  method: 'eth_requestAccounts'
});
const account = accounts[0];
const showAccount = document.querySelector('.showAccount');

async function getAccount() {
  const accounts = await ethereum.request({
    method: 'eth_requestAccounts'
  });
  const account = accounts[0];
  showAccount.innerHTML = account;
}

const start = async () => {
  tbodyTarget.innerHTML = loadingGIF;
  const toUtf8Bytes = SynthetixJs.SynthetixJs.utils.formatBytes32String;
  const formatEther = snxjs.utils.formatEther;
  const synths = snxjs.contractSettings.synths.map(({
    name
  }) => name);
  let totalInUSD = 0;
  const snxPrice = (await snxjs.ExchangeRates.contract.rateForCurrency(toUtf8Bytes('SNX'), blockOptions)) / 1e18;
  let results = await Promise.all(synths.map(async synth => {
    const totalAmount = await snxjs[synth].contract.totalSupply(blockOptions);
    const totalSupply = formatEther(totalAmount);
    const rateForSynth = (await snxjs.ExchangeRates.contract.rateForCurrency(toUtf8Bytes(synth), blockOptions)) / 1e18;
    const totalSupplyInUSD = rateForSynth * totalSupply;
    totalInUSD += totalSupplyInUSD;
    const rateIsFrozen = await snxjs.ExchangeRates.contract.rateIsFrozen(toUtf8Bytes(synth), blockOptions);
    const rateIsStale = await snxjs.ExchangeRates.contract.rateIsStale(toUtf8Bytes(synth), blockOptions);
    const rateIsFlagged = await snxjs.ExchangeRates.contract.rateIsFlagged(toUtf8Bytes(synth), blockOptions);
    let inverseBounds;

    if (/^i/.test(synth)) {
      inverseBounds = await snxjs.ExchangeRates.contract.inversePricing(toUtf8Bytes(synth), blockOptions);
    }

    const {
      suspended: marketClosed
    } = await snxjs.SystemStatus.contract.synthExchangeSuspension(toUtf8Bytes(synth), blockOptions);
    const {
      suspended,
      reason
    } = await snxjs.SystemStatus.contract.synthSuspension(toUtf8Bytes(synth), blockOptions);
    return {
      synth,
      totalAmount,
      totalSupply,
      rateForSynth,
      totalSupplyInUSD,
      rateIsFrozen,
      rateIsStale,
      rateIsFlagged,
      marketClosed,
      suspended,
      reason: reason.toString(),
      inverseBounds
    };
  }));
  results = results.sort((a, b) => a.totalSupplyInUSD > b.totalSupplyInUSD ? -1 : 1);
  tbodyTarget.innerHTML = '';
  results.forEach(({
    synth,
    rateForSynth,
    totalSupply,
    totalSupplyInUSD,
    rateIsFrozen,
    rateIsStale,
    rateIsFlagged,
    marketClosed,
    suspended,
    reason,
    inverseBounds
  }, i) => {
    const isNoNeed = marketClosed || rateIsFrozen || numbro(100 * totalSupplyInUSD / totalInUSD) < 5;
    tbodyTarget.innerHTML += isNoNeed ? '' : `
    <tr class="${rateIsFrozen && 'frozen'} ${rateIsStale && 'stale'} ${rateIsFlagged && 'flagged'} ${marketClosed && 'market-closed'} ${suspended && 'suspended'}"
    data-p="${numbro(100 * totalSupplyInUSD / totalInUSD).format('0.00')}" data-n="${synth}"
    >
      <td>${i + 1}</td>
      <td>
        <img width=32 src="https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/${synth}.svg" />
      </td>
      <td>${synth}</td>
      <td>${numbro(rateForSynth).format('0.0000')}</td>
      <td>
        ${numbro(100 * totalSupplyInUSD / totalInUSD).format('0.00')}%
      </td>
    </tr>`;
  });
  const resultsWithValues = results.filter(({
    totalSupplyInUSD
  }) => Number(totalSupplyInUSD) > 100);
};

async function printPortfolioTabl() {
  const portfolioTable = document.querySelector('#portfolio tbody');
  const account = showAccount.innerHTML;
  const {
    synths
  } = snxjs.contractSettings;
  const formatBytes32String = SynthetixJs.SynthetixJs.utils.formatBytes32String;
  const availableSynths = synths.filter(({
    asset
  }) => asset);
  const balances = await Promise.all(availableSynths.map(({
    name
  }) => snxjs[name].contract.balanceOf(account, blockOptions)));
  const balancesEffective = await Promise.all(availableSynths.map(({
    name
  }, i) => snxjs.ExchangeRates.contract.effectiveValue(formatBytes32String(name), balances[i], formatBytes32String('sUSD'), blockOptions)));
  const balancesInUSD = balancesEffective.map(snxjs.utils.formatEther);
  const totalInPortfolio = balancesInUSD.reduce((a, b) => Number(a) + Number(b), 0); // const availableSynths = synths.filter(({ asset }) => asset);
  // const balances = await Promise.all(availableSynths.map(({ name }) => snxjs[name].contract.balanceOf(account, blockOptions)));

  const holdings = availableSynths.map(({
    name
  }, i) => {
    return {
      synthKey: name,
      balanceOf: snxjs.utils.formatEther(balances[i]),
      balanceInUSD: balancesInUSD[i],
      percentage: balancesInUSD[i] / totalInPortfolio
    };
  }).filter(({
    balanceOf
  }) => Number(balanceOf) > 0);
  portfolioTable.innerHTML = '';
  holdings.sort((a, b) => Number(a.balanceInUSD) > Number(b.balanceInUSD) ? -1 : 1).forEach(({
    synthKey,
    balanceOf,
    balanceInUSD,
    percentage
  }) => {
    portfolioTable.innerHTML += `
    <tr>
      <td>${synthKey}</td>
      <td>${Number(balanceOf).toFixed(4)}</td>
      <td>$${Number(balanceInUSD).toFixed(2)}</td>
      <td>${Number(percentage * 100).toFixed(2)}%</td>
      <td>
        <input ${Number(balanceOf) < 0.001 ? 'disabled' : ''} type="checkbox" data-balance="${Number(balanceOf).toFixed(4)}" data-n="${synthKey}"/>
      </td>
    </tr>`;
  });
  portfolioTable.innerHTML += `<tr><td></td><td>Total USD</td><td>${Number(totalInPortfolio).toFixed(2)}</td><td></td></tr>`;
}

async function send(a, b, c) {
  var tu32 = snxjs.utils.toUtf8Bytes32;
  var parseEther = snxjs.utils.parseEther;
  console.log(a, b, c);
  var signer = snxjs.signers.Metamask();
  var kk = new SynthetixJs.SynthetixJs({
    networkId: 1,
    signer
  });
  var tx = await kk.Synthetix.exchange(tu32(a), parseEther(b.toString()), tu32(c));
  console.log(tx.hash);
}

window.onload = async () => {
  changeBtn.addEventListener('click', async () => {
    const ff = tbodyTarget.getElementsByTagName('tr');
    const check = document.querySelectorAll('#portfolio input:checked');

    for (let index = 0; index < check.length; index++) {
      const ce = check[index];
      const cname = ce.dataset.n;
      const balance = ce.dataset.balance;

      for (let index = 0; index < ff.length; index++) {
        const element = ff[index];
        const p = element.dataset.p;
        const name = element.dataset.n;

        if (cname !== name) {
          await send(cname, Number(balance) * Number(p) / 100, name);
        }
      }
    } // for (let index = 0; index < ff.length; index++) {
    //   const element = ff[index];
    //   const p = element.dataset.p
    //   const name = element.dataset.n
    // }

  });
  await getAccount();
  await start();
  await printPortfolioTabl();
};
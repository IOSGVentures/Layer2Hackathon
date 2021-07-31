const tbodyTarget = document.querySelector('tbody');
const inputTarget = document.querySelector('input[name=network]');
const blockTarget = document.querySelector('input[name=block]');
const graphTarget = document.querySelector('#graphCompare');
//const graphTotalIssuedTarget = document.querySelector('#graphTotalIssued');

const networkTarget = document.querySelector('#network var');

const SUPPORTED_NETWORKS = {
  'mainnet': 1,
  'ropsten': 3,
  'rinkeby': 4,
  'kovan': 42 };


const loadingGIF = '<img src="https://media.giphy.com/media/TvLuZ00OIADoQ/giphy.gif" width=150 />';

const start = async () => {
  tbodyTarget.innerHTML = loadingGIF;
  graphTarget.innerHTML = loadingGIF;
  //  graphTotalIssuedTarget.innerHTML = loadingGIF;

  const network = inputTarget.value.toLowerCase() in SUPPORTED_NETWORKS ? inputTarget.value.toLowerCase() : 'mainnet';

  networkTarget.innerHTML = network;

  const networkId = SUPPORTED_NETWORKS[network];
  const snxjs = new SynthetixJs.SynthetixJs({ networkId });
  const toUtf8Bytes = SynthetixJs.SynthetixJs.utils.formatBytes32String;
  const formatEther = snxjs.utils.formatEther;

  const fromBlock = blockTarget.value;
  const blockOptions = fromBlock ? { blockTag: Number(fromBlock) } : {};

  const synths = snxjs.contractSettings.synths.map(({ name }) => name);
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
    const { suspended: marketClosed } = await snxjs.SystemStatus.contract.synthExchangeSuspension(toUtf8Bytes(synth), blockOptions);
    const { suspended, reason } = await snxjs.SystemStatus.contract.synthSuspension(toUtf8Bytes(synth), blockOptions);

    return { synth, totalAmount, totalSupply, rateForSynth, totalSupplyInUSD, rateIsFrozen, rateIsStale, rateIsFlagged, marketClosed, suspended, reason: reason.toString(), inverseBounds };
  }));

  results = results.sort((a, b) => a.totalSupplyInUSD > b.totalSupplyInUSD ? -1 : 1);
  tbodyTarget.innerHTML = '';
  results.forEach(({ synth, rateForSynth, totalSupply, totalSupplyInUSD, rateIsFrozen, rateIsStale, rateIsFlagged, marketClosed, suspended, reason, inverseBounds }, i) => {
    tbodyTarget.innerHTML += `<tr class="${rateIsFrozen && 'frozen'} ${rateIsStale && 'stale'} ${rateIsFlagged && 'flagged'} ${marketClosed && 'market-closed'} ${suspended && 'suspended'}"><td>${i + 1}</td><td><img width=32 src="https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/${synth}.svg" /></td>
    <td style="font-size: 24px;">
      <span title="Synth suspended reason: ${reason}!">${suspended ? '⚠️(' + reason + ')' : ''}</span>
      <span title="Rate is frozen">${rateIsFrozen ? '❄️' : ''}</span>
      <span title="Rate is stale">${rateIsStale ? '🥨' : ''}</span>
      <span title="Rate is flagged">${rateIsFlagged ? '🏴‍☠️' : ''}</span>
      <span title="Market Closed">${marketClosed ? '💤' : ''}</span>
    </td><td>${synth}</td><td>${numbro(rateForSynth).format('0.0000')}</td><td>${numbro(totalSupply).format('0,000.0000')} ${synth}</td><td>${numbro(totalSupplyInUSD).format('0,000.00')}</td><td>${numbro(100 * totalSupplyInUSD / totalInUSD).format('0.00')}%</td>
<td>${totalSupply > 0 ? '✅' : '❌'}</td>
<td><a target=_blank href="http://api.ethplorer.io/getTopTokenHolders/${snxjs[synth].contract.address}?apiKey=freekey&limit=100">Holders</a></td>
<td>${inverseBounds ? numbro(inverseBounds.lowerLimit / 1e18).format('0,000.00') : ''}</td>
<td>${inverseBounds ? numbro(inverseBounds.entryPoint / 1e18).format('0,000.00') : ''}</td>
<td>${inverseBounds ? numbro(inverseBounds.upperLimit / 1e18).format('0,000.00') : ''}</td>
</tr>`;
  });

  document.querySelector('#synthsTotal').innerHTML = numbro(totalInUSD).format('0,000.00');
  document.querySelector('#snxusdPrice').innerHTML = numbro(snxPrice).format('0.0000');

  const resultsWithValues = results.filter(({ totalSupplyInUSD }) => Number(totalSupplyInUSD) > 100);

  new frappe.Chart(graphTarget, {
    title: 'Top 10 Synth Breakdown (in millions)',
    data: {
      labels: resultsWithValues.slice(0, 10).map(({ synth }) => synth),
      datasets: [
      {
        name: 'USD',
        values: resultsWithValues.slice(0, 10).map(({ totalSupplyInUSD }) => totalSupplyInUSD / 1e6) }] },



    type: 'bar',
    colors: ['#7cd6fd', '#743ee2'] });


  /* Note: no longer works without a provider that supports blockTag (an archive node)
  // track total issued over time
  const currentBlock = await snxjs.contractSettings.provider.getBlockNumber();
  
  const totalIssuedPromises = [];
  for (i = 0; i < 10; i++) {
    const blockTag = Number(currentBlock) - 6000*i; // approx 1 day
    totalIssuedPromises.unshift(snxjs.Synthetix.contract.totalIssuedSynths(toUtf8Bytes('sUSD'), { blockTag }).then(res => ({
      rate: formatEther(res),
      block: blockTag
    })).catch(() => {})); 
  }
  
  const totalIssued = await Promise.all(totalIssuedPromises);
  
  console.log(totalIssued);
   new frappe.Chart(graphTotalIssuedTarget, {  
    title: 'Synthetix.totalIssuedSynths over time (by block number, in millions)',
    data: {
      labels: totalIssued.filter(e => e).map(({ block }) => block/1e6),
      datasets: [
        {
          name: 'USD',
          values: totalIssued.filter(e => e).map(({ rate }) => rate/1e6)
        }
      ]
    },
    type: 'line'
  //    type: 'bar', 
  //    colors: ['#7cd6fd', '#743ee2']
  });
  */

};

document.querySelector('button[name=start]').addEventListener('click', start);
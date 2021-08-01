import Web3 from "web3";
import OrderNFT from "../contracts/abi/OrderNFT.json";
import OrderDetailNFT from "../contracts/abi/OrderDetailNFT.json";
import BoboBetaToken from "../contracts/abi/BoboBetaToken.json";
import BoboFactory from "../contracts/abi/BoboFactory.json";
import BoboRouter from "../contracts/abi/BoboRouter.json";
import BoboPair from "../contracts/abi/BoboPair.json";
import BoboFarmer from "../contracts/abi/BoboFarmer.json";
import EXManager from "../contracts/abi/EXManager.json";
import StratMaticSushi from "../contracts/abi/StratMaticSushi.json";


OrderNFT.networks['137'] = {address: '0x2612E2B8D5369dA8154210b988c917bfd361CAc8'};
OrderDetailNFT.networks['137'] = {address: '0xa14cCc81ADbdbe9DAdBaa8Ef1c6Aeff763f1A2E3'};
BoboBetaToken.networks['137'] = {address: '0x637C6b0eDFB8835aC46B4Afd98d0601e68669da7'};
BoboFactory.networks['137'] = {address: '0xf4356f993561571F064EeB0b50cd6B598B75551b'};
BoboRouter.networks['137'] = {address: '0xe0d6f9636794d03c9Ae4E0630199B9BD1b9CE568'};
BoboPair.networks['137'] = {address: '0x366cAbf9a0Bb68dBA4626EBBb85A651695Eb3CB7'};
BoboFarmer.networks['137'] = {address: '0x54fd608c2Fdd52364A9103c2B4fb83EEd66ce2BE'};
EXManager.networks['137'] = {address: '0xd51590C8af2f4a43Eec302a276E33c4B970b4270'};
StratMaticSushi.networks['137'] = {address: '0x3bc9A21293c1b52f936e4527288a2A8781fE5F03'};

const options = {
  web3: {
    block: true,
    customProvider: new Web3(window.ethereum),
  },
  contracts: [
    OrderNFT, OrderDetailNFT, BoboBetaToken, BoboFactory, BoboRouter, BoboPair, EXManager, StratMaticSushi, BoboFarmer
  ],
  events: {
  },
  polls: {
    blocks: 3000,
  },
  //syncAlways: true,
};
export default options;
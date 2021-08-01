import Web3 from "web3";
export const myMixins = {
  methods: {
		async connectWallet() {
      const _this = this;
      //链接钱包
      if (!window.ethereum && !window.web3) {
        //用来判断你是否安装了metamask
        _this.toast("error","请安装MetaMask")
      } else {
        if (window.ethereum) {
          try {
            // 请求用户授权
            await window.ethereum.enable();
            // MetaMask地址变化时，要刷新网站
            ethereum.on("chainChanged", (chainId) => {
              history.go(0);
            });// MetaMask地址变化时，要刷新网站
            ethereum.on("accountsChanged", (chainId) => {
              history.go(0);
            });
            if (
              window.ethereum.networkVersion != "56" &&
              window.ethereum.networkVersion != "128" &&
              window.ethereum.networkVersion != "137"
            ) {
              _this.toast("error","请将MetaMask连接到ETH、BSC或Heco网络，否则您无法正常使用本网站")
            } else {
              const chainId = window.ethereum.networkVersion; // 链ID，bsc=56, heco=128
              _this.$store.dispatch("setChainId", chainId);
              _this.web3 = new Web3(window.ethereum); // window.ethereum是MetaMask嵌入到浏览器的对象
              _this.$store.dispatch("setWeb3", _this.web3);
              let accountMost = "";
              _this.web3.eth.getAccounts().then((accounts) => {
                // 获取MetaMask上的当前账号地址accounts[0]]
                accountMost = accounts[0];//当前账户
                const account = accounts[0];
                _this.$store.dispatch("setAccount", account);
                _this.$store.dispatch("setIsConnected", true);
               
                //获取当前账户资产
                _this.web3.eth.getBalance(accountMost).then((balance) => {
                  //console.log(balance)
                })
              });
              


            }
          } catch (error) {
            // 用户不授权时
            _this.toast("error","MetaMask授权失败，会导致您无法正常使用本网站")
            return;
          }
        }
      }
    }
	}
}
import { select } from 'async';
import React from 'react';
// import { isCompositeComponentWithType } from 'react-dom/test-utils';
import connectPage from './connect.png'
import selectPage from './select.png'
import transactionPage from './transaction.png'
import submitPage from './submit.png'
import finishedPage from './finished.png'
var Web3 = require('web3');


var icon_style = {
    cursor: 'pointer',
    position: 'fixed',
    bottom: 20,
    right: 20,
    'zIndex':100,
    width: '239px', 
    height: '66px',
    display: 'flex',
    'backgroundColor': 'RGBA(255,255,255, 1)', // vaild with rgba
    'alignItems': 'center',
    'textAlign': 'center',
    'borderRadius': '24px', 
    'boxSizing':'border-box',
    border: '1px solid #E1E3E7',
};

var thumb_style = {
    position: 'relative',
    'paddingLeft': '21px',
}

var font_style = {
    'paddingLeft': '30px',
    // 'fontFamily': 'Roboto',
    'fontStyle': 'normal',
    'textAlign': 'center',
    'color': '#000000',
    'fontWeight': 'bold',
    'fontSize': '33px',
    'lineHeight': '39px',
}

var icon2_style = {
    cursor: 'pointer',
    position: 'fixed',
    'backgroundColor': 'RGBA(255,255,255, 1)',
    bottom: 20,
    right: 20,
    'zIndex':100,
    width: '368px', 
    height: '373px',
    display: 'flex',
    'alignItems': 'center',
    'textAlign': 'center',
    'borderRadius': '24px', 
    backgroud: '#FFFFFF', 
    'boxSizing':'border-box',
    border: '1px solid #E1E3E7',
};

class TipJar extends React.Component {

    constructor(props) {
        super(props);
        this.web3 = new Web3();
        this.address=this.props.address;
        this.handleClickStart = this.clickStart.bind(this);
        this.handleClickConnect = this.clickConnect.bind(this);
        this.handleClickSelect = this.clickSelect.bind(this);
        this.handleClickTransfer = this.clickConfirm.bind(this);
        this.accs = '';
        this.state = { step: 0 };
    }

    clickStart() {
        console.log('click start.')
        this.setState({step: 1});
    }

    ethEnabled = async () => {
        if (typeof window.ethereum !== 'undefined') {
            // Instance web3 with the provided information from the MetaMask provider information
            this.web3 = new Web3(window.ethereum);
            try {
                // Request account access
                await window.ethereum.enable();
                return true
            } catch (e) {
                // User denied access
                return false
            }
        }
        return false;
    }
 
    clickSelect = async () => {
        console.log('select wallet.')
        this.setState({step: 2 });
    }

    clickConnect = async () => {
        // this.setState({step: 3});  // to confirm page..

        if (await !this.ethEnabled()) {
            alert("Please install MetaMask to use this dApp!");
        }
        this.accs = await this.web3.eth.getAccounts(); 
        console.log('accs: '+ this.accs);
        const balance = await this.web3.eth.getBalance(this.address);
        console.log('blance: ' + balance/1e18);
        this.setState({step: 3});  // to confirm page..
         
    }

    clickConfirm = async () => {
        console.log('transfering')
        this.setState({step: 4});
        let value= this.web3.utils.toWei('0.01', 'ether')
        // Uncaught Error: The send transactions "from" field must be defined!
        // if(this.accs==undefined || this.accs==null){
        //     console.log('error accs')
        //     window.location.reload();
        // }
        this.accs = await this.web3.eth.getAccounts(); 
        console.log('show accs in 4')
        console.log('accs: '+ this.accs);
        var message = {from: this.accs[0], to:this.address, value:value};
        console.log(message);

        this.web3.eth.sendTransaction(message, (err, res) => {
            var output = "";
            if (!err) {
                output += res;
                this.txHash=res;
                this.transferFinish();
            } else {
                console.log(err);
                output = "Error" + err;
                this.setState({step: 0});
            }
            console.log('transfer: ',output)
        })
        
        // const transactionReceiptAsync = function(resolve, reject) {
        //     self.getTransactionReceipt(this.txHash, (error, receipt) => {
        //         if (error) {
        //             reject(error);
        //         } else if (receipt == null) {
        //             setTimeout(
        //                 () => transactionReceiptAsync(resolve, reject),
        //                 interval ? interval : 500);
        //         } else {
        //             resolve(receipt);
        //         }
        //     });
        // };

        // if (Array.isArray(this.txHash)) {
        //     return Promise.all(this.txHash.map(
        //         oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
        // } else if (typeof this.txHash === "string") {
        //     return new Promise(transactionReceiptAsync);
        // } else {
        //     throw new Error("Invalid Type: " + this.txHash);
        // }
    }

    transferFinish(){
        this.setState({step: 5});
        setTimeout(() => {
            this.setState({step: 0});
        }, 3000);
    }

    render() {
    // function TipJar() {
        if (this.state.step===0) {
            return(
                <div style={ icon_style } onClick={this.handleClickStart} >
                    <svg style={thumb_style} width="35" height="32" viewBox="0 0 35 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28.136 22.452C28.7386 22.452 29.3277 22.6307 29.8288 22.9655C30.3299 23.3003 30.7204 23.7762 30.951 24.3329C31.1816 24.8897 31.242 25.5023 31.1244 26.0934C31.0068 26.6844 30.7166 27.2274 30.2905 27.6535C29.8644 28.0796 29.3215 28.3698 28.7304 28.4874C28.1394 28.6049 27.5267 28.5446 26.97 28.314C26.4132 28.0834 25.9374 27.6928 25.6025 27.1918C25.2677 26.6907 25.089 26.1016 25.089 25.4989C25.0898 24.6911 25.4111 23.9165 25.9823 23.3453C26.5536 22.774 27.3281 22.4528 28.136 22.452ZM28.136 19.455C26.9406 19.455 25.7721 19.8094 24.7782 20.4736C23.7842 21.1377 23.0096 22.0816 22.5521 23.186C22.0947 24.2904 21.975 25.5057 22.2082 26.6781C22.4414 27.8505 23.017 28.9274 23.8623 29.7727C24.7075 30.618 25.7845 31.1936 26.9569 31.4268C28.1293 31.66 29.3445 31.5403 30.4489 31.0829C31.5533 30.6254 32.4972 29.8507 33.1614 28.8568C33.8255 27.8629 34.1799 26.6943 34.1799 25.4989C34.1799 23.896 33.5432 22.3587 32.4097 21.2252C31.2762 20.0917 29.7389 19.455 28.136 19.455Z" fill="#70D131"/>
<path d="M14.5665 2.99668C15.0006 2.99668 15.5006 3.28389 15.7283 3.66451C15.8512 3.86931 15.9396 4.14903 15.6634 4.66351L13.3297 9.02715C13.0651 9.52184 12.9332 10.0767 12.9468 10.6375C12.9605 11.1984 13.1192 11.7462 13.4076 12.2274C13.6959 12.7087 14.1041 13.107 14.5922 13.3835C15.0804 13.6601 15.6318 13.8054 16.1929 13.8054H21.2313C21.3821 13.8053 21.5304 13.8444 21.6616 13.9187C21.7928 13.993 21.9025 14.1 21.9801 14.2294C22.0576 14.3587 22.1003 14.506 22.104 14.6567C22.1076 14.8075 22.0722 14.9566 22.0011 15.0896L15.7868 26.7124C15.4912 27.2668 15.0503 27.7302 14.5115 28.0531C13.9726 28.376 13.356 28.5463 12.7278 28.5456H6.89618C6.50107 28.547 6.10797 28.4894 5.72984 28.3748C4.63094 28.0376 3.74333 27.2169 3.29228 26.1225C3.07173 25.5946 2.97284 25.0238 3.00293 24.4524C3.03302 23.881 3.19132 23.3237 3.46611 22.8218L9.13344 12.2239L13.6604 3.75942C13.6994 3.68649 13.7403 3.61406 13.7833 3.54413C14.118 2.99468 14.4206 2.99468 14.5665 2.99468V2.99668ZM14.5665 -0.00231934C13.3277 -0.00231934 12.081 0.581097 11.2258 1.9792C11.1533 2.09741 11.0837 2.21912 11.0171 2.34433L6.49058 10.8109L0.823255 21.4088C-1.28963 25.3603 0.883195 30.0231 4.85122 31.2399C5.51395 31.4423 6.20324 31.5443 6.89618 31.5426H12.7278C13.8989 31.543 15.0481 31.2254 16.0527 30.6235C17.0573 30.0217 17.8795 29.1583 18.4316 28.1255L24.6439 16.5052C26.022 13.9277 24.1544 10.8109 21.2313 10.8109H16.1929C16.1497 10.8109 16.1073 10.7997 16.0697 10.7784C16.0321 10.7572 16.0007 10.7265 15.9785 10.6895C15.9563 10.6524 15.9441 10.6103 15.9431 10.5671C15.9421 10.524 15.9522 10.4813 15.9726 10.4432L18.3063 6.0791C20.0215 2.8718 17.3148 -0.000321335 14.5665 -0.000321335V-0.00231934Z" fill="#70D131"/>
                    </svg>
                    <a style={font_style}>Tip-Jar</a>
                </div>
            )
        } else if (this.state.step===1) { // connect
            return(
                <div style={icon2_style} onClick={this.handleClickSelect}>
                    <img src={connectPage} width='100%' height='100%' alt='connect'/>
                </div>
            )
        } else if (this.state.step===2) { // 选择钱包
            return(
                <div style={icon2_style} 
                    onClick={this.handleClickConnect}>
                    <img src={selectPage} width='100%' height='100%' alt='select'/>
                </div>
            )
        } else if (this.state.step===3) { // 确定转账页
            return(
                <div style={icon2_style} onClick={this.handleClickTransfer}>
                    <img src={transactionPage} width='100%' height='100%' alt='transaction'/>
                </div>
            )
        } else if (this.state.step===4) { // 转圈
            return(
                <div style={icon2_style} >
                    <img src={submitPage} width='100%' height='100%' alt='submit'/>
                </div>
            )
        } else if (this.state.step===5) { // 完成
            return(
                <div style={icon2_style} >
                    <img src={finishedPage} width='100%' height='100%' alt='finished'/>
                </div>
            )
        } else {
            console.log('error step')
        }
    }
}

export default TipJar;

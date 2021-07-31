import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Jumbotron} from 'reactstrap';

import {Button, Col, Form, Input, Modal, Row} from 'antd';
import detectEthereumProvider from '@metamask/detect-provider';

import Web3 from 'web3';


// import App from '../untility/App';
// import App from '../utility/AppJSX';


class Test extends React.Component {
    constructor(props) {
        super(props);
        // [isModalVisible, setIsModalVisible] = useState(false);
        this.state = {
            account: 'have no account',
            current: 'mail',
            isModelVisible: false,
            setIsModelVisible: false
        };
        this.showModal = this.showModal.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.connect=this.connect.bind(this);
        this.accountChanged=this.accountChanged.bind(this);
        this.test=this.test.bind(this);
        this.provider=this.provider.bind(this);
        this.testWeb3=this.testWeb3.bind(this);

        // this.componentDidMount=this.componentDidMount.bind(this);


    }

    showModal = () => {
        this.setState({
            isModalVisible: true
        });
    };

    handleOk = () => {
        this.setState({
            isModalVisible: false
        });
    }

    handleCancel = () => {
        // this.state.setIsModalVisible(false);
        this.setState({
            isModalVisible: false
        });
    };

    handleClick = e => {
        console.log('click ', e);
        this.setState({current: e.key});
    };

    async connect(){
        const accounts= await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        this.setState({account:account});
    }

    async accountChanged(){
        window.ethereum.on('accountsChanged', (accounts) => {
            const account = accounts[0];
           this.setState({account:account});
            // Handle the new accounts, or lack thereof.
            // "accounts" will always be an array, but it can be empty.
        });
    }

    test(){
        let msg = window.ethereum.isConnected();
        console.log("msg:"+msg);
        let params = [
            {
                from: '0x4CEaa0A16d0831d7d46cb72006F959a87f618A47',
                to: '0x102e277c34668E96Cbed6169FA1195002C11D746',
                gas: '0x76c0', // 30400
                gasPrice: '0x9184e72a000', // 10000000000000
                value: '0x9184e72a', // 2441406250
                data:
                    '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
            },
        ];
        window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params,
            })
            .then((result) => {
                console.log("result:::::");
                console.log(result);
                // The result varies by by RPC method.
                // For example, this method will return a transaction hash hexadecimal string on success.
            })
            .catch((error) => {
                // If the request fails, the Promise will reject with an error.
            });

    }

    async provider(){
        const provider = await detectEthereumProvider();
        if (provider) {
            // startApp(provider); // Initialize your app
            if (provider !== window.ethereum) {
                console.error('Do you have multiple wallets installed?');
            }else {
                alert("provider success!");

                let content=this.web3.utils.asciiToHex("hello");
                alert(content);


            }

        } else {
            console.log('Please install MetaMask!');
        }

    }

    // componentDidMount(){
    //     if (typeof web3 !== 'undefined') {
    //         console.log(this.web3.currentProvider);
    //         // Use Mist/MetaMask's provider
    //         var web3js = new Web3(this.web3.currentProvider);
    //
    //         this.web3.version.getNetwork((err, netId) => {
    //             switch (netId) {
    //                 case "1":
    //                     console.log('This is mainnet')
    //                     break
    //                 case "2":
    //                     console.log('This is the deprecated Morden test network.')
    //                     break
    //                 case "3":
    //                     console.log('This is the ropsten test network.')
    //                     break
    //                 case "4":
    //                     console.log('This is the Rinkeby test network.')
    //                     break
    //                 case "42":
    //                     console.log('This is the Kovan test network.')
    //                     break
    //                 default:
    //                     console.log('This is an unknown network.')
    //             }
    //         })
    //     } else {
    //         console.log('No web3? You should consider trying MetaMask!')
    //     }
    // }
    testWeb3(){
        // if (window.ethereum) {
        //     // 请求用户授权
        //     window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts=>{
        //         web3.eth.getAccounts((error, accounts) => {
        //             window.web3.eth.defaultAccount = accounts[0];
        //             console.log(accounts)
        //         })
        //     })
        //
        // } else  if (typeof web3 !== 'undefined') {
        //     let web3 = new Web3(web3.currentProvider);
        //     web3.eth.defaultAccount = web3.eth.accounts[0];
        //     console.log(web3.eth.defaultAccount);
        // } else {
        //     // set the provider you want from Web3.providers
        //     let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
        // }
    }
    render() {
        return (

            <div>


                <Row>
                    <Col span={18}>

                    </Col>

                    <Col span={6}>
                        <Button
                            size="learge"
                            shape="round"
                            danger="true"
                            type="primary"
                            style={
                                {
                                    marginTop: "20px",
                                    width: "120px"
                                }
                            }

                        >connect</Button>
                    </Col>
                </Row>
                <br/>

                {/*<div style={{ backgroundColor:"pink",*/}
                {/*    height:"200px"}}>*/}
                {/*    <App/>*/}

                {/*</div>*/}



                <Container>
                    <Jumbotron fluid>
                        <Container fluid>
                            <h1 className="display-3">Test</h1>
                            <p className="lead">这里放一句比较响亮的口号，长度要比上面的长</p>
                            <br/>
                            <div>
                                <p> {this.state.account} </p>
                                <Button type="primary" onClick={this.connect}>
                                    connect
                                </Button>
                                <br/>

                                <Button type="primary" onClick={this.accountChanged}>
                                    accountChanged
                                </Button>

                                <br/>
                                <Button type="primary" onClick={this.test}>
                                   test
                                </Button>

                                <br/><br/>
                                <Button type="primary" onClick={this.provider}>
                                    provider
                                </Button>

                                <br/><br/>
                                <Button type ="danger" onClick={this.testWeb3}>
                                    web3
                                </Button>


                            </div>


                            <div>

                                <br/>
                                <br/>

                                <Button type="primary" onClick={this.showModal}>
                                    NEW ACTIVITY
                                </Button>
                                <Modal title="Basic Modal" visible={this.state.isModalVisible}
                                       okText="提交"

                                       nOk={this.handleOk} onCancel={this.handleCancel}>

                                    <Form.Item
                                        label="Username"
                                        name="username"
                                        rules={[{required: true, message: 'Please input your username!'}]}
                                    >
                                        <Input/>
                                    </Form.Item>

                                    <Form.Item label="Field A">
                                        <Input placeholder="input placeholder"/>
                                    </Form.Item>
                                    <Form.Item label="Field B">
                                        <Input placeholder="input placeholder"/>
                                    </Form.Item>

                                    <Form.Item
                                        label="Username"
                                        name="username"
                                        rules={[{required: true, message: 'Please input your username!'}]}
                                    >
                                        <Input/>
                                    </Form.Item>

                                    {/*<Form.Item >*/}
                                    {/*    <Button type="primary">Submit</Button>*/}
                                    {/*</Form.Item>*/}
                                </Modal>

                            </div>

                        </Container>
                    </Jumbotron>
                </Container>

            </div>

        );
    }
}

export default Test;

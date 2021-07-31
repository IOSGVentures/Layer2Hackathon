import React from 'react';
import {Container, Jumbotron} from 'reactstrap';
import {Button, Col, Form, Input, Modal, Row,Timeline} from 'antd';
import detectEthereumProvider from '@metamask/detect-provider';

import { Icon } from '@ant-design/compatible';
import { notification, Divider, Space } from 'antd';
import {
    RadiusUpleftOutlined,
    RadiusUprightOutlined,
    RadiusBottomleftOutlined,
    RadiusBottomrightOutlined,
} from '@ant-design/icons';

import {Link} from "react-router-dom";
import './style.css';



const openNotification = placement => {
    notification.info({
        duration: 3,
        message: '请先登录钱包',
        description:
            '登录钱包校验您是否为DAO的管理员',
        placement,
    });
};

const openNotification2 = placement => {
    notification.info({
        duration: 3,
        message: '进入团队注册页面',
        description:
            '由各个项目团队的领袖发起报名',
        placement,
    });
};


export const shorter = (str) =>
    str?.length > 8 ? str.slice(0, 6) + '...' + str.slice(-4) : str


class Font extends React.Component {
    constructor(props) {
        super(props);
        // [isModalVisible, setIsModalVisible] = useState(false);
        this.state = {
            connect:'connect',
            access: '只有DAO组织的管理员有开启活动的权限',
            account: '',
            current: 'mail',
            isModelVisible: false,
            setIsModelVisible: false
        };
        this.showModal = this.showModal.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.connect=this.connect.bind(this);
    }

    showModal = () => {
        if(this.state.connect==='connect'){
            openNotification('topLeft');
            // return;
        }
        this.setState({
            isModalVisible: true
        });
    };

    handleOk = () =>{
        openNotification2('topLeft');

        this.setState({
            isModalVisible: false
        });



        this.props.history.push('/sign');
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
        this.setState({connect: shorter(account)});
        this.setState({access:"欢迎尊贵的管理员开启新的活动"});
    }

    // async accountChanged(){
    //     window.ethereum.on('accountsChanged', (accounts) => {
    //         const account = accounts[0];
    //         this.setState({account:account});
    //         // Handle the new accounts, or lack thereof.
    //         // "accounts" will always be an array, but it can be empty.
    //     });
    // }

    render() {
        return (
            <div className="first">
                <Row>
                    <Col span={18}>
                    </Col>
                    <Col span={6}>
                        <Button
                            size="learge"
                            shape="round"
                            danger="true"
                            type="primary"
                            className="connectButton"
                            onClick={this.connect}
                        >{this.state.connect}</Button>
                    </Col>
                </Row>

                <Container >
                    <Jumbotron fluid style={{backgroundColor:'transparent'}}>
                        <Container fluid>
                            <h1 className="display-3" style={{color:'white'}}>FluidDAO</h1>
                            <p className="lead" style={{color:'white'}}>{this.state.access}</p>

                            <Row style={{marginTop:"40px"}}>
                                <Col span={9}>
                                </Col>
                                <Col span={6}>
                                    <Timeline style={{color:'white'}}>
                                        <Timeline.Item
                                            style={{ fontSize: '18px',fontWeight:'bold'}}  color="red"
                                        >  由DAO组织的管理员发起活动 </Timeline.Item>
                                        <Timeline.Item>由各个项目团队的领袖发起报名</Timeline.Item>
                                        <Timeline.Item >由大众进行投票 </Timeline.Item>
                                        <Timeline.Item>根据投票结果得出最终赢家 </Timeline.Item>
                                    </Timeline>
                                </Col>
                            </Row>

                            <div>

                                <Button type="primary" onClick={this.showModal}>
                                    NEW ACTIVITY
                                </Button>
                                <Modal title="活动信息填写" visible={this.state.isModalVisible}
                                       okText="开启新的活动"
                                       onOk={this.handleOk} onCancel={this.handleCancel}>

                                    <Form.Item
                                    label="活动名称"
                                    name="name"
                                    rules={[{required: true, message: ' '}]}
                                >
                                    <Input/>
                                </Form.Item>

                                    <Form.Item
                                        label="活动简介"
                                        name="name"
                                        rules={[{required: true, message: ' '}]}
                                    >
                                        <Input/>
                                    </Form.Item>

                                    <Form.Item
                                        label="团队数量"
                                        name="name"
                                        rules={[{required: true, message: ' '}]}
                                    >
                                        <Input/>
                                    </Form.Item>

                                    <Form.Item
                                        label="活动时间"
                                        name="name"
                                        rules={[{required: true, message: ' '}]}
                                    >
                                        <Input/>
                                    </Form.Item>

                                </Modal>

                            </div>

                        </Container>
                    </Jumbotron>
                </Container>
                <br/>

            </div>

        );
    }
}

export default Font;

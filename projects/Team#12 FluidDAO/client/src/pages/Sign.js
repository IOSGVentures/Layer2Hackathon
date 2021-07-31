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
import { Card, Avatar } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import 'ant-design-pro/dist/ant-design-pro.css';
import CountDown from 'ant-design-pro/lib/CountDown';
import './style.css';

import dragon from "../picture/dragon.jpg"
import tiger from "../picture/tiger.jpg"
import bird from "../picture/bird.jpg"
const { Meta } = Card;


const openNotification = placement => {
    notification.info({
        duration: 3,
        message: '请先登录钱包',
        description:
            '登录钱包校验您是否为团队领袖',
        placement,
    });
};

const openNotification2 = placement => {
    notification.info({
        duration: 3,
        message: '团队信息注册成功',
        description:
            '请到页面下方进行查看',
        placement,
    });
};

const openNotification3 = placement => {
    notification.info({
        duration: 3,
        message: '团队注册时间结束',
        description:
            '进入大众投票环节',
        placement,
    });
};

export const shorter = (str) =>
    str?.length > 8 ? str.slice(0, 6) + '...' + str.slice(-4) : str


function randomNum(minNum,maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10);
            break;
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
            break;
        default:
            return 0;
            break;
    }
}

class Sign extends React.Component {
    constructor(props) {
        super(props);
        // [isModalVisible, setIsModalVisible] = useState(false);
        this.state = {
            connect:'connect',
            access: '只有团队领袖拥有报名活动的权限',
            account: '',
            current: 'mail',
            isModelVisible: false,
            setIsModelVisible: false,
            targetTime: new Date().getTime() + 24*60*60*1000
        };
        this.showModal = this.showModal.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.connect=this.connect.bind(this);
        this.resetTime=this.resetTime.bind(this);
        this.redirect=this.redirect.bind(this);


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
        // this.props.history.push('/sign');
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
        this.setState({access:"欢迎尊贵的团队领袖开始报名"});
    }

    resetTime(){
        this.setState({
            targetTime: new Date().getTime() + 24*60*60*1000
        })

    }

    redirect(){

        // window.location.href = "/vote";
        openNotification3('topLeft');
        this.props.history.push('/vote');
    }
    render() {
        return (
            <div>
            <div className="second">
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
                    <Jumbotron fluid  fluid style={{backgroundColor:'transparent'}}>
                        <Container fluid>
                            <h1 className="display-3" >Signup</h1>
                            <p className="lead" style={{ fontWeight:'bold'}}>{this.state.access}</p>

                            <Row style={{marginTop:"40px"}}>
                                <Col span={8}>
                                </Col>
                                <Col span={8}>
                                    <Timeline >
                                        <Timeline.Item>  由DAO组织的管理员发起活动 </Timeline.Item>
                                        <Timeline.Item style={{ fontSize: '18px',fontWeight:'bold'}}  color="red"
                                        >由各个项目团队的领袖发起报名</Timeline.Item>
                                        <Timeline.Item >由大众进行投票 </Timeline.Item>
                                        <Timeline.Item>根据投票结果得出最终赢家 </Timeline.Item>
                                    </Timeline>
                                </Col>
                            </Row>

                                <Button type="primary" onClick={this.showModal}>
                                    填写团队信息
                                </Button>
                                <Modal title="团队信息填写" visible={this.state.isModalVisible}
                                       okText="团队信息提交"
                                       onOk={this.handleOk} onCancel={this.handleCancel}>

                                    <Form.Item
                                        label="团队名称"
                                        name="name"
                                        rules={[{required: true, message: ''}]}
                                    >
                                        <Input/>
                                    </Form.Item>

                                    <Form.Item
                                        label="团队简介"
                                        name="name"
                                        rules={[{required: true, message: ' '}]}
                                    >
                                        <Input/>
                                    </Form.Item>

                                    <Form.Item
                                        label="可以包含其他信息，如团队标志图片等"
                                        name="name"
                                        rules={[{required: true, message: ' '}]}
                                    >
                                        )
                                    </Form.Item>
                                </Modal>
                        </Container>
                    </Jumbotron>
                </Container>
            </div>

                <div>
                    <br/>
                    <br/>


                    <Container>
                            <h1>已报名团队信息</h1>

                            <CountDown style={{ fontSize: 40 }} target={this.state.targetTime}  onClick={this.resetTime}/>


                    </Container>
                    <br/>
                    <Row>

                        <Col span={2}></Col>
                        <Col span={7}>
                            <Card
                                style={{ width: "90%"}}
                                cover={
                                    // <img
                                    //     alt="example"
                                    //     src="dragon.jpg"
                                    // />
                                    <img src={dragon} style={{height:"220px"}}/>
                                }
                                // actions={[
                                //     <SettingOutlined key="setting" />,
                                //     <EditOutlined key="edit" />,
                                //     <EllipsisOutlined key="ellipsis" />,
                                // ]}
                            >
                                <Meta
                                    // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                                    title="青龙团队"
                                    description="这是青龙团队的介绍信息"
                                />
                            </Card>
                        </Col>
                        <Col span={7}>
                            <Card
                                style={{ width: "90%" }}
                                cover={
                                    <img src={tiger} style={{height:"220px"}}/>
                                }
                                // actions={[
                                //     <SettingOutlined key="setting" />,
                                //     <EditOutlined key="edit" />,
                                //     <EllipsisOutlined key="ellipsis" />,
                                // ]}
                            >
                                <Meta
                                    // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                                    title="白虎团队"
                                    description="这是白虎团队的介绍信息"
                                />
                            </Card>
                        </Col>
                        <Col span={7}>
                            <Card
                                style={{ width: "90%" }}
                                cover={
                                    <img src={bird} style={{height:"220px"}}/>
                                }
                                // actions={[
                                //     <SettingOutlined key="setting" />,
                                //     <EditOutlined key="edit" />,
                                //     <EllipsisOutlined key="ellipsis" />,
                                // ]}
                            >
                                <Meta
                                    // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                                    title="朱雀团队"
                                    description="这是朱雀团队的介绍信息"
                                />
                            </Card>
                        </Col>
                    </Row>

                    <br/><br/>

                    <Button type="primary" onClick={this.redirect}>
                        团队注册时间结束后跳转到投票阶段
                    </Button>

                    <br/><br/>
                    <br/><br/>




                </div>


            </div>
        );
    }
}

export default Sign;

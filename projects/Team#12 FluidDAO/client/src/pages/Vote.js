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


import { withRouter } from "react-router-dom";
const { Meta } = Card;

const openNotification = placement => {
    notification.info({
        duration: 3,
        message: '请先登录钱包',
        description:
            '演示时可直接点击【确认投票】',
        placement,
    });
};

const openNotification2 = placement => {
    notification.info({
        duration: 3,
        message: '您已经投票成功！',
        description:
            '真实应用场景时会调用钱包进行token转账',
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

let delta1=1000;
let delta2=2000;
let delta3=3000;

class Vote extends React.Component {
    constructor(props) {
        super(props);
        // [isModalVisible, setIsModalVisible] = useState(false);
        this.state = {
            connect:'connect',
            access: '所有人都可以为你喜欢的团队投票',
            account: '',
            current: 'mail',
            isModelVisible: false,
            setIsModelVisible: false,
            targetTime: new Date().getTime() + 24*60*60*1000,
            cnt1: 1000,
            cnt2: 2000,
            cnt3: 3000
        };
        this.showModal = this.showModal.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.connect=this.connect.bind(this);
        this.resetTime=this.resetTime.bind(this);
        this.redirect=this.redirect.bind(this);
        this.toTop=this.toTop.bind(this);
        this.toDown=this.toDown.bind(this);

    }
    componentDidMount() { // 生命周期
        this.timerID = setInterval(
            () => {
                 delta1=delta1+30;
                 delta2=delta2+20;
                 delta3=delta3+10;

                this.tick(delta1,delta2,delta3);
            },
            1000
        );
    }

    componentWillUnmount() { // 生命周期
        clearInterval(this.timerID);
    }

    tick(delta1,delta2,delta3) {
        this.setState({
            cnt1: delta1,
            cnt2: delta2,
            cnt3: delta3
        });
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
        this.setState({access:"欢迎您为自己支持的团队投票"});
    }

    resetTime(){
        this.setState({
            targetTime: new Date().getTime() + 24*60*60*1000
        })

    }

    redirect(){
         this.props.history.push('/bye');


    }

    toTop(){
        window.scrollTo(0,0);
    }
    toDown(){
        window.scrollTo(0,600);

    }

    render() {
        return (
            <div onLoad={this.toTop} >
                <div className="third">
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
                                <h1 className="display-3" >Vote</h1>
                                <p className="lead" style={{ fontWeight:'bold'}}>{this.state.access}</p>

                                <CountDown style={{ fontSize: 30 }} target={this.state.targetTime} />

                                <Row style={{marginTop:"20px"}}>
                                    <Col span={8}>
                                    </Col>
                                    <Col span={8}>
                                        <Timeline >
                                            <Timeline.Item>  由DAO组织的管理员发起活动 </Timeline.Item>
                                            <Timeline.Item>由各个项目团队的领袖发起报名</Timeline.Item>
                                            <Timeline.Item style={{ fontSize: '18px',fontWeight:'bold'}}  color="red">由大众进行投票 </Timeline.Item>
                                            <Timeline.Item>根据投票结果得出最终赢家 </Timeline.Item>
                                        </Timeline>
                                    </Col>
                                </Row>

                                <Button type="primary" onClick={this.toDown}>
                                    查看团队信息
                                </Button>
                            </Container>
                        </Jumbotron>
                    </Container>
                </div>
                <div >

                    <Container>
                        <h1>已报名团队信息</h1>

                        <CountDown style={{ fontSize: 30 }} target={this.state.targetTime}  onClick={this.resetTime}/>


                    </Container>
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
                                />
                                <br/>
                                现有票数
                                <h5> {this.state.cnt1} FDT</h5>

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

                                />
                                <br/>
                                现有票数
                                <h5> {this.state.cnt2} FDT</h5>
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


                                />
                                <br/>
                                现有票数
                                <h5> {this.state.cnt3} FDT</h5>

                            </Card>
                        </Col>
                    </Row>

                    <br/><br/>


                    <Button type="primary" onClick={this.showModal}>
                        填写投票
                    </Button>
                    <Modal title="投票信息填写" visible={this.state.isModalVisible}
                           okText="确认投票"
                           onOk={this.handleOk} onCancel={this.handleCancel}>

                        <Form.Item
                            label="心仪团队"
                            name="name"
                            rules={[{required: true, message: '填入你想给哪个团队投票'}]}
                        >
                            <Input placeholder="填入你想给哪个团队投票" />
                        </Form.Item>

                        <Form.Item
                            label="投票票数"
                            name="name"
                            rules={[{required: true, message: 'FluidDAO Token的个数'}]}
                        >
                            <Input placeholder="FluidDAO Token的个数，单位为FDT"/>
                        </Form.Item>

                        <Form.Item
                            label="其他投票信息"
                            name="name"
                            rules={[{required: true, message: ' '}]}
                        >
                            )
                        </Form.Item>
                    </Modal>

                    <br/>
                    <br/>


                    <Button type="" color="yellow-5" onClick={this.redirect}>
                        投票阶段结束进入最后结果宣布阶段
                    </Button>

                    <br/><br/>
                    <br/><br/>
                </div>
            </div>

        );
    }
}

export default Vote;

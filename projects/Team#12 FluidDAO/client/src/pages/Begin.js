import React from 'react';
import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Jumbotron, Container } from 'reactstrap';


import Header from '../Header/Header';

import { Modal, Button,Form,Input } from 'antd';




class Begin extends React.Component {
    constructor(props) {
        super(props);
        // [isModalVisible, setIsModalVisible] = useState(false);
        this.state = {
            current: 'mail',
            isModelVisible : false,
            setIsModelVisible :false
        };
        this.showModal = this.showModal.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleClick = this.handleClick.bind(this);
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
        this.setState({ current: e.key });
    };




    render() {

        return (
            <div>
                <Header></Header>
                <br/>

                <Container>
                    <Jumbotron fluid>
                        <Container fluid>
                            <h1 className="display-3">FluidDAO</h1>
                            <p className="lead"></p>
                            <br/>

                            {/*<Button>开启活动</Button>*/}
                            {/*<BeginButton> this is me </BeginButton>*/}

                            <div>
                                <Button type="primary" onClick={this.showModal}>
                                    NEW ACTIVITY
                                </Button>
                                <Modal title="Basic Modal" visible={this.state.isModalVisible}
                                       okText="提交"

                                       nOk={this.handleOk} onCancel={this.handleCancel}>
                                    <p>Some contents...</p>
                                    <p>Some contents...</p>
                                    <p>Some contents...</p>
                                    <Form.Item
                                        label="Username"
                                        name="username"
                                        rules={[{ required: true, message: 'Please input your username!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item label="Field A">
                                        <Input placeholder="input placeholder" />
                                    </Form.Item>
                                    <Form.Item label="Field B">
                                        <Input placeholder="input placeholder" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Username"
                                        name="username"
                                        rules={[{ required: true, message: 'Please input your username!' }]}
                                    >
                                        <Input />
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

export default Begin;


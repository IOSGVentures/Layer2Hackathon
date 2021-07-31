import React from 'react';
import { Menu, Button,Row, Col,Space} from 'antd';
// import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import './Header.css';

import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';


// const { SubMenu } = Menu;
import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle
} from 'reactstrap';




class Header extends React.Component {
    state = {
        current: 'mail',
    };

    handleClick = e => {
        console.log('click ', e);
        this.setState({ current: e.key });
    };

    rightClick=e=>{
        alert('right click');
    }

    render() {
        const { current } = this.state;
        return (
            <div className="main">
                <Row>
                    <Col span={3}></Col>
                    <Col span={9}>

                        <Menu

                            onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">


                            {/*<Menu.Item key="app" disabled icon={<AppstoreOutlined />}>*/}
                            {/*    Navigation Two*/}
                            {/*</Menu.Item>*/}
                            {/*<SubMenu key="SubMenu" icon={<SettingOutlined />} title="Navigation Three - Submenu">*/}
                            {/*    <Menu.ItemGroup title="Item 1">*/}
                            {/*        <Menu.Item key="setting:1">Option 1</Menu.Item>*/}
                            {/*        <Menu.Item key="setting:2">Option 2</Menu.Item>*/}
                            {/*    </Menu.ItemGroup>*/}
                            {/*    <Menu.ItemGroup title="Item 2">*/}
                            {/*        <Menu.Item key="setting:3">Option 3</Menu.Item>*/}
                            {/*        <Menu.Item key="setting:4">Option 4</Menu.Item>*/}
                            {/*    </Menu.ItemGroup>*/}
                            {/*</SubMenu>*/}

                            {/*<Menu.Item key="mail" >*/}
                            {/*    Navigation One*/}
                            {/*</Menu.Item>*/}
                            {/*<Menu.Item key="alipay">*/}
                            {/*    <a href="https://fromddy.github.io" target="_blank" rel="noopener noreferrer">*/}
                            {/*        Navigation Four - Link*/}
                            {/*    </a>*/}
                            {/*</Menu.Item>*/}

                            <Menu.Item key="begin" >
                                活动开始
                                <Link to='/begin'></Link>



                            </Menu.Item>

                            <Menu.Item key="sign">
                                报名期
                                <Link to='/sign'></Link>
                            </Menu.Item>

                            <Menu.Item key="vote">
                                投票期
                                <Link to='/vote'></Link>
                            </Menu.Item>

                            <Menu.Item key="end">
                                结算期
                                <Link to='/end'></Link>
                            </Menu.Item>

                            <Menu.Item key="example">
                                举个例子
                                <Link to='/example'></Link>
                            </Menu.Item>





                        </Menu>
                    </Col>

                    <Col span={6}> </Col>

                    <Col span={6}>

                        <Space>
                            <Button className="headerButton"
                                    size="learge"
                                    shape="round"
                                    danger="true"


                                    type="primary">connect</Button>

                        </Space>
                    </Col>
                </Row>
            </div>



        );
    }
}

export default Header;


// ReactDOM.render(<App />, mountNode);

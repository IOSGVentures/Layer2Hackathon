// import logo from './logo.svg';
// import {Button} from 'antd';


import './App.css';

import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Route, Switch, withRouter} from 'react-router-dom';

import Header from'./Header/Header';
import Begin from './pages/Begin';
import Sign from './pages/Sign';
import Example from './pages/Example';
import Font from './pages/Font';
import Test from './pages/Test';
import Vote from './pages/Vote';
import Bye from './pages/Bye';




class ScrollToTop extends React.Component {
    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            document.getElementById("page").scrollTo(0, 0);
        }
    }
    render() {
        return this.props.children;
    }
}
const PageContainer = withRouter(ScrollToTop);


function App() {
  return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <Route exact path={'/'} component={Font} />
            <Route exact path={'/begin'} component={Begin} />
            <Route exact path={'/sign'} component={Sign} />
            <Route exact path={'/example'} component={Example} />
            <Route exact path={'/test'} component={Test} />
            <Route exact path={'/font'} component={Font} />
            <Route exact path={'/vote'}  component={Vote} />
            <Route exact path={'/bye'}  component={Bye} />










            {/*<Route exact path={'/input'} component={MyInput}/>*/}
            {/*<Route exact path={'/account'} component={Account} />*/}
            {/*<Route exact path={'/asset'} component={Asset} />*/}
            {/*<Route exact path={'/transaction-algo'} component={TransactionAlgo} />*/}
            {/*<Route exact path={'/transaction-asa'} component={TransactionASA} />*/}
            {/*<Route exact path={'/limit-order'} component={LimitOrder} />*/}
          </Switch>
        </BrowserRouter>




      </div>


  );
}

export default App;

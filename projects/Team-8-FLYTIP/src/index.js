import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import TipJar from './tipJar.js';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <TipJar address='0xbC108A8Cc826784dC2F98003392180d1ac9EAa9b' />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals 
reportWebVitals();

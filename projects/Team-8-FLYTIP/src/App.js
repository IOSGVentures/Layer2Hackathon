import logo from './favicon.svg'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      < img src={logo} className="App-logo" alt="logo" width='57px' height='100px'/>
        <p>
          Please enjory developing on Aurora.
        </p >
        <a
          className="App-link"
          href="https://doc.aurora.dev/"
          target="_blank"
        >
          Learn more about Aurora
        </ a>
      </header>
    </div>
  );
}

export default App;

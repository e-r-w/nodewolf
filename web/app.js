import * as React from 'react';
import {render} from 'react-dom';
import * as Core from '../core';


class App extends React.Component {

  constructor(){
    super();
    this.runGame = this.runGame.bind(this);
  }

  componentDidMount() {
    this.setState({
      slackToken: '',
      slackChannel: '',
      slackBot: ''
    });
  }

  render() {

    if(this.state && this.state.running){
      return <div>
        <h3>Nodewolf is running. Refresh the page to restart</h3>
      </div>
    }
    else if(this.state && this.state.failed){
      return <div>
        <h3>Slack connection failed.</h3>
        <div>
          <button onClick={ () => this.setState({running: false, failed: false}) } className="btn btn-warning">
            Try again?
          </button>
        </div>
      </div>
    }
    else {
      return <div>
        <h3>Enter your room details</h3>
        <div className="form-group">
          <label htmlFor="slackToken">Slack Token</label>
          <input className="form-control" type="text" id="slackToken" onChange={ (evt) => this.setState({slackToken: evt.target.value }) } />
        </div>
        <div className="form-group">
          <label htmlFor="slackChannel">Slack Channel</label>
          <input className="form-control" type="text" id="slackChannel" onChange={ (evt) => this.setState({slackChannel: evt.target.value }) } />
        </div>
        <div className="form-group">
          <label htmlFor="slackBot">Slack Bot Id</label>
          <input className="form-control" type="text" id="slackBot" onChange={ (evt) => this.setState({slackBot: evt.target.value }) } />
        </div>
        <button className="btn btn-primary" onClick={this.runGame}>
          Go!
        </button>
      </div>
    }

  }

  runGame() {
    Core
      .run(this.state.slackToken, this.state.slackChannel, this.state.slackBot)
      .then(
        () => this.setState({running: true, failed: false}),
        err => this.setState({running: false, failed: true})
      );
  }

}

render(
  <App />,
  document.querySelector('#app')
);
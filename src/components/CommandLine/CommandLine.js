import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CommandLine.css';
import Line from '../Line/Line.js'; // eslint-disable-line import/no-named-as-default
import LastLine from '../Line/LastLine.js';
import appState from '../../core/state.js';


class CommandLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      historyCommands: [],
    };

    this.commandsHandler = this.commandsHandler.bind(this);
  }

  componentDidMount() {
    this.listen();
  }

  componentDidUpdate() {
    appState.trigger('toBottom');
  }

  componentWillUnmount() {
    this.unlisten();
  }

  commandsHandler(historyCommands) {
    this.setState({
      historyCommands,
    });
  }

  listen() {
    appState.listen('historyCommands', this.commandsHandler);
  }

  unlisten() {
    appState.unlisten('historyCommands', this.commandsHandler);
  }

  render() {
    const { historyCommands } = this.state;
    return (
      <div className={s.commandLine} ref={(e) => { this.contentElement = e; }}>
        {
          historyCommands.map((val, idx) =>
            (<Line lineHead={val.lineHead} text={val.text} key={idx.toString()} />))
        }
        <LastLine />
      </div>
    );
  }
}

export default withStyles(s)(CommandLine);

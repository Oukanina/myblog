import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CommandLine.css';
import Line from '../Line/Line.js'; // eslint-disable-line import/no-named-as-default
import LastLine from '../Line/LastLine.js';
import appState from '../../core/state.js';
// import { log } from '../../core/utils.js';
import BaseComponent from '../BaseComponent';


class CommandLine extends BaseComponent {

  constructor(props) {
    super(props);

    this.state = {
      historyCommands: [],
      hideLastLine: false,
      lastLoginTime: '...',
      lastLoginIp: '...',
    };

    this.internalState = ['historyCommands', 'lastLoginTime',
      'lastLoginIp', 'hideLastLine'];
    this.stateListener = this.stateListener.bind(this);
  }

  didUpdate() { // eslint-disable-line class-methods-use-this
    appState.trigger('toBottom');
  }

  stateListener(newState, stateName) {
    this.setState({
      [stateName]: newState,
    });
  }

  renderHeadInfo() {
    const { lastLoginIp, lastLoginTime } = this.state;
    return (
      <div>
        <Line text={'Welcome to my blog!'} />
        <Line text={'Type help for a list of commands.'} />
        <Line
          text={
          ('Last login'
          + ` ${new Date(Date.parse(lastLoginTime) + (8 * 60 * 60 * 1000)).toUTCString()}`
          + ` from ${lastLoginIp}.`).replace('GMT', 'China Time')}
        />
        <Line text={' '} />
      </div>
    );
  }

  render() {
    const { historyCommands, hideLastLine } = this.state;
    return (
      <div className={s.commandLine} ref={(e) => { this.contentElement = e; }}>
        { this.renderHeadInfo() }
        {
          historyCommands.map((val, idx) =>
            (<Line {...val} key={idx.toString()} />))
        }
        <LastLine hide={hideLastLine} />
      </div>
    );
  }

}

export default withStyles(s)(CommandLine);

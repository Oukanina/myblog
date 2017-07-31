import React from 'react';
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import s from './style.css';
import Cursor from '../Cursor';
import { parserText } from './Line';
import BaseComponent from '../BaseComponent';

export default class InputLine extends BaseComponent {
  render() {
    const { text = '', cursorPosition = 0 } = this.props;

    return (
      <span>
        {
          parserText(text, cursorPosition)
        }
        { cursorPosition <= text.length ? null : <Cursor /> }
      </span>);
  }
}

// export default withStyles(s)(InputLine);

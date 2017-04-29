import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './InputLine.css';
import { SPACE } from '../../constants';

/* eslint-disable */
export function splitText(val, idx, className) {
  return val === SPACE ? (<e key={idx} className={cx(s.e, className)}>&nbsp;</e>)
    : (<e key={idx} className={cx(s.e, className)}>{val}</e>);
}
/* eslint-enable */

export function parserText(text, cursorPosition) {
  const output = [];
  for (let i = 0; i < text.length; i += 1) {
    output.push(splitText(text.charAt(i), i, cursorPosition - 1 === i ? s.oncursor : ''));
  }
  return output;
}

export class Line extends React.Component {
  static propTypes = {
    classNames: PropTypes.string,
    lineHead: PropTypes.string,
    text: PropTypes.string,
  }

  print(text, cursorPosition) { // eslint-disable-line class-methods-use-this
    return (
      <div className={s.lineContent}>
        {
          parserText(text, cursorPosition)
        }
      </div>
    );
  }

  renderLine(child = '') {
    const { classNames, lineHead } = this.props;
    const lineClass = cx(s.line, classNames);

    return (
      <div className={lineClass}>
        { lineHead ? <div>{lineHead}</div> : null }
        { child }
      </div>
    );
  }

  render() {
    const { text = '' } = this.props;
    return this.renderLine(this.print(text));
  }
}

Line.defaultProps = {
  classNames: '',
  lineHead: '',
  text: '',
};

export default withStyles(s)(Line);

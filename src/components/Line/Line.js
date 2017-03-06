import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Line.css';
import { SPACE } from '../../constants';


function splitText(val, idx, className) {
  return val === SPACE ? <e key={idx} className={cx(s.e, className)}>&nbsp;</e>
    : <e key={idx} className={cx(s.e, className)}>{val}</e>;
}

export class Line extends React.Component {
  static propTypes = {
    classNames: PropTypes.string,
    lineHead: PropTypes.string,
    text: PropTypes.arrayOf(PropTypes.string),
  }

  print(text, cursorPosition) { // eslint-disable-line class-methods-use-this
    return (
      <div className={s.lineContent}>
        {
          text.map((val, idx) => splitText(val, idx, cursorPosition - 1 === idx ? s.oncursor : ''))
        }
      </div>
    );
  }

  renderLine(child = '') {
    const { classNames, lineHead } = this.props;
    const lineClass = cx(s.line, classNames);

    return (
      <div className={lineClass}>
        { lineHead ? <div className={s.lineHead}>{lineHead}</div> : null }
        { child }
      </div>
    );
  }

  render() {
    const { text = [] } = this.props;
    return this.renderLine(this.print(text));
  }
}

Line.defaultProps = {
  classNames: '',
  lineHead: '',
  text: [],
};

export default withStyles(s)(Line);

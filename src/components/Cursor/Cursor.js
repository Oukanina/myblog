import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Cursor.css';
import a from '../myanimate.css';
import { on, off } from '../../core/utils';


class Cursor extends React.Component {
  static propTypes = {
    blink: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      focus: true,
    };
  }

  componentDidMount() {
    on(window, 'focus', () => {
      this.setState({
        focus: true,
      });
    });
    on(window, 'blur', () => {
      this.setState({
        focus: false,
      });
    });
  }

  componentWillUnmount() {
    off(window, 'focus');
    off(window, 'blur');
  }

  render() {
    const { focus } = this.state;
    const { blink } = this.props;
    const cursorClass = blink && focus ? cx(s.cursor, a.blink) : s.cursor;
    return (
      <div className={cursorClass} />
    );
  }
}

Cursor.defaultProps = {
  blink: true,
};

export default withStyles(s, a)(Cursor);

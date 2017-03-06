import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Cursor.css';
import a from '../myanimate.css';
import { on, off } from '../../core/utils';


class Cursor extends React.Component {
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
    return (
      <div className={focus ? cx(s.cursor, a.blink) : s.cursor} />
    );
  }
}

export default withStyles(s, a)(Cursor);

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Background.css';


class Background extends React.Component {
  static propTypes = {
    color: PropTypes.string,
  }

  render() {
    const { color } = this.props;
    return (
      <div className={s.background} style={{ background: color }} />
    );
  }
}

Background.defaultProps = {
  color: '#232323',
};

export default withStyles(s)(Background);

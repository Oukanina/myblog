import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Container.css';
import appState from '../../core/state';
import { log } from '../../core/utils';


class Container extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  componentDidMount() {
    appState.set('contentElement', this.contentElement);
  }

  render() {
    log(`render ${Date.now()}`);
    return (
      <div className={s.container} ref={(e) => { this.contentElement = e; }}>
        { this.props.children }
      </div>);
  }
}

Container.defaultProps = {
  children: null,
};

export default withStyles(s)(Container);

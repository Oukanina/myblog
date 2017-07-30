import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Screen.css';
import appState from '../../core/state';
import Background from '../Background/Background';
import Container from '../Container/Container';
import ScrollBar from '../ScrollBar/ScrollBar';


class Screen extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    cover: PropTypes.bool, // eslint-disable-line no-unused-prop-types
  };

  static defaultProps = {
    cover: !__DEV__, // eslint-disable-line
  };

  componentDidMount() {
    appState.set('screenElement', this.screenElement);
  }

  render() {
    const { cover } = this.props;
    return (
      <div className={s.root} ref={(e) => { this.screenElement = e; }}>
        <div className={s.screen}>
          { cover ? <div className={s.screenCover} /> : null }
          <Container>
            { this.props.children }
          </Container>
          <ScrollBar />
          <Background />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Screen);

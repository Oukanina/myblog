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
  }

  componentDidMount() {
    appState.update('screenElement', this.screenElement);
  }

  render() {
    return (
      <div className={s.root} ref={(e) => { this.screenElement = e; }}>
        <div className={s.screen}>
          <div className={s.screenCover} />
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

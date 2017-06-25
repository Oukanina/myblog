import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ScrollBar.css';
import appState from '../../core/state';
import { on, off, delayUpdate, log } from '../../core/utils';
import ScrollbarHandler from '../../handlers/ScrollbarHandler';

const state = ['scrollBar', 'toBottom', 'wheel'];

function shouldShowScrollbar() {
  const { containerElement, screenElement } = appState;
  log(appState);
  return containerElement.offsetHeight > screenElement.offsetHeight;
}

class ScrollBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      // min height is 50
      barHeight: 50,
      barTop: 0,
    };

    this.listenHandler = this.listenHandler.bind(this);
    this.windowResizeHandler = this.windowResizeHandler.bind(this);
    // this.scrollbarHandler = new ScrollbarHandler();

    // use shouldUpdate limit
    this.lastUpdateTime = 0;
    this.updateLimit = 10;
    this.updateTimeout = null;
    this.nextState = {};
  }

  componentDidMount() {
    this.listen();
    appState.set('scrollbarElement', this.scrollbarElement);
    on(window, 'resize', this.windowResizeHandler);
    // this.scrollbarHandler.on();
    // this.setBar();
  }

  shouldComponentUpdate() {
    return delayUpdate.call(this,
      arguments[0], arguments[1], this.updateLimit); // eslint-disable-line prefer-rest-params
  }

  componentWillUnmount() {
    this.unlisten();
    off(window, 'resize', this.windowResizeHandler);
    ScrollbarHandler.off();
  }

  setBar() {
    const { containerElement, screenElement } = appState;
    const barHeight = (screenElement.offsetHeight * screenElement.offsetHeight) /
      containerElement.offsetHeight;
    const containerTop = Number(containerElement.style.top.replace('px', ''));
    const barTop = Math.abs((screenElement.offsetHeight * containerTop) /
      containerElement.offsetHeight);

    this.setState(Object.assign({}, this.state, {
      barHeight, barTop,
    }));
  }

  setScrollbar(show) {
    this.setState(Object.assign({}, this.state, {
      show,
    }));
  }

  windowResizeHandler() {
    this.setBar();
  }

  shouldSetToBottom(stateName) {
    return (stateName === 'toBottom' && this.state.show);
  }

  // shouldShowScrollbar() {
  //   const containerElement = appState.get('containerElement');
  //   const screenElement = appState.get('screenElement');
  //   return containerElement.offsetHeight > screenElement.offsetHeight;
  // }

  listenHandler(newState, stateName) {
    if (this.shouldSetToBottom(stateName)) {
      ScrollbarHandler.toBottom();
    }
    if (shouldShowScrollbar()) {
      this.setScrollbar(true);
    } else {
      this.setScrollbar(false);
    }
    if (this.state.show) {
      this.setBar();
    }
  }

  listen() {
    appState.listen(state, this.listenHandler);
  }

  unlisten() {
    appState.unlisten(state, this.listenHandler);
  }

  render() {
    const display = this.state.show ? 'block' : 'none';
    return (
      <div className={s.scrollBar} style={{ display }}>
        <div
          className={s.bar} ref={(e) => { this.scrollbarElement = e; }}
          style={{
            height: `${this.state.barHeight}px`,
            top: `${this.state.barTop}px`,
          }}
        />
      </div>
    );
  }

  // render() {
  //   return this.state.show ? this.renderComponent() : null;
  // }
}


export default withStyles(s)(ScrollBar);

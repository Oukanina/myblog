import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ScrollBar.css';
import appState from '../../core/state';
import { on, off, delayUpdate } from '../../core/utils';
import ScrollbarHandler from '../../handlers/ScrollbarHandler';

const state = ['scrollBar', 'toBottom', 'wheel'];

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
    this.scrollbarHandler = new ScrollbarHandler();

    // use shouldUpdate limit
    this.lastUpdateTime = 0;
    this.updateLimit = 20;
    this.updateTimeout = null;
    this.nextState = {};
  }

  componentDidMount() {
    this.listen();
    on(window, 'resize', this.windowResizeHandler);
    appState.set('scrollBarElement', this.scrollBarElement);
    this.scrollbarHandler.on();
    this.setBar();
  }

  shouldComponentUpdate() {
    return delayUpdate.call(this,
      arguments[0], arguments[1], this.updateLimit); // eslint-disable-line prefer-rest-params
  }

  componentWillUnmount() {
    this.unlisten();
    off(window, 'resize', this.windowResizeHandler);
    this.scrollbarHandler.off();
  }

  setBar() {
    const container = appState.get('containerElement');
    const screen = appState.get('screenElement');
    const barHeight = (screen.offsetHeight * screen.offsetHeight) /
      container.offsetHeight;
    const containerTop = Number(container.style.top.replace('px', ''));
    const barTop = Math.abs((screen.offsetHeight * containerTop) /
      container.offsetHeight);

    this.setState(Object.assign({}, this.state, {
      barHeight, barTop,
    }));
  }

  windowResizeHandler() {
    this.setBar();
  }

  shouldSetToBottom(stateName) {
    return (stateName === 'toBottom' && this.state.show);
  }

  shouldShowScrollbar() {
    const containerElement = appState.get('containerElement');
    const screenElement = appState.get('screenElement');
    return !this.state.show && containerElement.offsetHeight > screenElement.offsetHeight;
  }

  toogleScrollbar() {
    this.setState(Object.assign({}, this.state, {
      show: !this.state.show,
    }));
  }

  listenHandler(newState, stateName) {
    if (this.shouldSetToBottom(stateName)) {
      this.scrollbarHandler.toBottom();
    }
    if (this.shouldShowScrollbar()) {
      this.toogleScrollbar();
    } else if (this.state.show) this.toogleScrollbar();
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

  renderComponent() {
    return (
      <div className={s.scrollBar}>
        <div
          className={s.bar} ref={(e) => { this.scrollBarElement = e; }}
          style={{
            height: `${this.state.barHeight}px`,
            top: `${this.state.barTop}px`,
          }}
        />
      </div>
    );
  }

  render() {
    return this.state.show ? this.renderComponent() : null;
  }
}


export default withStyles(s)(ScrollBar);

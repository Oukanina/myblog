/* eslint-disable class-methods-use-this */

import React from 'react';
import { delayUpdate } from '../../core/utils';
import appState from '../../core/state';

export default class BaseComponent extends React.Component {

  constructor(props) {
    super(props);

    // use shouldUpdate limit
    this.updateTimeout = null;
    this.lastUpdateTime = 0;
    this.updateLimit = 25;
    this.nextState = {};

    // state
    this.internalState = [];

    this.stateListener = this.stateListener.bind(this);
  }

  componentWillMount() {
    // console.log(this.internalState, this.stateListener);
    // appState.unlisten(this.internalState, this.stateListener);
    // this.willMount();
  }

  componentDidMount() {
    appState.listen(this.internalState, this.stateListener);
    this.didMount();
  }

  componentWillReceiveProps() {
    this.willReceiveProps();
  }

  shouldComponentUpdate() {
    return delayUpdate.call(this,
      arguments[0], arguments[1], this.updateLimit); // eslint-disable-line prefer-rest-params
  }

  componentWillUpdate() {
    this.willUpdate();
  }

  componentDidUpdate() {
    this.didUpdate(arguments); // eslint-disable-line prefer-rest-params
  }

  componentWillUnmount() {
    appState.unlisten(this.internalState, this.stateListener);
    this.willUnmount();
  }

  stateListener() {
    // overwrite in child component
  }

  willMount() {
    // overwrite in child component
  }

  didMount() {
    // overwrite in child component
  }

  willUpdate() {
    // overwrite in child component
  }

  didUpdate() {
    // overwrite in child component
  }

  willUnmount() {
    // overwrite in child component
  }

  willReceiveProps() {
    // overwrite in child component
  }

  render() {
    return null;
  }

}

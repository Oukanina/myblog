/* eslint-disable */

import React from 'react';
import BaseCompoent from '../BaseCompoent';
import { on, off } from '../../core/utils';


class Upload extends BaseCompoent {

  constructor(props) {
    super(props);
    this.state = {
      files: [],
    };

    this.dropHandler = this.dropHandler.bind(this);
    this.dragStartHandler = this.dragStartHandler.bind(this);
    this.dragOverHandler = this.dragOverHandler.bind(this);
    this.dragStopHandler = this.dragStopHandler.bind(this);
  }

  didMount() {
    this.bindHandler();
  }

  willUnmount() {
    this.unBindHandler();
  }

  unBindHandler() {
    off(this.element, 'drop', this.dropHandler);
  }

  bindHandler() {
    on(this.element, 'drop', this.dropHandler);
  }

  dragStartHandler(e) {
    e.preventDefault();
  }

  dragOverHandler(e) {

  }

  dragStopHandler() {

  }

  dropHandler(e) {
    const newFiles = e.dataTransfer.files;
    if (this.haveSameFile(newFiles)) return this.prompt();

    this.setState({}, this.state, {
      files: this.state.files.concat(newFiles),
    });
  }

  haveSameFile(newFiles) {

  }

  prompt() {

  }

  render() {
    return (
      <div className="upload" ref={(e) => { this.element = e; }}>
        <span>drop file to here</span>
      </div>
    );
  }
}

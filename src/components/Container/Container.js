import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Container.css';
import appState from '../../core/state';
import { on, off } from '../../core/utils';


class Container extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  constructor(props) {
    super(props);

    this.imageLoadHandler = this.imageLoadHandler.bind(this);
  }

  componentDidMount() {
    appState.set('containerElement', this.containerElement);

    const images = this.getImagElement(this.containerElement);
    for (let i = 0; i < images.length; i += 1) {
      on(images[i], 'load', this.imageLoadHandler);
    }
  }

  getImagElement(node) {
    let output = [];
    if (node.hasChildNodes()) {
      const children = node.childNodes;
      for (let i = 0; i < children.length; i += 1) {
        if (children[i].nodeName === 'IMG') {
          output.push(children[i]);
        }
        output = output.concat(this.getImagElement(children[i]));
      }
    }
    return output;
  }

  imageLoadHandler(event) {
    appState.containerElement = this.containerElement;
    off(event.target, 'load', this.imageLoadHandler);
  }

  render() {
    return (
      <div
        className={s.container}
        ref={(e) => { this.containerElement = e; }}
      >
        { this.props.children }
      </div>);
  }
}

Container.defaultProps = {
  children: null,
};

export default withStyles(s)(Container);

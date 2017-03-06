import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ScrollBar.css';
// import state from '../../core/state';


class ScrollBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      // min height is 50
      barHeight: 50,
    };
  }

  renderComponent() {
    return (
      <div className={s.scrollBar}>
        <div
          className={s.bar} ref={(e) => { this.scrollBarElement = e; }}
          style={{ height: `${this.state.barHeight}px` }}
        />
      </div>
    );
  }

  render() {
    return this.state.show ? this.renderComponent() : null;
  }
}


export default withStyles(s)(ScrollBar);

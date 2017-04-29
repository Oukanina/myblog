import React, { PropTypes } from 'react';
import Link from '../Link';


class Navigation extends React.Component {
  static propTypes = {
    files: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  genFileList() {
    const { files } = this.props;
    const fileList = [];
    fileList.push((
      <div key={'0'}>
        <a href="/"><h2>Back to Home <small> ORZ </small></h2></a>
      </div>
    ));
    for (let i = 0; i < files.length; i += 1) {
      const { id, name, onCreate, owner } = files[i];
      fileList.push((
        <div key={id}>
          <i><strong><Link to={`/article/${id}`}>{name}</Link></strong></i>
          <small style={{ float: 'right' }}>
            on { new Date(onCreate).toLocaleString()} by {owner}
          </small>
        </div>
      ));
    }
    return fileList;
  }

  render() {
    return (
      <div>
        { this.genFileList() }
      </div>
    );
  }
}

export default Navigation;

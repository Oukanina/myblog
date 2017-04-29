import React, { PropTypes } from 'react';
import Link from '../Link';


class Navigation extends React.Component {
  static propTypes = {
    files: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  genFileList() {
    const { files } = this.porps;
    const fileList = [];
    for (let i = 0; i < files.length; i += 1) {
      const { link, name } = files[i];
      fileList.push(<Link to={link}>{name}</Link>);
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

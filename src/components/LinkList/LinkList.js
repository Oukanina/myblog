import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Link from '../Link';
import s from './LinkList.css';


export class LinkList extends React.Component {
  static propTypes = {
    files: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  genFileList() {
    const { files } = this.props;
    const fileList = [];
    fileList.push((
      <div key={'0'}>
        <a className={s.homeLink} style={{ textDecoration: 'none' }} href="/">
          <h2>Back to Home
            <small style={{ fontSize: '60%', marginLeft: '10px' }}>
              ORZ
            </small>
          </h2>
        </a>
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

// export { LinkList };

export default withStyles(s)(LinkList);

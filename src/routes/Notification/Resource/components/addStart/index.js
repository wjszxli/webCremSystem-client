import React from 'react'
import { Upload, Icon, Modal } from 'antd';
import config from 'utils/config'

import { updateImg } from '../../services'

export default class PicturesWall extends React.Component {
  state = {
    fileList: [],
    actionUrl: '',
  };

  componentDidMount() {
    const { editData, id } = this.props
    if (editData[0].starImage) {
      const starImage = editData[0].starImage.split(',')
      const fileList = []
      starImage.forEach((item, i) => {
        fileList.push({
          uid: i,
          name: 'xxx.png',
          status: 'done',
          url: `${config.apiUrl}${item}`,
        })
      })
      this.setState({ fileList })
    }
    this.setState({
      actionUrl: `${config.apiUrl}/uploadImage?id=${id}`,
    })
  }

  handleChange = ({ fileList }) => this.setState({ fileList })

  onRemove = async () => {
    const { fileList } = this.state
    const { editData } = this.props
    let starImage = ''
    fileList.forEach(item => {
      if (item.status === 'done') {
        if (item.url) {
          starImage += `${item.url.replace(config.apiUrl, '')},`
        }
      }
    })
    if (starImage) {
      starImage = starImage.substr(0, starImage.length - 1)
    }
    const [{ id }] = editData
    const body = { starImage, id }
    await updateImg(body)
  }

  render() {
    const { fileList, actionUrl } = this.state;
    const { onCancel } = this.props
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">粉丝属性上传</div>
      </div>
    );

    return (
      <Modal
        title="粉丝属性"
        visible
        confirmLoading={false}
        onCancel={onCancel}
        onOk={onCancel}
      >
        <div className="clearfix">
          <Upload
            action={actionUrl}
            accept="image/gif,image/jpg,image/png"
            listType="picture-card"
            fileList={fileList}
            onChange={this.handleChange}
            onRemove={this.onRemove}
          >
            {fileList.length >= 3 ? null : uploadButton}
          </Upload>
        </div>
      </Modal>
    );
  }
}


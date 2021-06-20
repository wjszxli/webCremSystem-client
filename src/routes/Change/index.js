import React from 'react';
import { Card, Button, Modal, Spin, message, Select } from 'antd';
import request from 'utils/request'
import config from 'utils/config'

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const { confirm } = Modal

export default class Demo extends React.Component {

  state = {
    isLoading: false,
    isAuth: false,
    listData: [],
    toData: 0,
    fromData: 0,
  }


  async componentDidMount() {
    await this.isAuth()
    const { isAuth } = this.state
    if (!isAuth) {
      window.location.href = '/#/exception/403'
    } else {
      this.getPageData()
    }
  }

  async isAuth() {
    const id = localStorage.getItem('id')
    if (!id) {
      window.location.href = '/#/login/logout'
      return
    }
    const url = `${config.apiUrl}/isAuthor?user=${id}&author=master`
    const res = await request(url)
    if (res) {
      if (Number(res.code) === 0) {
        console.log('res.data.tip', res.data.tip)
        if (res.data.tip) {
          this.setState({ isAuth: true })
        }
      } else {
        message.error(res.error);
      }
    }
  }

  getPageData = () => {
    // 获取分页的数据
    const url = `${config.apiUrl}/getUserInfo?pageSize=100&pageIndex=1`
    request(url).then(res => {
      if (res) {
        if (Number(res.code) === 0) {
          this.setState({
            listData: res.data,
          })
        } else {
          message.error(res.error);
        }
      }
    })
  }

  onChange = () => {
    confirm({
      title: '确认',
      content: '确认要迁移吗？，迁移之后数据不可恢复，且迁移中暂停系统其他操作',
      onOk: () => {
        const { toData, fromData } = this.state
        if (!toData || !fromData) {
          message.error("请先选择账号！")
          return false
        }
        this.setState({ isLoading: true })
        const url = `${config.apiUrl}/changeData`
        const options = {
          method: 'POST',
          body: { toData, fromData },
        }
        request(url, options).then(res => {
          if (res && Number(res.code) === 0) {
            setTimeout(() => {
              message.info("迁移成功！")
            }, 5000);
          }
        })
        setTimeout(() => {
          this.setState({ isLoading: false })
        }, 5000);
      },
      onCancel: () => {
        this.setState({ isLoading: false })
      },
      cancelText: "取消",
      okText: "我已确认可以迁移",
    });
  }

  changeFrom = (fromData) => {
    this.setState({ fromData })
  }

  changeTo = (toData) => {
    this.setState({ toData })
  }

  render() {
    const { isLoading, listData } = this.state

    return (
      <PageHeaderLayout title="数据迁移">
        <Card bordered={false}>
          {
            isLoading && (
            <div style={{ margin: '30px' }}>
              <Spin tip="数据迁移中，请稍后..." />
            </div>
          )}
          {
            !isLoading && (
            <div>
              <div style={{ margin: '30px' }}>
                需要迁移的账号：
                <Select style={{ width: 150 }} placeholder="请选择账号" onSelect={this.changeFrom}>
                  {
                    listData.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)
                  }
                </Select>
              </div>
              <div style={{ margin: '30px' }}>
                要将数据迁移到：
                <Select style={{ width: 150 }} placeholder="请选择账号" onSelect={this.changeTo}>
                  {
                    listData.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)
                  }
                </Select>
              </div>
              <div style={{ margin: '30px' }}>
                <Button type="primary" onClick={this.onChange}>迁移</Button>
              </div>
            </div>
)
          }

        </Card>
      </PageHeaderLayout>
    );
  }
}

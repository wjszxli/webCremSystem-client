import React from 'react';
import { Modal, Form, Input, Row, Col, message, Select } from 'antd';

import request from 'utils/request'
import config from 'utils/config'

import './index.less';

const { TextArea } = Input;

const FormItem = Form.Item;
const { Option } = Select;

const optionsData = ['幼儿', '教育亲子', '初高中', '高校', '地方号', '官媒号', '财经', '娱乐', '数码科技', '生活', '体育', '游戏动漫', '文化', '其他', '美食', '情感', '文摘', '汽车', '旅游', '时尚', '美妆护肤', '房产', '健康', '军事', '搞笑趣闻', '职场管理', '招聘', '萌宠', '三农', '星座运势', '摄影', '宗教']
const optionsType = optionsData.map(value => <Option key={value}>{value}</Option>);

export default Form.create()(
  class extends React.Component {
    state = {
      customer: [],
      customerName: '',
    }

    componentDidMount() {
      const { isAdd, form, editData } = this.props
      if (!isAdd) {
        form.setFieldsValue(editData[0])
      }
    }

    onCreate = () => {
      const that = this
      const { form, id, current } = this.props

      form.validateFields((error, value) => {
        if (error) {
          message.error(error)
          return
        }
        const url = `${config.apiUrl}/updatePublicNumber`
        const updateRouter = localStorage.getItem('name')
        if (updateRouter) {
          // eslint-disable-next-line no-param-reassign
          value.updateRouter = updateRouter
        }
        const options = {
          method: 'POST',
          body: value,
        }
        if (id) {
          // eslint-disable-next-line no-param-reassign
          value.id = id
        }
        request(url, options).then(res => {
          if (res) {
            if (res.code === 0) {
              message.success(res.data.tip);
              that.props.getPageData(current)
              that.props.onCancel()
              that.props.form.resetFields();
            } else {
              message.error(res.error);
            }
          }
        })
      })
    }



    render() {
      const { visible, onCancel, form: { getFieldDecorator }, isAdd } = this.props;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      };
      return (
        <Modal
          visible={visible}
          maskClosable={false}
          title="资源更新"
          okText="保存资源信息"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
          <Form className="ant-advanced-search-form">
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="公众号名称">
                  {getFieldDecorator('name', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '输入公众号名称',
                    }],
                  })(<Input placeholder="输入公众号名称" disabled={isAdd} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="id">
                  {getFieldDecorator('dataId', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '输入id',
                    }],
                  })(<Input placeholder="输入id" disabled={isAdd} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="粉丝数">
                  {getFieldDecorator('star', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入粉丝数" disabled={isAdd} />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="头条刊例">
                  {getFieldDecorator('topTitle', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入头条刊例" disabled={isAdd} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="头条成本">
                  {getFieldDecorator('topCost', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '输入报价',
                    }],
                  })(
                    <Input placeholder="输入头条成本" disabled={isAdd} />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="次条刊例">
                  {getFieldDecorator('secondTitle', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '输入成本价',
                    }],
                  })(<Input placeholder="输入次条刊例" disabled={isAdd} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="次条成本">
                  {getFieldDecorator('secondCost', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入次条成本" disabled={isAdd} />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="末条刊例">
                  {getFieldDecorator('lastTitle', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入末条刊例" disabled={isAdd} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="末条成本">
                  {getFieldDecorator('lastCost', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入末条成本" disabled={isAdd} />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="女粉比例">
                  {getFieldDecorator('womenRatio', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入女粉比例" disabled={isAdd} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="是否刷号">
                  {getFieldDecorator('brush', {
                    initialValue: '',
                  })(
                    <Select style={{ width: '90%' }}>
                      <Option value="不刷">不刷</Option>
                      <Option value="全刷">全刷</Option>
                      <Option value="半刷">半刷</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="类型">
                  {getFieldDecorator('type', {
                    initialValue: '',
                  })(
                    <Select style={{ width: '90%' }}>
                      {optionsType}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator('remark', {
                    initialValue: '',
                  })(
                    <TextArea placeholder="输入备注" rows={4} />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      );
    }
  }
);

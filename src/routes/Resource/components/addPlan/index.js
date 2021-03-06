/* eslint-disable no-param-reassign */
import React from 'react';
import { Modal, Form, Input, Row, Col, Radio, message, Select, DatePicker } from 'antd';

import moment from 'moment'
import math from 'mathjs';

import { getAllCustomer, handlePlan, getAllUserInfo } from '../../services'

import './index.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Option } = Select;

export default Form.create()(
  class extends React.Component {
    state = {
      customer: [],
      customerName: '',
      defaultValue: '',
      user: [],
      medium: '',
    }

    async componentDidMount() {
      const customer = await getAllCustomer()
      const user = await getAllUserInfo()

      this.setState({
        customer,
        user,
      })
      const { isAdd, editData, listData, selectedRowKeys, form: { setFieldsValue } } = this.props

      if (!isAdd && editData.length) {
        const data = editData[0]
        data.customer = { key: Number(data.customer) }
        data.medium = { key: data.medium }

        setFieldsValue(data)
      }
      if (isAdd) {
        setFieldsValue({
          publicNumber: listData[selectedRowKeys].name,
        })
      }
      setFieldsValue({
        taxClient: "6%",
      })
    }

    onCreate = () => {
      const { isAdd, form: { validateFields, resetFields }, selectedRowKeys, listData, editData, getPageData, current, onCancel } = this.props
      const { customerName, medium } = this.state
      validateFields((error, value) => {
        if (error) {
          return
        }
        if (selectedRowKeys) {
          value.publicNumberId = listData[selectedRowKeys].id
        }
        if (value.inTime) {
          value.inTime = moment(value.inTime).unix()
        }
        if (value.customer) {
          value.customer = value.customer.key
        }
        if (customerName) {
          value.customerName = customerName
        }

        if (medium) {
          value.medium = medium.label
        } else {
          value.medium = medium['key']
        }

        const name = localStorage.getItem('name')
        if (name) {
          value.planPeople = name
        }
        const userId = localStorage.getItem('id')
        if (userId) {
          value.userId = userId
        }
        let url = 'savePlan'
        if (!isAdd && editData.length) {
          const [{ id }] = editData
          url = 'updatePlan'
          value.id = id
        }
        value.model = 0
        handlePlan(url, value).then(({ tip }) => {
          message.success(tip)
          getPageData(current)
          onCancel()
          resetFields();
        })
      })
    }

    handleChange = (value) => {
      this.setState({
        customerName: value.label,
      })
    }

    handleImpost = (e) => {
      const { form: { getFieldsValue, setFieldsValue } } = this.props
      const { isInvoiceRouter, cost } = getFieldsValue()
      const taxClient = Number(e) / 100
      let channelImpost = 0

      if (isInvoiceRouter === 1) {
        channelImpost = math.eval(`(${cost} /${(1 + taxClient)})*${taxClient}`)
      }
      if (isInvoiceRouter === 0) {
        // channelImpost = math.eval(`${cost} * ${0.018}`)
        channelImpost = 0
      }
      channelImpost = math.round(channelImpost, 2)
      setFieldsValue({
        channelImpost,
      })
    }

    onChangeRadiogroup = e => {
      const { form: { getFieldsValue, setFieldsValue } } = this.props
      const { target: { value } } = e
      const { price, isInvoiceRouter } = getFieldsValue()

      let impost = 0
      if (Number(value) === 1) {
        impost = math.eval(`(${price} / (1+${0.06})) * ${0.06}`)
      }
      if (isInvoiceRouter === 0) {
        const channelImpost = 0
        setFieldsValue({ channelImpost })
      }
      impost = math.round(impost, 2)
      setFieldsValue({ impost })
    }

    onChangeRouter = e => {
      const { target: { value } } = e
      const { form: { getFieldsValue, setFieldsValue } } = this.props

      const { taxRouter, cost, isInvoiceClient } = getFieldsValue()
      const taxClient = Number(taxRouter) / 100
      let channelImpost = 0
      if (value === 1) {
        channelImpost = math.eval(`(${cost} /${(1 + taxClient)})*${taxClient}`)
      }
      if (value === 0) {
        // channelImpost = -math.eval(`${cost} * ${0.018}`)
        // if (isInvoiceClient === 0) {
        channelImpost = 0
        // }
      }
      channelImpost = math.round(channelImpost, 2)
      setFieldsValue({
        channelImpost,
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
      const { customer, user } = this.state
      const options = customer.map(d => <Option value={d.id}>{d.companyName}</Option>);
      const userOptions = user.map(d => <Option value={d.name}>{d.name}</Option>)


      return (
        <Modal
          visible={visible}
          maskClosable={false}
          title="??????????????????"
          okText="??????????????????"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
          <Form className="ant-advanced-search-form">
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="???????????????">
                  {getFieldDecorator('publicNumber', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '?????????????????????',
                    }],
                  })(<Input placeholder="?????????????????????" disabled={isAdd} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="????????????">
                  {getFieldDecorator('location', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '??????????????????',
                    }],
                  })(
                    <Select style={{ width: '90%' }} placeholder="??????????????????">
                      <Option value="top">??????</Option>
                      <Option value="second">??????</Option>
                      <Option value="other">?????????</Option>
                      <Option value="last">??????</Option>
                    </Select>)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="????????????">
                  {getFieldDecorator('customer', {
                    initialValue: "",
                  })(
                    <Select
                      showSearch
                      style={{ width: '90%' }}
                      placeholder="Select a person"
                      labelInValue
                      onChange={this.handleChange}
                      filterOption={(input, option) => option.props.children.indexOf(input) > -1}
                    >
                      {options}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="????????????">
                  {getFieldDecorator('inTime', {
                    initialValue: '',
                  })(
                    <DatePicker
                      format="YYYY-MM-DD"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="??????">
                  {getFieldDecorator('price', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '????????????',
                    }],
                  })(<Input type="number" placeholder="????????????" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="?????????">
                  {getFieldDecorator('cost', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '???????????????',
                    }],
                  })(<Input type="number" placeholder="???????????????" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="????????????????????????">
                  {getFieldDecorator('isInvoiceClient', {
                    initialValue: '1',
                  })(
                    <RadioGroup name="radiogroup" onChange={this.onChangeRadiogroup}>
                      <Radio value={1}>???</Radio>
                      <Radio value={0}>???</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="??????">
                  {getFieldDecorator('taxClient', {
                    initialValue: '',
                  })(
                    <Input value="6" disabled />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="????????????????????????">
                  {getFieldDecorator('isInvoiceRouter', {
                    initialValue: '1',
                  })(
                    <RadioGroup name="radiogroup" onChange={this.onChangeRouter}>
                      <Radio value={1}>???</Radio>
                      <Radio value={0}>???</Radio>
                      <Radio value={2}>??????</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="??????">
                  {getFieldDecorator('taxRouter', {
                    initialValue: '',
                  })(
                    <Select style={{ width: '90%' }} onChange={this.handleImpost} defaultValue={6} placeholder="????????????">
                      <Option value="1">1%</Option>
                      <Option value="3">3%</Option>
                      <Option value="6">6%</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="??????">
                  {getFieldDecorator('impost', {
                    initialValue: '',
                  })(<Input type="number" placeholder="??????" disabled />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="????????????">
                  {getFieldDecorator('channelImpost', {
                    initialValue: '',
                  })(<Input type="number" placeholder="????????????" disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24} pull={4}>
                <FormItem {...formItemLayout} label="??????">
                  {getFieldDecorator('rebate', {
                    initialValue: '',
                  })(<Input type="number" placeholder="????????????" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24} pull={4}>
                <FormItem {...formItemLayout} label="??????">
                  {getFieldDecorator('remark', {
                    initialValue: '',
                  })(
                    <TextArea placeholder="????????????" rows={4} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24} pull={4}>
                <FormItem {...formItemLayout} label="????????????">
                  {getFieldDecorator('medium', {
                    initialValue: "",
                  })(
                    <Select
                      showSearch
                      style={{ width: '90%' }}
                      placeholder="?????????????????????"
                      labelInValue
                      onChange={(medium) => this.setState({ medium })}
                    >
                      {userOptions}
                    </Select>
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

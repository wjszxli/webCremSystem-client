/* eslint-disable no-param-reassign */
import React from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Radio,
  message,
  Select,
  DatePicker
} from "antd";

import moment from "moment";
import math from "mathjs";

import { getAllCustomer, handlePlan, getAllUserInfo } from "../../services";
import "./index.less";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Option } = Select;

export default Form.create()(
  class extends React.Component {
    state = {
      customer: [],
      customerName: "",
      defaultValue: "",
      medium: "",
      user: []
    };

    async componentDidMount() {
      const customer = await getAllCustomer();
      const user = await getAllUserInfo();

      this.setState({
        customer,
        user
      });
      const {
        isAdd,
        editData,
        listData,
        selectedRowKeys,
        form: { setFieldsValue }
      } = this.props;

      if (!isAdd && editData.length) {
        const data = editData[0];
        // const { medium } = data
        // if (medium) {
        //   this.setState({ medium })
        // }
        data.customer = { key: Number(data.customer) };
        data.medium = { key: data.medium };
        setFieldsValue(data);
      }
      if (isAdd) {
        setFieldsValue({
          publicNumber: listData[selectedRowKeys].name
        });
      }
      setFieldsValue({
        taxClient: "6%"
      });
    }

    onCreate = () => {
      const {
        isAdd,
        form: { validateFields, resetFields },
        selectedRowKeys,
        listData,
        editData,
        getPageData,
        current,
        onCancel
      } = this.props;
      const { customerName, medium } = this.state;
      validateFields((error, value) => {
        if (error) {
          return;
        }
        if (selectedRowKeys) {
          value.publicNumberId = listData[selectedRowKeys].id;
        }
        if (value.inTime) {
          value.inTime = moment(value.inTime).unix();
        }
        if (value.customer) {
          value.customer = value.customer.key;
        }
        if (customerName) {
          value.customerName = customerName;
        }
        if (medium) {
          value.medium = medium.label;
        } else {
          value.medium = medium["key"];
        }
        const name = localStorage.getItem("name");
        if (name) {
          value.planPeople = name;
        }
        const userId = localStorage.getItem("id");
        if (userId) {
          value.userId = userId;
        }
        let url = "savePlan";
        if (!isAdd && editData.length) {
          const [{ id }] = editData;
          url = "updatePlan";
          value.id = id;
        }
        value.model = 3;
        handlePlan(url, value).then(({ tip }) => {
          message.success(tip);
          getPageData(current);
          onCancel();
          resetFields();
        });
      });
    };

    handleChange = value => {
      this.setState({
        customerName: value.label
      });
    };

    handleImpost = e => {
      const {
        form: { getFieldsValue, setFieldsValue }
      } = this.props;
      const { isInvoiceRouter, cost } = getFieldsValue();
      const taxClient = Number(e) / 100;
      let channelImpost = 0;

      // channelImpost  渠道税款
      // isInvoiceClient 客户是否需要发票
      // isInvoiceRouter 渠道方是否需要发票
      if (isInvoiceRouter === 1) {
        channelImpost = math.eval(`(${cost} /${1 + taxClient})*${taxClient}`);
      }
      if (isInvoiceRouter === 0) {
        // channelImpost = math.eval(`${cost} * ${0.018}`)
        channelImpost = 0;
      }
      channelImpost = math.round(channelImpost, 2);
      setFieldsValue({
        channelImpost
      });
    };

    onChangeRadiogroup = e => {
      const {
        form: { getFieldsValue, setFieldsValue }
      } = this.props;
      const {
        target: { value }
      } = e;
      const { price, isInvoiceRouter } = getFieldsValue();

      let impost = 0;
      if (Number(value) === 1) {
        impost = math.eval(`(${price} / (1+${0.06})) * ${0.06}`);
      }
      if (isInvoiceRouter === 0) {
        const channelImpost = 0;
        setFieldsValue({ channelImpost });
      }
      impost = math.round(impost, 2);
      setFieldsValue({ impost });
    };

    onChangeRouter = e => {
      const {
        target: { value }
      } = e;
      const {
        form: { getFieldsValue, setFieldsValue }
      } = this.props;

      const { taxRouter, cost, isInvoiceClient } = getFieldsValue();
      // channelImpost  渠道税款
      // isInvoiceClient 客户是否需要发票
      // isInvoiceRouter 渠道方是否需要发票
      const taxClient = Number(taxRouter) / 100;
      let channelImpost = 0;
      if (value === 1) {
        channelImpost = math.eval(`(${cost} /${1 + taxClient})*${taxClient}`);
      }
      if (value === 0) {
        channelImpost = -math.eval(`${cost} * ${0.018}`);
        if (isInvoiceClient === 0 || isInvoiceClient === 1) {
          channelImpost = 0;
        }
      }
      channelImpost = math.round(channelImpost, 2);
      setFieldsValue({
        channelImpost
      });
    };

    render() {
      const {
        visible,
        onCancel,
        form: { getFieldDecorator },
        isAdd
      } = this.props;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        }
      };
      const { customer, user } = this.state;
      const options = customer.map(d => (
        <Option value={d.id}>{d.companyName}</Option>
      ));
      const userOptions = user.map(d => (
        <Option value={d.name}>{d.name}</Option>
      ));

      return (
        <Modal
          visible={visible}
          maskClosable={false}
          title="录入排期信息"
          okText="保存排期信息"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
          <Form className="ant-advanced-search-form">
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="微博名称">
                  {getFieldDecorator("publicNumber", {
                    initialValue: "",
                    rules: [
                      {
                        required: true,
                        whitespace: true,
                        message: "输入微博名称"
                      }
                    ]
                  })(<Input placeholder="输入微博名称" disabled={isAdd} />)}
                </FormItem>
              </Col>
              {/* <Col span={12}>
                <FormItem {...formItemLayout} label="投放形式">
                  {getFieldDecorator('location', {
                    initialValue: '',
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '输入客户品牌',
                    }],
                  })(
                    <Select style={{ width: '90%' }} placeholder="选择类型搜索">
                      <Option value="top">直发</Option>
                      <Option value="second">转发</Option>
                      <Option value="other">原创直发</Option>
                      <Option value="last">视频</Option>
                    </Select>)}
                </FormItem>
              </Col> */}
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="客户名称">
                  {getFieldDecorator("customer", {
                    initialValue: ""
                  })(
                    <Select
                      showSearch
                      style={{ width: "90%" }}
                      placeholder="Select a person"
                      labelInValue
                      onChange={this.handleChange}
                      filterOption={(input, option) =>
                        option.props.children.indexOf(input) > -1
                      }
                    >
                      {options}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="投放时间">
                  {getFieldDecorator("inTime", {
                    initialValue: ""
                  })(<DatePicker format="YYYY-MM-DD" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="报价">
                  {getFieldDecorator("price", {
                    initialValue: "",
                    rules: [
                      {
                        required: true,
                        whitespace: true,
                        message: "输入报价"
                      }
                    ]
                  })(<Input type="number" placeholder="输入报价" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="成本价">
                  {getFieldDecorator("cost", {
                    initialValue: "",
                    rules: [
                      {
                        required: true,
                        whitespace: true,
                        message: "输入成本价"
                      }
                    ]
                  })(<Input type="number" placeholder="输入成本价" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="客户是否需要发票">
                  {getFieldDecorator("isInvoiceClient", {
                    initialValue: "1"
                  })(
                    <RadioGroup
                      name="radiogroup"
                      onChange={this.onChangeRadiogroup}
                    >
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="税点">
                  {getFieldDecorator("taxClient", {
                    initialValue: ""
                  })(<Input value="6" disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="渠道方是否有发票">
                  {getFieldDecorator("isInvoiceRouter", {
                    initialValue: "1"
                  })(
                    <RadioGroup
                      name="radiogroup"
                      onChange={this.onChangeRouter}
                    >
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                      <Radio value={2}>普票</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="税点">
                  {getFieldDecorator("taxRouter", {
                    initialValue: ""
                  })(
                    <Select
                      style={{ width: "90%" }}
                      onChange={this.handleImpost}
                      defaultValue={6}
                      placeholder="选择税点"
                    >
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
                <FormItem {...formItemLayout} label="税款">
                  {getFieldDecorator("impost", {
                    initialValue: ""
                  })(<Input type="number" placeholder="税款" disabled />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="渠道税款">
                  {getFieldDecorator("channelImpost", {
                    initialValue: ""
                  })(<Input type="number" placeholder="渠道税款" disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24} pull={4}>
                <FormItem {...formItemLayout} label="返点">
                  {getFieldDecorator("rebate", {
                    initialValue: ""
                  })(<Input type="number" placeholder="输入返点" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24} pull={4}>
                <FormItem {...formItemLayout} label="对应媒介">
                  {getFieldDecorator("medium", {
                    initialValue: ""
                  })(
                    <Select
                      showSearch
                      style={{ width: "90%" }}
                      placeholder="选择对应的媒介"
                      labelInValue
                      onChange={medium => this.setState({ medium })}
                    >
                      {userOptions}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24} pull={4}>
                <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator("remark", {
                    initialValue: ""
                  })(<TextArea placeholder="输入备注" rows={4} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      );
    }
  }
);

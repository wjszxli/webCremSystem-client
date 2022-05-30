import React from "react";
import { Modal, Form, Input, Row, Col, message, Select } from "antd";

import request from "utils/request";
import config from "utils/config";

import "./index.less";

const { TextArea } = Input;

const FormItem = Form.Item;
const { Option } = Select;

const optionsData = [
  "教育亲子",
  "食品",
  "美妆个护",
  "电商",
  "综合",
  "男装",
  "女装",
  "其它"
];
const optionsType = optionsData.map(value => (
  <Option key={value}>{value}</Option>
));

export default Form.create()(
  class extends React.Component {
    state = {
      customer: [],
      customerName: ""
    };

    componentDidMount() {
      const { isAdd, form, editData } = this.props;
      if (!isAdd) {
        form.setFieldsValue(editData[0]);
      }
    }

    onCreate = () => {
      const that = this;
      const { form, id, current } = this.props;

      form.validateFields((error, value) => {
        if (error) {
          message.error(error);
          return;
        }
        const url = `${config.apiUrl}/updateCamera`;
        const updateRouter = localStorage.getItem("name");
        if (updateRouter) {
          // eslint-disable-next-line no-param-reassign
          value.updateRouter = updateRouter;
        }
        const options = {
          method: "POST",
          body: value
        };
        if (id) {
          // eslint-disable-next-line no-param-reassign
          value.id = id;
        }
        request(url, options).then(res => {
          if (res) {
            if (res.code === 0) {
              message.success(res.data.tip);
              that.props.getPageData(current);
              that.props.onCancel();
              that.props.form.resetFields();
            } else {
              message.error(res.error);
            }
          }
        });
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
      return (
        <Modal
          visible={visible}
          maskClosable={false}
          title="微博资源更新"
          okText="保存微博资源信息"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
          <Form className="ant-advanced-search-form">
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="微博名称">
                  {getFieldDecorator("name", {
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
              <Col span={12}>
                <FormItem {...formItemLayout} label="ID">
                  {getFieldDecorator("dataId", {
                    initialValue: "",
                    rules: [
                      {
                        required: true,
                        whitespace: true,
                        message: "输入id"
                      }
                    ]
                  })(<Input placeholder="输入id" disabled={isAdd} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="粉丝数">
                  {getFieldDecorator("star", {
                    initialValue: ""
                  })(<Input placeholder="输入粉丝数" disabled={isAdd} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="平台">
                  {getFieldDecorator("platform", {
                    initialValue: ""
                  })(<Input placeholder="输入平台" disabled={isAdd} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="混播坑位费">
                  {getFieldDecorator("topCost", {
                    initialValue: "",
                    rules: [
                      {
                        required: true,
                        whitespace: true,
                        message: "输入混播坑位费"
                      }
                    ]
                  })(<Input placeholder="输入混播坑位费" disabled={isAdd} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="专场坑位费">
                  {getFieldDecorator("secondCost", {
                    initialValue: ""
                  })(<Input placeholder="输入专场坑位费" disabled={isAdd} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="佣金">
                  {getFieldDecorator("lastCost", {
                    initialValue: ""
                  })(<Input placeholder="输入佣金" disabled={isAdd} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="是否刷号">
                  {getFieldDecorator("brush", {
                    initialValue: ""
                  })(
                    <Select style={{ width: "90%" }}>
                      <Option value="是">是</Option>
                      <Option value="否">否</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="类型">
                  {getFieldDecorator("type", {
                    initialValue: ""
                  })(<Select style={{ width: "90%" }}>{optionsType}</Select>)}
                </FormItem>
              </Col>
              <Col span={12}>
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

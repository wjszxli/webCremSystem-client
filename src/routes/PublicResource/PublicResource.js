import React, { Fragment } from "react";
import moment from "moment";
import {
  Card,
  Form,
  Row,
  Col,
  Input,
  Button,
  Select,
  Radio,
  Table,
  Divider,
  Pagination,
  message
} from "antd";
import request from "utils/request";
import config from "utils/config";
import PageHeaderLayout from "../../layouts/PageHeaderLayout";
import style from "./publicResource.less";

import AddCustomer from "../Customer/addCustomer";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { Option } = Select;

export default Form.create()(
  class Customer extends React.Component {
    state = {
      listData: [],
      current: 1,
      pageSize: 10,
      dataCount: 0,
      editData: {},
      visible: false,
      userData: []
    };

    componentDidMount() {
      this.getPageData(1);
      const url = `${config.apiUrl}/getUserInfo?pageSize=100&pageIndex=1`;
      request(url).then(res => {
        if (res) {
          if (Number(res.code) === 0) {
            this.setState({
              userData: res.data
            });
          } else {
            message.error(res.error);
          }
        }
      });
    }

    onChange = page => {
      this.setState({
        current: page
      });
      this.getPageData(page);
    };

    handleFormReset = () => {
      const { form } = this.props;
      form.resetFields();
      this.getPageData(1);
    };

    deleteData = record => {
      const url = `${config.apiUrl}/deleteCustomer`;
      const options = {
        method: "POST",
        body: {
          id: record.id,
          isDelete: 0
        }
      };
      request(url, options).then(res => {
        if (res) {
          if (res.code === 0) {
            message.success(res.data.tip);
            this.getPageData(1);
          } else {
            message.error(res.error);
          }
        }
      });
      console.log("record", record);
    };

    getPageData = (pageIndex, searchData) => {
      let searchItem = "";
      if (searchData) {
        const keys = Object.keys(searchData);
        keys.forEach(item => {
          searchItem += `&${item}=${searchData[item]}`;
        });
      }
      // ?????????????????????
      let url = `${
        config.apiUrl
      }/getCustomer?isDelete=1&pageSize=10&pageIndex=${pageIndex}${searchItem}`;
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              listData: res.data
            });
          } else {
            message.error(res.error);
          }
        }
      });
      // ??????????????????
      url = `${config.apiUrl}/getCustomerCount?isDelete=1${searchItem}`;
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              dataCount: res.data[0].count
            });
          } else {
            message.error(res.error);
          }
        }
      });
    };

    searchData = () => {
      const that = this;
      this.props.form.validateFields((error, value) => {
        if (error) {
          return;
        }
        this.getPageData(1, value);
      });
    };

    getOneCustomer = id => {
      const url = `${config.apiUrl}/getOneCustomer?id=${id}`;
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              editData: res.data,
              visible: true,
              isAdd: false
            });
          } else {
            message.error(res.error);
          }
        }
      });
    };

    searchArea() {
      const { getFieldDecorator } = this.props.form;
      const { userData } = this.state;

      const options = userData.map(d => (
        <Option value={d.name}>{d.name}</Option>
      ));

      return (
        <Form>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <FormItem label="????????????">
                {getFieldDecorator("customer", {
                  initialValue: ""
                })(<Input placeholder="???????????????/????????????" />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="?????????">
                {getFieldDecorator("people", {
                  initialValue: ""
                })(
                  <Select style={{ width: 150 }} placeholder="?????????????????????">
                    {options}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="????????????">
                {getFieldDecorator("isCollaborate", {
                  initialValue: ""
                })(
                  <RadioGroup name="radiogroup">
                    <Radio value={1}>???</Radio>
                    <Radio value={0}>???</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          </Row>
          <div style={{ overflow: "hidden" }}>
            <span style={{ float: "right", marginBottom: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.searchData}
              >
                ??????
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={this.handleFormReset}
              >
                ??????
              </Button>
            </span>
          </div>
        </Form>
      );
    }

    handleCancel = () => {
      this.setState({ visible: false });
    };

    render() {
      const columns = [
        {
          title: "????????????",
          dataIndex: "companyName",
          key: "companyName"
        },
        {
          title: "????????????",
          dataIndex: "createTime",
          key: "createTime",
          width: "180px",
          render: val => {
            const time = val ? moment(val).format("YYYY-MM-DD HH:mm:ss") : "";
            return <span>{time === "Invalid date" ? "" : time}</span>;
          }
        },
        {
          title: "????????????",
          dataIndex: "brand",
          key: "brand"
        },
        {
          title: "?????????",
          dataIndex: "connect",
          key: "connect"
        },
        {
          title: "??????",
          dataIndex: "phone",
          key: "phone"
        },
        {
          title: "??????",
          dataIndex: "webchat",
          key: "webchat"
        },
        {
          title: "qq",
          dataIndex: "qq",
          key: "qq"
        },
        {
          title: "????????????",
          dataIndex: "isCollaborate",
          key: "isCollaborate",
          render: record => <span>{record === "1" ? "?????????" : "?????????"}</span>
        },
        {
          title: "?????????",
          dataIndex: "people",
          key: "people"
        },
        {
          title: "??????",
          render: record => (
            <Fragment>
              <Divider type="vertical" />
              <a
                onClick={() => {
                  this.deleteData(record);
                }}
              >
                ??????
              </a>
              <Divider type="vertical" />
              <a
                onClick={() => {
                  this.getOneCustomer(record.id);
                }}
              >
                ????????????
              </a>
            </Fragment>
          )
        }
      ];

      return (
        <PageHeaderLayout title="???????????????">
          {this.state.visible && (
            <AddCustomer
              visible={this.state.visible}
              onCancel={this.handleCancel}
              getPageData={this.getPageData}
              editData={this.state.editData}
              isAdd={this.state.isAdd}
            />
          )}
          <Card bordered={false}>
            <div className={style.tableList}>
              <div className={style.tableListForm}>{this.searchArea()}</div>
              <div className={style.tableListOperator}>
                <Table
                  columns={columns}
                  rowKey="id"
                  dataSource={this.state.listData}
                  pagination={false}
                />
                <Pagination
                  style={{ marginTop: "10px" }}
                  current={this.state.current}
                  onChange={this.onChange}
                  pageSize={10}
                  total={this.state.dataCount}
                />
              </div>
            </div>
          </Card>
        </PageHeaderLayout>
      );
    }
  }
);

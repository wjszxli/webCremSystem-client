import React, { Fragment } from "react";
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
  message,
  AutoComplete
} from "antd";
import request from "utils/request";
import config from "utils/config";
import moment from "moment";

import PageHeaderLayout from "../../layouts/PageHeaderLayout";
import style from "./customer.less";

import AddCustomer from "./addCustomer";
import AddRemark from "./addRemark";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { Option } = Select;

export default Form.create()(
  class Customer extends React.Component {
    state = {
      visible: false,
      isAdd: false,
      listData: [],
      current: 1,
      pageSize: 10,
      dataCount: 0,
      editData: {},
      visibleRemark: false,
      isSell: false,
      isCharge: false,
      isMaster: false,
      userData: [],
      dataSource: []
    };

    async componentDidMount() {
      const sell = await this.isAuth("sell");
      if (sell) {
        if (sell.code === 0) {
          if (sell.data.tip) {
            this.setState({ isSell: true });
          }
        }
      }
      const charge = await this.isAuth("charge");
      if (charge) {
        if (charge.code === 0) {
          if (charge.data.tip) {
            this.setState({ isCharge: true });
          }
        }
      }
      const master = await this.isAuth("master");
      if (master) {
        if (master.code === 0) {
          if (master.data.tip) {
            this.setState({ isMaster: true });
          }
        }
      }
      const { isSell, isCharge, isMaster } = this.state;
      if (!isSell && !isCharge && !isMaster) {
        window.location.href = "/#/exception/403";
        return;
      }
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

    async isAuth(author) {
      const id = localStorage.getItem("id");
      if (!id) {
        window.location.href = "/#/login/logout";
        return;
      }
      const url = `${config.apiUrl}/isAuthor?user=${id}&author=${author}`;
      const res = await request(url);
      return res;
      // if (res) {
      //   if (res.code === 0){
      //     console.log('res.data.tip', res.data.tip)
      //     if (res.data.tip) {
      //       this.setState({isAuth:true})
      //     }
      //   }else{
      //     message.error(res.error);
      //   }
      // }
    }

    onChange = page => {
      this.setState({
        current: page
      });
      this.props.form.validateFields((error, value) => {
        if (error) {
          return;
        }
        this.getPageData(page, value);
      });
    };

    deleteData = record => {
      const url = `${config.apiUrl}/deleteCustomer`;
      const options = {
        method: "POST",
        body: {
          id: record.id,
          isDelete: 1
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
    };

    getPageData = (pageIndex, searchData) => {
      const { isSell, isCharge, isMaster } = this.state;

      let searchItem = "";
      if (searchData) {
        const keys = Object.keys(searchData);
        keys.forEach(item => {
          searchItem += `&${item}=${searchData[item]}`;
        });
      }
      const userId = localStorage.getItem("id");
      if (userId) {
        searchItem += `&userId=${userId}`;
      }
      let tag = "";
      if (isMaster) {
        tag = "all";
      } else if (isCharge) {
        tag = "dept";
      } else if (isSell) {
        tag = "self";
      }
      searchItem += `&tag=${tag}`;
      // ?????????????????????
      let url = `${
        config.apiUrl
      }/getCustomer?isDelete=0&pageSize=10&pageIndex=${pageIndex}${searchItem}`;
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
      url = `${config.apiUrl}/getCustomerCount?isDelete=0${searchItem}`;
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

    getOneCustomer = async id => {
      const url = `${config.apiUrl}/getOneCustomer?id=${id}`;
      const res = await request(url);
      if (res) {
        if (res.code === 0) {
          this.setState({
            editData: res.data,
            isAdd: false
          });
        } else {
          message.error(res.error);
        }
      }
    };

    lookDetail = async id => {
      await this.getOneCustomer(id);
      this.setState({ visible: true });
    };

    handleCancel = () => {
      this.setState({ visible: false });
    };

    closeModel = () => {
      this.setState({ visibleRemark: false });
    };

    searchData = () => {
      this.props.form.validateFields((error, value) => {
        if (error) {
          return;
        }
        this.setState({ current: 1 });
        this.getPageData(1, value);
      });
    };

    handleFormReset = () => {
      const { form } = this.props;
      form.resetFields();
      this.getPageData(1);
    };

    searchArea() {
      const { userData, isMaster, isCharge, isSell } = this.state;
      const options = userData.map(d => (
        <Option value={d.name}>{d.name}</Option>
      ));
      const { getFieldDecorator } = this.props.form;

      const onSelect = value => {
        console.log("onSelect", value);
      };

      const onSearch = searchText => {
        const { Option } = AutoComplete;

        let tag = "";
        if (isMaster) {
          tag = "all";
        } else if (isCharge) {
          tag = "dept";
        } else if (isSell) {
          tag = "self";
        }
        const url = `${
          config.apiUrl
        }/getCustomerLike?companyName=${searchText}&tag=${tag}`;
        request(url).then(res => {
          if (res) {
            if (Number(res.code) === 0) {
              const { data } = res;
              const dataSource = [];
              data.forEach(opt => {
                const { id, companyName, brand, people, isCollaborate } = opt;
                const str = `????????????:${companyName} | ????????????:${brand} | ?????????:${people} | ????????????:${
                  isCollaborate ? "???" : "???"
                }`;
                dataSource.push(
                  <Option key={id} value={companyName}>
                    {str}
                  </Option>
                );
              });
              this.setState({ dataSource });
            } else {
              message.error(res.error);
            }
          }
        });
      };

      const { dataSource } = this.state;

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
          <Row>
            <Col md={24}>
              <FormItem label="????????????">
                {getFieldDecorator("companyName", {
                  initialValue: ""
                })(
                  <AutoComplete
                    dataSource={dataSource}
                    onSelect={onSelect}
                    onSearch={onSearch}
                    placeholder="?????????????????????????????????"
                    dropdownStyle={{ width: 600 }}
                    style={{ width: 600 }}
                  />
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

    addData = () => {
      this.setState({ visible: true, isAdd: true });
    };

    follow = async id => {
      await this.getOneCustomer(id, { visibleRemark: true });
      this.setState({
        visibleRemark: true
      });
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
          render: record => (
            <span>{Number(record) === 1 ? "?????????" : "?????????"}</span>
          )
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
              <a
                onClick={() => {
                  this.follow(record.id);
                }}
              >
                ??????
              </a>
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
                  this.lookDetail(record.id);
                }}
              >
                ????????????
              </a>
            </Fragment>
          )
        }
      ];

      return (
        <PageHeaderLayout title="????????????">
          <Card bordered={false}>
            {this.state.visible && (
              <AddCustomer
                visible={this.state.visible}
                onCancel={this.handleCancel}
                getPageData={this.getPageData}
                editData={this.state.editData}
                isAdd={this.state.isAdd}
              />
            )}
            {this.state.visibleRemark && (
              <AddRemark
                visibleRemark={this.state.visibleRemark}
                onCancel={this.closeModel}
                getPageData={this.getPageData}
                editData={this.state.editData}
                isAdd={this.state.isAdd}
              />
            )}
            <div className={style.tableList}>
              <div className={style.tableListForm}>{this.searchArea()}</div>
              <div className={style.tableListOperator}>
                <Button icon="plus" type="primary" onClick={this.addData}>
                  ????????????
                </Button>
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

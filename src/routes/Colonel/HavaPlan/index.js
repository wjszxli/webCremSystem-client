import React from "react";
import {
  Table,
  Card,
  Form,
  Row,
  Col,
  Input,
  Button,
  Select,
  message,
  DatePicker,
  Pagination,
  Popover,
  Modal
} from "antd";
import { exportTableToExcel } from "utils/ExportExcel";
import math from "mathjs";
import { isAuth } from "utils/utils";
import moment from "moment";

import AddPlan from "../Resource/components/addPlan";
import AddFinance from "./addFinance";
import style from "./index.less";
import PageHeaderLayout from "../../../layouts/PageHeaderLayout";
import * as API from "./services";

const { Option } = Select;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const mathConfig = {
  number: "BigNumber",
  precision: 20
};
math.create(mathConfig, math.all);

const allAuthers = [
  { master: false },
  { medium: false },
  { charge: false },
  { sell: false },
  { finance: false }
];

export default Form.create()(
  class Customer extends React.Component {
    state = {
      visible: false,
      listData: [],
      current: 1,
      pageSize: 10,
      dataCount: 0,
      selectedRowKeys: [],
      editData: {},
      isAdd: false,
      isPay: 0,
      isBack: 0,
      visibleRemark: false,
      user: [],
      totalData: [],
      timeVisiable: false,
      time: ""
    };

    async componentDidMount() {
      const { current } = this.state;
      // 权限
      await this.getAuth();
      this.getPageData(current);

      const user = await API.getAllUserInfo();
      this.setState({ user });
    }

    getAuth = async () => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < allAuthers.length; i++) {
        let item = allAuthers[i];
        item = Object.keys(item);
        // eslint-disable-next-line no-await-in-loop
        const { tip } = await isAuth(item);
        if (tip) {
          allAuthers[i][item] = true;
        }
      }
    };

    onSelectChange = selectedRowKeys => {
      this.setState({
        selectedRowKeys: []
      });
      this.setState({ selectedRowKeys });
      this.handleSelectPay(selectedRowKeys);
    };

    handleCancel = () => {
      this.setState({ visible: false });
    };

    getPageData = pageIndex => {
      let searchData = localStorage.getItem("value");
      try {
        searchData = JSON.parse(searchData);
      } catch (error) {
        console.log("error", error);
      }

      let searchItem = "";
      if (searchData) {
        const keys = Object.keys(searchData);
        keys.forEach(item => {
          searchItem += `&${item}=${searchData[item]}`;
        });
      }
      if (searchData && searchData.createTime) {
        searchItem += `&startTime=${moment(searchData.createTime[0]).format(
          "YYYY-MM-DD"
        )}`;
        searchItem += `&endTime=${moment(searchData.createTime[1]).format(
          "YYYY-MM-DD"
        )}`;
      }
      if (searchData && searchData.backTime.length) {
        searchItem += `&backTimeStartTime=${moment(
          searchData.backTime[0]
        ).format("YYYY-MM-DD")}`;
        searchItem += `&backTimeEndTime=${moment(searchData.backTime[1]).format(
          "YYYY-MM-DD"
        )}`;
      }
      if (searchData && searchData.inTime.length) {
        searchItem += `&inTimeStartTime=${moment(searchData.inTime[0]).format(
          "YYYY-MM-DD"
        )}`;
        searchItem += `&inTimeEndTime=${moment(searchData.inTime[1]).format(
          "YYYY-MM-DD"
        )}`;
      }
      const userId = localStorage.getItem("id");
      if (userId) {
        searchItem += `&userId=${userId}`;
      }
      let tag = "";
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < allAuthers.length; i++) {
        if (allAuthers[i].master) {
          tag = "all";
          break;
        }
        if (allAuthers[i].charge) {
          tag = "dept";
          break;
        }
        if (allAuthers[i].sell) {
          tag = "self";
          break;
        }
        if (allAuthers[i].medium) {
          tag = "medium";
        }
      }
      searchItem += `&tag=${tag}`;
      API.getPlan(pageIndex, searchItem).then(listData => {
        const { selectedRowKeys } = this.state;
        this.handleSelectPay(selectedRowKeys);
        this.setState({ listData });
      });
      API.getPlanCount(searchItem).then(data => {
        const [{ count }] = data;
        this.setState({ dataCount: count });
      });

      API.getPlanAllSum(searchItem).then(totalData => {
        this.setState({ totalData });
      });
    };

    searchData = val => {
      console.log("val", val);
      const { current } = this.state;
      const { form } = this.props;
      form.validateFields((error, value) => {
        if (error) {
          return;
        }
        if (val && typeof val === "string") {
          // eslint-disable-next-line no-param-reassign
          value.order = val;
        }
        const valueString = JSON.stringify(value);
        window.localStorage.setItem("value", valueString);
        this.getPageData(current);
        this.setState({
          current: 1,
          selectedRowKeys: []
        });
      });
    };

    handleFormReset = () => {
      const { form } = this.props;
      const { current } = this.state;
      form.resetFields();
      window.localStorage.setItem("value", "");
      this.getPageData(current);
    };

    deleteData = () => {
      const { selectedRowKeys, isMaster } = this.state;

      const deleteHandel = () => {
        if (selectedRowKeys.length > 0) {
          const id = selectedRowKeys[0];
          const { listData } = this.state;
          const data = listData.filter(item => item.id === id)[0];
          if (data.isBack === 1 || data.isPay === 1) {
            if (!isMaster) {
              message.error("您无权删除");
              return false;
            }
          }

          const body = {
            ids: selectedRowKeys,
            isDelete: 1
          };
          API.deletePlan(body)
            .then(({ tip }) => {
              const { current } = this.state;
              console.log("tip", tip);
              message.success(tip);
              this.getPageData(current);
              this.setState({ selectedRowKeys: [] });
            })
            .catch(() => this.setState({ selectedRowKeys: [] }));
        } else {
          message.error("请选中相应的数据进行操作");
        }
      };

      confirm({
        title: "删除",
        content: "确认要删除吗？",
        onOk: () => {
          deleteHandel();
        },
        onCancel: () => {
          this.setState({ selectedRowKeys: [] });
        }
      });
    };

    updatePlan = type => {
      const {
        selectedRowKeys,
        listData,
        time,
        isPay,
        isBack,
        current
      } = this.state;
      let title = "";
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < selectedRowKeys.length; i++) {
        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < listData.length; j++) {
          if (selectedRowKeys[i] === listData[j].id) {
            if (title) {
              if (title !== listData[j].customerName) {
                message.error("请选择同一客户操作");
                return;
              }
            } else {
              title = listData[j].customerName;
            }
          }
        }
      }
      let url = "";
      const body = { ids: selectedRowKeys };
      if (type === "pay") {
        body.type = isPay;
        url = "updatePlanPay";
      }
      if (type === "back") {
        if (!time && isBack !== 1) {
          message.error("请选择回款时间");
          return false;
        }
        url = "updatePlanBack";
        body.type = isBack;
        body.backTime = time;
      }
      console.log("url", url);
      API.updatePlan(url, body).then(({ tip }) => {
        message.success(tip);
        this.getPageData(current);
        this.setState({ timeVisiable: false });
      });
    };

    updatePlanBack = type => {
      if (type === 1) {
        this.updatePlan("back");
      } else {
        this.setState({ timeVisiable: true });
      }
    };

    updatePlanPay = () => {
      this.updatePlan("pay");
    };

    getOneUser = async () => {
      const { selectedRowKeys } = this.state;
      const [rowKeys] = selectedRowKeys;
      const editData = await API.getOnePlan(rowKeys);
      editData[0].inTime = moment.unix(editData[0].inTime);
      this.setState({
        editData,
        isAdd: false
      });
    };

    changePageData = page => {
      const { form } = this.props;
      form.validateFields((error, value) => {
        this.getPageData(page, value);
      });
      this.setState({
        current: page,
        selectedRowKeys: []
      });
    };

    addFinanceFunction = async () => {
      const { selectedRowKeys } = this.state;
      if (selectedRowKeys.length === 0) {
        message.error("请选中数据再进行操作");
        return false;
      }

      if (selectedRowKeys.length > 1) {
        message.error("一次只允许处理一条数据");
        return false;
      }

      await this.getOneUser();
      this.setState({
        visibleRemark: true
      });
    };

    modify = async () => {
      const { selectedRowKeys, isMaster, listData } = this.state;
      if (selectedRowKeys.length === 0) {
        message.error("请选中数据再进行操作");
        return false;
      }

      if (selectedRowKeys.length > 1) {
        message.error("一次只允许处理一条数据");
        return false;
      }

      const data = selectedRowKeys[0];
      const filterData = listData.filter(item => item.id === data);
      if (filterData[0].isBack === 1 || filterData[0].isPay === 1) {
        if (!isMaster) {
          message.error("您无权修改");
          return false;
        }
      }

      await this.getOneUser();
      this.setState({
        visible: true
      });
    };

    toExport = () => {
      const { history } = this.props;
      history.push("/exportAll");
    };

    showModal = () => {
      this.setState({ visible: true });
    };

    exportExcel = () => {
      exportTableToExcel("tables");
    };

    closeModel = () => {
      this.setState({ visibleRemark: false });
    };

    onTimerChange = (date, time) => {
      this.setState({ time });
    };

    handleSelectPay = selectedRowKeys => {
      const { listData } = this.state;
      const index = listData.findIndex(val => val.id === selectedRowKeys[0]);
      if (index !== -1) {
        const item = listData[index];
        this.setState({
          isPay: item.isPay
        });
        this.setState({
          isBack: item.isBack
        });
      }
    };

    buttonArea() {
      let isMaster = false;
      let isFinance = false;
      allAuthers.forEach(item => {
        if (item.master || item.charge || item.sell) {
          isMaster = true;
        }
        if (item.master || item.finance) {
          isFinance = true;
        }
      });
      const { isBack, isPay } = this.state;

      return (
        <div style={{ marginBottom: "10px" }}>
          {isMaster && (
            <span>
              <Button type="primary" onClick={this.modify}>
                修改
              </Button>
              <Button type="primary" onClick={this.deleteData}>
                删除
              </Button>
            </span>
          )}
          <Button type="primary" onClick={this.exportExcel}>
            导出EXCEL
          </Button>
          {isFinance && (
            <span>
              <Button
                type="primary"
                onClick={() => this.updatePlanBack(isBack)}
              >
                {isBack === 1 ? "撤销回款" : "勾选回款"}
              </Button>
              <Button type="primary" onClick={this.updatePlanPay}>
                {isPay === 1 ? "撤销支付" : "勾选支付"}
              </Button>
              <Button type="primary" onClick={this.addFinanceFunction}>
                财务备注
              </Button>
              <Button type="primary" onClick={this.toExport}>
                导出所有排期
              </Button>
            </span>
          )}
        </div>
      );
    }

    searchArea() {
      const {
        form: { getFieldDecorator }
      } = this.props;
      const { user } = this.state;
      const options = user.map(d => <Option value={d.id}>{d.name}</Option>);
      const optionMedium = user.map(d => (
        <Option value={d.name}>{d.name}</Option>
      ));

      return (
        <Form>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="排期搜索">
                {getFieldDecorator("publicNumber", {
                  initialValue: ""
                })(
                  <Input
                    placeholder="可搜索id、客户、团长纯佣"
                    style={{ width: "90%" }}
                  />
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="选择排期人">
                {getFieldDecorator("planPeople", {
                  initialValue: ""
                })(
                  <Select style={{ width: "90%" }} placeholder="选择类型搜索">
                    {options}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="回款状态">
                {getFieldDecorator("isBack", {
                  initialValue: ""
                })(
                  <Select style={{ width: "90%" }} placeholder="选择类型搜索">
                    <Option value="0">未回款</Option>
                    <Option value="1">已回款</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="支付状态">
                {getFieldDecorator("isPay", {
                  initialValue: ""
                })(
                  <Select style={{ width: "90%" }} placeholder="选择类型搜索">
                    <Option value="0">未支付</Option>
                    <Option value="1">已支付</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="创建时间">
                {getFieldDecorator("createTime", {
                  initialValue: ""
                })(<RangePicker style={{ width: "90%" }} />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="备注">
                {getFieldDecorator("remark", {
                  initialValue: ""
                })(
                  <Input placeholder="输入备注搜索" style={{ width: "90%" }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="财务备注">
                {getFieldDecorator("financeReamrk", {
                  initialValue: ""
                })(
                  <Input
                    placeholder="输入财务备注搜索"
                    style={{ width: "90%" }}
                  />
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="回款时间">
                {getFieldDecorator("backTime", {
                  initialValue: ""
                })(<RangePicker style={{ width: "90%" }} />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="投放时间">
                {getFieldDecorator("inTime", {
                  initialValue: ""
                })(<RangePicker style={{ width: "90%" }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="排序">
                {getFieldDecorator("order", {
                  initialValue: ""
                })(
                  <Select
                    style={{ width: "90%" }}
                    onSelect={val => this.searchData(val)}
                  >
                    <Option value="inTime">投放时间</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="媒介">
                {getFieldDecorator("medium", {
                  initialValue: ""
                })(<Select style={{ width: "90%" }}>{optionMedium}</Select>)}
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
                查询
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={this.handleFormReset}
              >
                重置
              </Button>
            </span>
          </div>
        </Form>
      );
    }

    render() {
      const {
        selectedRowKeys,
        totalData,
        timeVisiable,
        visibleRemark,
        listData,
        editData,
        isAdd,
        current,
        dataCount,
        visible
      } = this.state;
      const { price, cost, profit } = totalData;

      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange
      };

      // 备注  财务备注  创建时间  是否回款  是否支付  排期人   对应媒介

      const columns = [
        {
          title: "排期ID",
          dataIndex: "id",
          key: "id"
        },
        {
          title: "客户名称",
          dataIndex: "customerName",
          key: "customerName"
        },
        {
          title: "投放团长纯佣",
          dataIndex: "publicNumber",
          key: "publicNumber"
        },
        {
          title: "形式",
          dataIndex: "location",
          key: "location",
          render: location => {
            let tip = "视频";
            switch (location) {
              case "top":
                tip = "直发";
                break;
              case "second":
                tip = "转发";
                break;
              case "other":
                tip = "原创直发";
                break;
              case "last":
                tip = "视频";
                break;
              default:
                tip = "视频";
            }
            return <div>{tip}</div>;
          }
        },
        {
          title: "投放时间",
          dataIndex: "inTime",
          key: "inTime",
          render: time => {
            const showTime = moment.unix(time).format("YYYY-MM-DD");
            return <div>{showTime}</div>;
          }
        },
        {
          title: "报价",
          dataIndex: "price",
          key: "price"
        },
        {
          title: "成本价",
          dataIndex: "cost",
          key: "cost"
        },
        {
          title: "税款",
          dataIndex: "impost",
          key: "impost"
        },
        {
          title: "渠道税款",
          dataIndex: "channelImpost",
          key: "channelImpost"
        },
        {
          title: "返点",
          dataIndex: "rebate",
          key: "rebate"
        },
        {
          title: "利润",
          dataIndex: "profit",
          key: "profit",
          render: (text, cord) => {
            const profit = math.round(
              math.eval(
                cord.price -
                  cord.cost -
                  cord.impost +
                  cord.channelImpost -
                  cord.rebate
              ),
              2
            );
            return <div>{profit}</div>;
          }
        },
        {
          title: "备注",
          dataIndex: "remark",
          key: "remark"
        },
        {
          title: "财务备注",
          dataIndex: "financeReamrk",
          key: "financeReamrk",
          render: val => {
            const str = val || "";
            return (
              <Popover content={val}>
                {str.length > 10 ? `${str.substr(0, 10)}...` : str}
              </Popover>
            );
          }
        },
        {
          title: "创建时间",
          dataIndex: "createTime",
          key: "createTime",
          render: val => (
            <span>{moment(val).format("YYYY-MM-DD HH:mm:ss")}</span>
          )
        },
        {
          title: "回款时间",
          dataIndex: "backTime",
          key: "backTime",
          render: val => {
            if (Number(val))
              return <span>{moment(Number(val)).format("YYYY-MM-DD")}</span>;
            return <div />;
          }
        },
        {
          title: "是否回款",
          dataIndex: "isBack",
          key: "isBack",
          render: val => <span>{val === 0 ? "否" : "是"}</span>
        },
        {
          title: "是否支付",
          dataIndex: "isPay",
          key: "isPay",
          render: val => <span>{val === 0 ? "否" : "是"}</span>
        },
        {
          title: "排期人",
          dataIndex: "planPeople",
          key: "planPeople"
        },
        {
          title: "对应媒介",
          dataIndex: "medium",
          key: "medium"
        }
      ];

      return (
        <PageHeaderLayout title="团长纯佣排期">
          <Modal
            title="选择回款时间"
            visible={timeVisiable}
            onCancel={() => {
              this.setState({ timeVisiable: false });
            }}
            onOk={() => {
              this.updatePlan("back");
            }}
          >
            回款时间：
            <DatePicker allowClear onChange={this.onTimerChange} />
          </Modal>
          <Card bordered={false}>
            <div className={style.tableList}>
              <div className={style.tableListForm}>{this.searchArea()}</div>
              {visible && (
                <AddPlan
                  visible={visible}
                  editData={editData}
                  isAdd={isAdd}
                  onCancel={this.handleCancel}
                  getPageData={this.getPageData}
                />
              )}
              {visibleRemark && (
                <AddFinance
                  visibleRemark={visibleRemark}
                  onCancel={this.closeModel}
                  getPageData={this.getPageData}
                  editData={editData}
                  isAdd={isAdd}
                  current={current}
                  selectedRowKeys={selectedRowKeys[0]}
                />
              )}
              <div className={style.tableListOperator}>
                {this.buttonArea()}
                <div style={{ margin: "10px", color: "red" }}>
                  总报价:
                  {price} 总成本:
                  {cost} 总利润:
                  {profit}
                </div>
                <Table
                  id="tables"
                  rowSelection={rowSelection}
                  rowKey="id"
                  columns={columns}
                  dataSource={listData}
                  pagination={false}
                />
                <Pagination
                  style={{ marginTop: "10px" }}
                  current={current}
                  onChange={this.changePageData}
                  pageSize={10}
                  total={dataCount}
                />
              </div>
            </div>
          </Card>
        </PageHeaderLayout>
      );
    }
  }
);

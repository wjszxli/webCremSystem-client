/* eslint-disable comma-dangle */
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
  Pagination,
  Popover
} from "antd";
import { exportTableToExcel } from "utils/ExportExcel";
import XLSX from "xlsx";
import moment from "moment";
import { isAuth } from "utils/utils";
import AddPlan from "./components/addPlan";
import AddStart from "./components/addStart";
import Modify from "./components/modify";
import * as API from "./services";
import PageHeaderLayout from "../../../layouts/PageHeaderLayout";
import style from "./index.less";

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
const allAuthers = [
  { master: false },
  { medium: false },
  { charge: false },
  { sell: false }
];
const optionsData = [
  "运动健身",
  "财经投资",
  "萌宠美食",
  "美妆",
  "科技数码",
  "生活",
  "游戏汽车",
  "母婴亲子",
  "旅行",
  "教育培训",
  "情感",
  "影视娱乐",
  "家居家装",
  "二次元",
  "其他"
];

const optionsType = optionsData.map(value => (
  <Option key={value}>{value}</Option>
));

export default Form.create()(
  class Resource extends React.Component {
    state = {
      operation: "add",
      listData: [],
      current: 1,
      pageSize: 10,
      dataCount: 0,
      visible: false,
      editData: {},
      isAdd: "add",
      selectedRowKeys: [],
      selectId: "",
      visibleRemark: false,
      actionUrl: "",
      isShowStart: false,
      isShowModify: false,
      id: "",
      user: []
    };

    async componentDidMount() {
      const { form } = this.props;

      await this.getAuth();
      form.validateFields((error, value) => {
        this.getPageData(1, value);
      });
      const user = await API.getAllUserInfo();
      this.setState({ user });
    }

    // 权限处理
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

    handleFormReset = () => {
      const { form } = this.props;
      form.resetFields();
      this.getPageData(1);
    };

    closeModel = () => {
      this.setState({ visibleRemark: false });
    };

    getPageData = (pageIndex, searchData) => {
      let searchItem = "";
      if (searchData) {
        const keys = Object.keys(searchData);
        keys.forEach(item => {
          searchItem += `&${item}=${searchData[item]}`;
        });
      }
      const userId = localStorage.getItem("id") || "";
      searchItem += `&userId=${userId}`;

      const flag = allAuthers.some(item => Object.values(item)[0]);
      const tag = flag ? "all" : "";
      searchItem += `&tag=${tag}`;

      API.getPlayData(pageIndex, searchItem).then(({ listData, dataCount }) => {
        this.setState({ listData, dataCount });
      });
    };

    getOnePlay = async () => {
      const { selectedRowKeys, listData } = this.state;
      if (selectedRowKeys.length === 0) {
        message.error("请选中数据进行操作");
        return;
      }
      if (selectedRowKeys.length !== 1) {
        message.error("只允许一次修改一条数据");
        return;
      }
      const { id } = listData[selectedRowKeys[0]];
      const editData = await API.getOnePlayData(id);
      this.setState({
        editData,
        isAdd: false
      });
    };

    fixdata = data => {
      let o = "";
      let l = 0;
      const w = 10240;
      // eslint-disable-next-line no-plusplus
      for (; l < data.byteLength / w; ++l)
        o += String.fromCharCode.apply(
          null,
          new Uint8Array(data.slice(l * w, l * w + w))
        );
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
      return o;
    };

    generateDate = ({ header, results }) => {
      const { operation } = this.state;
      let val = "";
      header.forEach(item => {
        val = item.replace(/(^\s*)|(\s*$)/g, "");
      });
      results.forEach(item => {
        const data = {
          operation
        };
        Object.keys(item).forEach(value => {
          const oldVal = value;
          val = value.replace(/(^\s*)|(\s*$)/g, "");
          switch (val) {
            case "ID":
              data.dataId = item[oldVal].replace(/\s+/g, "");
              break;
            case "达人名称":
              data.name = item[oldVal].replace(/\s+/g, "");
              break;
            case "粉丝数":
              data.star = item[oldVal].replace(/\s+/g, "");
              break;
            case "平台":
              data.platform = item[oldVal].replace(/\s+/g, "");
              break;
            case "QS价格":
              data.topCost = item[oldVal].replace(/\s+/g, "");
              break;
            case "返点":
              data.secondTitle = item[oldVal].replace(/\s+/g, "");
              break;
            case "佣金":
              data.secondCost = item[oldVal].replace(/\s+/g, "");
              break;
            case "是否挂车":
              data.brush = item[oldVal].replace(/\s+/g, "");
              break;
            case "类型":
              data.type = item[oldVal].replace(/\s+/g, "");
              break;
            case "备注":
              data.remark = item[oldVal].replace(/\s+/g, "");
              break;
            default:
          }
        });
        data.newTime = new Date().getTime();
        const updateRouter = localStorage.getItem("name");
        const userId = localStorage.getItem("id");
        if (updateRouter) {
          data.updateRouter = updateRouter;
        }
        if (userId) {
          data.userId = userId;
        }
        console.log("data", data);
        API.savePlay(data).then(({ tip }) => {
          message.success(tip);
        });
      });
    };

    getHeaderRow = sheet => {
      const headers = [];
      const range = XLSX.utils.decode_range(sheet["!ref"]);
      let C;
      const R = range.s.r; /* start in the first row */
      // eslint-disable-next-line no-plusplus
      for (C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell =
          sheet[
            XLSX.utils.encode_cell({ c: C, r: R })
          ]; /* find the cell in the first row */
        let hdr = `UNKNOWN ${C}`; // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
        headers.push(hdr);
      }
      return headers;
    };

    upload = rawFile => {
      this.refs.upload.value = null;

      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
          const data = e.target.result;
          const fixedData = this.fixdata(data);
          const workbook = XLSX.read(btoa(fixedData), { type: "base64" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const header = this.getHeaderRow(worksheet);
          const results = XLSX.utils.sheet_to_json(worksheet);
          this.generateDate({ header, results });
          resolve();
        };
        reader.readAsArrayBuffer(rawFile);
      });
    };

    handleUpload = () => {
      this.setState({
        operation: "add"
      });
      document.getElementById("excel-upload-input").click();
    };

    searchData = val => {
      const { form } = this.props;
      form.validateFields((error, value) => {
        if (error) {
          return;
        }
        if (val && typeof val === "string") {
          // eslint-disable-next-line no-param-reassign
          value.order = val;
        }
        this.getPageData(1, value);
        this.setState({
          current: 1,
          selectedRowKeys: []
        });
      });
    };

    handleUploadUpdate = () => {
      this.setState({
        operation: "update"
      });
      document.getElementById("excel-upload-input").click();
    };

    handleClick = e => {
      const {
        target: { files }
      } = e;
      const rawFile = files[0]; // only use files[0]
      if (!rawFile) return;
      this.upload(rawFile);
    };

    excelTable = () => {
      exportTableToExcel("tables");
    };

    // 添加排期
    addData = () => {
      const { selectedRowKeys, listData } = this.state;
      if (!selectedRowKeys.length) {
        message.error("请选择对应的短视频添加排期");
        return;
      }
      if (selectedRowKeys.length > 1) {
        message.error("一次只允许对一个短视频添加排期");
        return;
      }
      this.setState({
        visible: true,
        isAdd: true,
        selectId: listData[selectedRowKeys].id
      });
    };

    // 更新资源
    showModify = async () => {
      const { selectedRowKeys, listData } = this.state;
      if (!selectedRowKeys.length) {
        message.error("请选择对应的短视频");
        return;
      }
      if (selectedRowKeys.length > 1) {
        message.error("一次只允许对一个短视频操作");
        return;
      }
      await this.getOnePlay();
      const { id } = listData[selectedRowKeys[0]];

      this.setState({
        isShowModify: true,
        id
      });
    };

    // 删除短视频
    deletePlay = async () => {
      const { selectedRowKeys, listData } = this.state;
      if (!selectedRowKeys.length) {
        message.error("请选择对应的短视频");
        return;
      }
      if (selectedRowKeys.length > 1) {
        message.error("一次只允许对一个短视频操作");
        return;
      }
      const { id } = listData[selectedRowKeys[0]];
      const { tip } = await API.deletePlay(id);
      if (tip) {
        message.success(tip);
        this.getPageData(1);
        this.setState({
          selectedRowKeys: []
        });
      }
    };

    closeModify = () => {
      this.setState({
        isShowModify: false
      });
    };

    handleCancel = () => {
      this.setState({ visible: false });
    };

    onSelectChange = selectedRowKeys => {
      this.setState({ selectedRowKeys });
    };

    changePageData = page => {
      const { form } = this.props;
      this.setState({
        current: page
      });
      form.validateFields((error, value) => {
        this.getPageData(page, value);
      });
    };

    startClose = () => {
      this.setState({
        isShowStart: false
      });
    };

    buttonArea() {
      const { actionUrl } = this.state;
      const props = {
        name: "file",
        action: actionUrl,
        headers: {
          authorization: "authorization-text"
        },
        onChange(info) {
          if (info.file.status === "done") {
            message.success("粉丝属性上传成功");
          } else if (info.file.status === "error") {
            message.error("粉丝属性上传失败");
          }
        }
      };
      const isAuthFlag = allAuthers.some(item => Object.values(item)[0]);

      return (
        <div style={{ marginBottom: "10px" }}>
          {isAuthFlag && (
            <span>
              <Button type="primary" onClick={this.addData}>
                添加排期
              </Button>
              <Button type="primary" onClick={this.excelTable}>
                导出EXCEL
              </Button>
              <Button type="primary" onClick={this.handleUpload}>
                上传新资源
              </Button>
              <Button type="primary" onClick={this.showModify}>
                更新资源
              </Button>
              <Button type="primary" onClick={this.deletePlay}>
                删除
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
      const options = user.map(d => <Option value={d.name}>{d.name}</Option>);

      return (
        <Form>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="达人名称">
                {getFieldDecorator("publicNumber", {
                  initialValue: ""
                })(
                  <Input
                    placeholder="输入达人名称搜索"
                    style={{ width: "90%" }}
                  />
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="类型">
                {getFieldDecorator("type", {
                  initialValue: ""
                })(
                  <Select style={{ width: "90%" }} placeholder="选择类型搜索">
                    {optionsType}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="粉丝区间">
                <InputGroup compact>
                  {getFieldDecorator("starS", {
                    initialValue: ""
                  })(
                    <Input
                      style={{ width: 80, textAlign: "center" }}
                      placeholder=""
                    />
                  )}
                  <Input
                    style={{
                      width: 30,
                      borderLeft: 0,
                      pointerEvents: "none",
                      backgroundColor: "#fff"
                    }}
                    placeholder="~"
                    disabled
                  />
                  {getFieldDecorator("starE", {
                    initialValue: ""
                  })(
                    <Input
                      style={{ width: 80, textAlign: "center", borderLeft: 0 }}
                      placeholder=""
                    />
                  )}
                </InputGroup>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="价格区间">
                <InputGroup compact>
                  {getFieldDecorator("priceS", {
                    initialValue: ""
                  })(
                    <Input
                      style={{ width: 80, textAlign: "center" }}
                      placeholder="最低价"
                    />
                  )}
                  <Input
                    style={{
                      width: 30,
                      borderLeft: 0,
                      pointerEvents: "none",
                      backgroundColor: "#fff"
                    }}
                    placeholder="~"
                    disabled
                  />
                  {getFieldDecorator("priceE", {
                    initialValue: ""
                  })(
                    <Input
                      style={{ width: 80, textAlign: "center", borderLeft: 0 }}
                      placeholder="最高价"
                    />
                  )}
                </InputGroup>
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="挂车">
                {getFieldDecorator("brush", {
                  initialValue: ""
                })(
                  <Select style={{ width: "90%" }} placeholder="选择搜索">
                    <Option value="是">是</Option>
                    <Option value="否">否</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="平台">
                {getFieldDecorator("platform", {
                  initialValue: ""
                })(
                  <Select style={{ width: "90%" }} placeholder="选择平台搜索">
                    <Option value="抖音">抖音</Option>
                    <Option value="快手">快手</Option>
                    <Option value="淘宝">淘宝</Option>
                    <Option value="小红书">小红书</Option>
                    <Option value="B站">B站</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              {/* <FormItem label="平台">
                {getFieldDecorator('platform', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择平台搜索">
                    <Option value="抖音">抖音</Option>
                    <Option value="快手">快手</Option>
                    <Option value="淘宝">淘宝</Option>
                    <Option value="小红书">小红书</Option>
                  </Select>
                )}
              </FormItem> */}
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="排序">
                {getFieldDecorator("order", {
                  initialValue: ""
                })(
                  <Select style={{ width: "90%" }} placeholder="选择刷号搜索">
                    {/* <Option value="topCost">混播坑位费排序</Option> */}
                    <Option value="star">粉丝数排序</Option>
                    <Option value="planCount">排期次数排序</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="更新渠道">
                {getFieldDecorator("updateRouter", {
                  initialValue: ""
                })(
                  <Select style={{ width: "90%" }} placeholder="选择更新渠道">
                    {options}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="备注">
                {getFieldDecorator("remark", {
                  initialValue: ""
                })(<Input placeholder="输入备注搜索" />)}
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
      const columns = [
        { title: "平台", dataIndex: "platform", key: "platform" },
        { title: "达人名称", dataIndex: "name", key: "name" },
        { title: "ID", dataIndex: "dataId", key: "dataId" },
        { title: "粉丝数", dataIndex: "star", key: "star" },
        // { title: "直发刊例", dataIndex: "topTitle", key: "topTitle" },
        { title: "QS价格", dataIndex: "topCost", key: "topCost" },
        { title: "返点", dataIndex: "secondTitle", key: "secondTitle" },
        { title: "佣金", dataIndex: "secondCost", key: "secondCost" },
        { title: "排期次数", dataIndex: "planCount", key: "planCount" },
        { title: "是否挂车", dataIndex: "brush", key: "brush" },
        { title: "类型", dataIndex: "type", key: "type" },
        {
          title: "录入时间",
          dataIndex: "newTime",
          key: "newTime",
          render: val => (
            <span>
              {Number(val)
                ? moment(Number(val)).format("YYYY-MM-DD HH:mm:ss")
                : ""}
            </span>
          )
        },
        {
          title: "更新时间",
          dataIndex: "updateTime",
          key: "updateTime",
          render: val => (
            <span>{moment(val).format("YYYY-MM-DD HH:mm:ss")}</span>
          )
        },
        { title: "更新渠道", dataIndex: "updateRouter", key: "updateRouter" },
        {
          title: "备注",
          dataIndex: "remark",
          key: "remark",
          render: val => {
            const str = val || "";
            return (
              <Popover content={val}>
                {str.length > 20 ? `${str.substr(0, 20)}...` : str}
              </Popover>
            );
          }
        }
      ];

      const {
        selectedRowKeys,
        visible,
        editData,
        isAdd,
        listData,
        current,
        visibleRemark,
        dataCount,
        isShowModify,
        id,
        isShowStart
      } = this.state;
      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange
      };

      return (
        <PageHeaderLayout title="短视频资源库">
          {visible && (
            <AddPlan
              visible={visible}
              editData={editData}
              isAdd={isAdd}
              onCancel={this.handleCancel}
              getPageData={this.getPageData}
              selectedRowKeys={selectedRowKeys}
              listData={listData}
              current={current}
            />
          )}
          {isShowStart && (
            <AddStart
              id={id}
              editData={editData}
              onCancel={this.startClose}
              isShowStart={isShowStart}
            />
          )}
          {isShowModify && (
            <Modify
              visible={isShowModify}
              editData={editData}
              isAdd={isAdd}
              onCancel={this.closeModify}
              current={current}
              getPageData={this.getPageData}
              id={id}
            />
          )}

          <Card bordered={false}>
            <div className={style.tableList}>
              <div className={style.tableListForm}>{this.searchArea()}</div>
              <div className={style.tableListOperator}>
                <input
                  id="excel-upload-input"
                  style={{ display: "none" }}
                  ref="upload"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={this.handleClick}
                />
                {this.buttonArea()}
                <Table
                  id="tables"
                  rowSelection={rowSelection}
                  className="components-table-demo-nested"
                  columns={columns}
                  pagination={false}
                  dataSource={listData}
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

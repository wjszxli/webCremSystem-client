/* eslint-disable no-param-reassign */
import React from 'react';
import { Table, Card, Form, Row, Col, Input, Button, Select, message, DatePicker, Pagination } from 'antd';
import { exportTableToExcel } from 'utils/ExportExcel'

import moment from 'moment'

import request from 'utils/request'
import config from 'utils/config'
import AddPlan from '../Resource/components/addPlan'
import style from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select

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
    };

    componentDidMount() {
      this.getPageData(1)
    }

    onSelectChange = (selectedRowKeys) => {
      this.setState({ selectedRowKeys });
    }

    handleCancel = () => {
      this.setState({ visible: false });
    }

    handleFormReset = () => {
      const { form } = this.props;
      form.resetFields()
      this.getPageData(1)
    }

    getPageData = (pageIndex, searchData) => {
      let searchItem = ""
      if (searchData) {
        const keys = Object.keys(searchData)
        keys.forEach(item => {
          searchItem += `&${item}=${searchData[item]}`
        })
      }
      // 获取分页的数据
      let url = `${config.apiUrl}/getPlan?pageSize=10&tag=all&isDelete=1&model=2&pageIndex=${pageIndex}${searchItem}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              listData: res.data,
            })
          } else {
            message.error(res.error);
          }
        }
      })
      // 获取数据条数
      url = `${config.apiUrl}/getPlanCount?isDelete=1&model=2&tag=all${searchItem}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              dataCount: res.data[0].count,
            })
          } else {
            message.error(res.error);
          }
        }
      })
    }

    searchData = () => {
      const { form } = this.props
      form.validateFields((error, value) => {
        if (error) {
          return
        }
        if (value.createTime) {
          value.startTime = moment(value.createTime[0]).format('YYYY-MM-DD')
          value.endTime = moment(value.createTime[1]).format('YYYY-MM-DD')
        }
        this.getPageData(1, value)
      })
    }

    deleteData = () => {
      const { selectedRowKeys } = this.state
      if (selectedRowKeys.length > 0) {
        const url = `${config.apiUrl}/deletePlan`
        const options = {
          method: 'POST',
          body: {
            ids: selectedRowKeys,
            isDelete: 1,
          },
        }
        request(url, options).then(res => {
          if (res) {
            if (res.code === 0) {
              message.success(res.data.tip);
              this.getPageData(1)
            } else {
              message.error(res.error);
            }
          }
        })
      } else {
        message.error('请选中相应的数据进行操作')
      }
    }

    updatePlan = (type) => {
      const { selectedRowKeys } = this.state
      if (selectedRowKeys.length > 0) {
        let url = ''
        if (type === 'pay') {
          url = `${config.apiUrl}/updatePlanPay`
        }
        if (type === 'back') {
          url = `${config.apiUrl}/updatePlanBack`
        }
        const options = {
          method: 'POST',
          body: {
            ids: selectedRowKeys,
          },
        }
        request(url, options).then(res => {
          if (res) {
            if (res.code === 0) {
              message.success(res.data.tip);
              this.getPageData(1)
            } else {
              message.error(res.error);
            }
          }
        })
      } else {
        message.error('请选中相应的数据进行操作')
      }
    }

    updatePlanBack = () => {
      this.updatePlan('back')
    }

    updatePlanPay = () => {
      this.updatePlan('pay')
    }

    getOneUser = () => {
      const { selectedRowKeys } = this.state
      if (selectedRowKeys.length === 0) {
        message.error('请选中数据进行操作')
        return
      }
      if (selectedRowKeys.length !== 1) {
        message.error('只允许一次修改一条数据')
        return
      }
      const url = `${config.apiUrl}/getOnePlan?id=${selectedRowKeys[0]}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            if (res.data[0].inTime) {
              res.data[0].inTime = moment.unix(res.data[0].inTime)
            }
            this.setState({
              editData: res.data,
              visible: true,
              isAdd: false,
            })
          } else {
            message.error(res.error);
          }
        }
      })
    }

    showModal = () => {
      this.setState({ visible: true });
    };

    exportExcel = () => {
      exportTableToExcel('tables')
    }

    changePageData = (page) => {
      this.setState({
        current: page,
      });
      this.getPageData(page)
    }

    searchArea() {
      const { form: { getFieldDecorator } } = this.props;

      return (
        <Form>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="排期搜索">
                {getFieldDecorator('publicNumber', {
                  initialValue: '',
                })(<Input placeholder="可搜索id、客户、公众号" style={{ width: '90%' }} />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="选择排期人">
                {getFieldDecorator('planPeople', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择类型搜索">
                    <Option value="管理员">管理员</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="回款状态">
                {getFieldDecorator('isBack', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择类型搜索">
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
                {getFieldDecorator('isPay', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择类型搜索">
                    <Option value="0">未支付</Option>
                    <Option value="1">已支付</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="创建时间">
                {getFieldDecorator('createTime', {
                  initialValue: '',
                })(
                  <RangePicker style={{ width: '90%' }} />
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="备注">
                {getFieldDecorator('remark', {
                  initialValue: '',
                })(
                  <Input placeholder="输入备注搜索" style={{ width: '90%' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ float: 'right', marginBottom: 24 }}>
              <Button type="primary" htmlType="submit" onClick={this.searchData}>
                查询
              </Button>
              <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </div>
        </Form>
      );
    }

    render() {

      const columns = [
        {
          title: '排期ID',
          dataIndex: 'id',
          key: 'id',
        },
        {
          title: '客户名称',
          dataIndex: 'customerName',
          key: 'customerName',
        },
        {
          title: '投放公众号',
          dataIndex: 'publicNumber',
          key: 'publicNumber',
        },
        {
          title: '位置',
          dataIndex: 'location',
          key: 'location',
          render: location => {
            let tip = '其他'
            switch (location) {
              case 'top':
                tip = '头条'
                break;
              case 'second':
                tip = '次条'
                break;
              case 'other':
                tip = '其他条'
                break;
              case 'last':
                tip = '末条'
                break;
              default:
                tip = ''
                break;
            }
            return (
              <div>{tip}</div>
            )
          },
        },
        {
          title: '投放时间',
          dataIndex: 'inTime',
          key: 'inTime',
          render: time => {
            const showTime = moment.unix(time).format('YYYY-MM-DD')
            return (
              <div>{showTime}</div>
            )
          },
        },
        {
          title: '报价',
          dataIndex: 'price',
          key: 'price',
        },
        {
          title: '成本价',
          dataIndex: 'cost',
          key: 'cost',
        },
        {
          title: '税款',
          dataIndex: 'isInvoiceClient',
          key: 'isInvoiceClient',
        },
        {
          title: '渠道税款',
          dataIndex: 'taxClient',
          key: 'taxClient',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          key: 'remark',
        },
        // {
        //   title: '财务备注',
        //   dataIndex: 'status',
        //   key: 'status',
        // },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
        {
          title: '是否回款',
          dataIndex: 'isBack',
          key: 'isBack',
          render: val => <span>{val === 0 ? '否' : '是'}</span>,
        },
        {
          title: '是否支付',
          dataIndex: 'isPay',
          key: 'isPay',
          render: val => <span>{val === 0 ? '否' : '是'}</span>,
        },
        {
          title: '排期人',
          dataIndex: 'planPeople',
          key: 'planPeople',
        },
        // {
        //   title: '跟进渠道',
        //   dataIndex: 'status',
        //   key: 'status',
        // },
      ];

      const { selectedRowKeys, visible, editData, isAdd, listData, current, dataCount } = this.state;

      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange,
      };

      return (
        <PageHeaderLayout title="公众号排期">
          <Card bordered={false}>
            <div className={style.tableList}>
              <div className={style.tableListForm}>{this.searchArea()}</div>
              {
                visible && (
                  <AddPlan
                    visible={visible}
                    editData={editData}
                    isAdd={isAdd}
                    onCancel={this.handleCancel}
                    getPageData={this.getPageData}
                  />
                )
              }
              <div className={style.tableListOperator}>
                <div style={{ marginBottom: '10px' }} />
                <Table id="tables" rowSelection={rowSelection} rowKey="id" columns={columns} dataSource={listData} pagination={false} />
                <Pagination style={{ marginTop: "10px" }} current={current} onChange={this.changePageData} pageSize={10} total={dataCount} />
              </div>
            </div>
          </Card>
        </PageHeaderLayout>
      );
    }
  })
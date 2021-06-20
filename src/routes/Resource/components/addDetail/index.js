import React from 'react';
import { Modal, Form, Input, message } from 'antd';

import { addInDetail } from '../../services'

const FormItem = Form.Item;
const { TextArea } = Input;

export default Form.create()(
  class extends React.Component {

    componentDidMount() {
      const { isAdd, form, editData } = this.props
      if (!isAdd) {
        form.setFieldsValue(editData[0])
      }
    }

    onCreate = async () => {
      const { form, editData, getPageData, onCancel, form: { resetFields } } = this.props

      form.validateFields((error, value) => {
        if (error) {
          message.error(error)
          return
        }
        if (editData.length) {
          const [{ id }] = editData
          value.id = id
          addInDetail(value).then(({ tip }) => {
            message.success(tip)
            getPageData(1)
            onCancel()
            resetFields();
          }).catch(err => message.error(err))
        }
      })
    }

    render() {
      const { visibleRemark, onCancel, form: { getFieldDecorator } } = this.props;

      return (
        <Modal
          visible={visibleRemark}
          maskClosable={false}
          title="投入详情"
          okText="保存投入详情"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
          <Form className="ant-advanced-search-form">
            <FormItem label="投入详情">
              {getFieldDecorator('inDetail', {
                initialValue: '',
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '输入投入详情',
                }],
              })(
                <TextArea placeholder="输入投入详情" rows={8} />
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);

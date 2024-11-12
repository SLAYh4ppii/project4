import React from 'react';
import { Modal, Button, Form, Input } from 'antd';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

interface AddJobModalProps {
  visible: boolean;
  close: () => void;
}

interface JobFormData {
  title: string;
  location: string;
  description: string;
}

export default function AddJobModal({ visible, close }: AddJobModalProps) {
  const [form] = Form.useForm<JobFormData>();

  async function handleSubmit(values: JobFormData) {
    await fetch('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    form.resetFields();
    close();
  }

  return (
    <Modal
      visible={visible}
      title="New Job Listing"
      onOk={close}
      onCancel={close}
      footer={null}
      width={600}
      centered
      forceRender
    >
      <Form
        form={form}
        {...layout}
        name="add-job"
        onFinish={handleSubmit}
        hideRequiredMark
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="location" label="Location" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={8} />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
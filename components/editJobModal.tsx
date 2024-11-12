import React, { useEffect } from 'react';
import { Modal, Button, Form, Input } from 'antd';
import { Job } from '@/types';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

interface EditJobModalProps {
  data: Job;
  visible: boolean;
  close: () => void;
}

interface JobFormData {
  title: string;
  location: string;
  description: string;
}

export default function EditJobModal({ data, visible, close }: EditJobModalProps) {
  const [form] = Form.useForm<JobFormData>();

  useEffect(() => {
    form.resetFields();
  }, [data, form]);

  async function handleSubmit(values: JobFormData) {
    await fetch('/api/jobs', {
      method: 'PUT',
      body: JSON.stringify({ ...values, id: data._id }),
    });
    close();
  }

  async function deleteListing() {
    await fetch('/api/jobs', {
      method: 'DELETE',
      body: JSON.stringify(data._id),
    });
    close();
  }

  return (
    <Modal
      open={visible}
      title={`Edit Listing: ${data.title}`}
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
        name="edit-job"
        onFinish={handleSubmit}
        hideRequiredMark
        initialValues={{
          title: data.title,
          location: data.location,
          description: data.description,
        }}
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
          <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
            Save
          </Button>
          <Button type="default" htmlType="button" onClick={deleteListing} danger>
            Delete
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
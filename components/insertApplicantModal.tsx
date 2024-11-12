import React from 'react';
import { Modal, Button, Form, Input, Spin, Select, Upload, message } from 'antd';
import useSWR from 'swr';
import homeStyle from '@/styles/Home.module.css';
import { Job } from '@/types';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a valid email!',
    number: 'Not a valid number!',
    url: 'Not a valid url!',
  },
};

interface InsertApplicantModalProps {
  visible: boolean;
  close: () => void;
}

interface ApplicantFormData {
  listing: string;
  name: string;
  email: string;
  cv: UploadFile[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
}

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export default function InsertApplicantModal({ visible, close }: InsertApplicantModalProps) {
  const [form] = Form.useForm<ApplicantFormData>();

  const { data: jobs, error } = useSWR<Job[]>('/api/jobs', async (url) => {
    const res = await fetch(url);
    return res.json();
  });

  async function handleSubmit(values: ApplicantFormData) {
    try {
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.error) {
        message.error(data.error);
        return;
      }

      message.success('Applicant added successfully');
      form.resetFields();
      close();
    } catch (error) {
      message.error('Failed to add applicant');
    }
  }

  const beforeUpload = (file: File) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('You can only upload PDF files!');
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
    }
    return isPDF && isLt10M;
  };

  if (error) return <div>Failed to load</div>;
  if (!jobs) {
    return (
      <div className={homeStyle.container}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Modal
      open={visible}
      title="Manual Applicant Insertion"
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
        name="insert-applicant"
        onFinish={handleSubmit}
        validateMessages={validateMessages}
      >
        <Form.Item name="listing" label="For Job Listing" rules={[{ required: true }]}>
          <Select placeholder="Select a option" showSearch>
            {jobs.map((job) => (
              <Select.Option key={job._id} value={job._id}>
                {job.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="cv"
          label="CV"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Please upload a PDF file' }]}
        >
          <Upload 
            name="file" 
            action="/api/cv" 
            accept=".pdf"
            beforeUpload={beforeUpload}
            maxCount={1}
            onChange={({ file }) => {
              if (file.status === 'done') {
                message.success(`${file.name} uploaded successfully`);
              } else if (file.status === 'error') {
                message.error(`${file.name} upload failed`);
              }
            }}
          >
            <Button icon={<UploadOutlined />}>Upload PDF</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="phone" label="Phone Number">
          <Input />
        </Form.Item>
        <Form.Item name="linkedin" label="LinkedIn" rules={[{ type: 'url' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="website" label="Website" rules={[{ type: 'url' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="introduction"
          label="Short Introduction"
          rules={[
            { max: 300, message: 'Your introduction cannot be longer than 300 characters!' },
            { type: 'string' },
          ]}
        >
          <Input.TextArea rows={8} />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
          <Button type="primary" htmlType="submit">
            Insert
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
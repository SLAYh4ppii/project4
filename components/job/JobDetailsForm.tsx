import { Form, Input, Button, Upload, message } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';

export interface ApplicantFormData {
  name: string;
  email: string;
  cv: UploadFile[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
  listing?: string;
}

interface JobDetailsFormProps {
  jobId: string;
  onSubmit: (values: ApplicantFormData) => Promise<void>;
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export default function JobDetailsForm({ jobId, onSubmit }: JobDetailsFormProps) {
  const [form] = Form.useForm<ApplicantFormData>();

  const handleSubmit = async (values: ApplicantFormData) => {
    try {
      values.listing = jobId;
      await onSubmit(values);
      form.resetFields();
      message.success('Your application has been submitted');
    } catch (error) {
      message.error('Failed to submit application');
    }
  };

  return (
    <Form
      form={form}
      {...layout}
      name="job-application"
      onFinish={handleSubmit}
    >
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="cv"
        label="CV"
        rules={[{ required: true }]}
      >
        <Upload name="file" action="/api/cv" accept=".pdf">
          <Button>Upload CV</Button>
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
        rules={[{ max: 300 }]}
      >
        <Input.TextArea rows={8} />
      </Form.Item>
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
        <Button type="primary" htmlType="submit">
          Submit Application
        </Button>
      </Form.Item>
    </Form>
  );
}
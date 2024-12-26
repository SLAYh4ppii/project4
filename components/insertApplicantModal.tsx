import { Modal, Form, Input, Upload, Button, message } from 'antd';

interface InsertApplicantModalProps {
  visible: boolean;
  close: () => void;
}

interface ApplicantFormData {
  listing: string;
  name: string;
  email: string;
  cv: string[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
}

export default function InsertApplicantModal({ visible, close }: InsertApplicantModalProps) {
  const [form] = Form.useForm<ApplicantFormData>();

  const handleSubmit = async (values: ApplicantFormData) => {
    try {
      await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      form.resetFields();
      close();
      message.success('Application submitted successfully');
    } catch (error) {
      message.error('Failed to submit application');
    }
  };

  return (
    <Modal
      open={visible}
      title="Add Applicant"
      onCancel={close}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="cv"
          label="CV"
          rules={[{ required: true }]}
        >
          <Upload>
            <Button>Upload CV</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
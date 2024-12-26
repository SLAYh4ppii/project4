import { useEffect } from 'react';
import { Modal, Form, Input, Rate, Select } from 'antd';
import { Applicant } from '@/types';
import { UpdateApplicantRequest } from '@/types/api';

interface ViewApplicantModalProps {
  visible: boolean;
  data: Applicant;
  close: () => void;
  pipeline: string[];
}

export default function ViewApplicantModal({ visible, data, close, pipeline }: ViewApplicantModalProps) {
  const [form] = Form.useForm<UpdateApplicantRequest>();

  useEffect(() => {
    form.setFieldsValue({
      id: data._id.toString(), // Convert ObjectId to string
      stage: data.stage,
      notes: data.notes,
      rating: data.rating,
    });
  }, [data, form]);

  const handleSubmit = async (values: UpdateApplicantRequest) => {
    try {
      await fetch('/api/applicants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      close();
    } catch (error) {
      console.error('Failed to update applicant:', error);
    }
  };

  return (
    <Modal
      open={visible}
      title={`View Applicant: ${data.name}`}
      onCancel={close}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item name="stage" label="Stage">
          <Select>
            {pipeline.map((stage) => (
              <Select.Option key={stage} value={stage}>
                {stage}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="rating" label="Rating">
          <Rate />
        </Form.Item>
      </Form>
    </Modal>
  );
}
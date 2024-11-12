import React, { useEffect } from 'react';
import { Modal, Descriptions, Form, Input, Button, Rate, Select } from 'antd';
import { saveAs } from 'file-saver';
import { Applicant } from '@/types';

interface ViewApplicantModalProps {
  visible: boolean;
  data: Applicant;
  close: () => void;
  pipeline: string[];
}

interface ApplicantFormData {
  stage: string;
  notes: string;
  rating: number;
}

export default function ViewApplicantModal({ visible, data, close, pipeline }: ViewApplicantModalProps) {
  const [form] = Form.useForm<ApplicantFormData>();

  useEffect(() => {
    form.resetFields();
  }, [data, form]);

  async function handleSubmit(values: ApplicantFormData) {
    await fetch('/api/applicants', {
      method: 'PUT',
      body: JSON.stringify({ ...values, id: data._id }),
    });
    close();
  }

  async function deleteApplicant() {
    await fetch('/api/applicants', {
      method: 'DELETE',
      body: JSON.stringify(data._id),
    });
    close();
  }

  async function downloadCV() {
    const res = await fetch(`/api/cv/${data.cv}`);
    const resJson = await res.json();
    const arr = new Uint8Array(resJson.file.data);
    const blob = new Blob([arr], { type: 'application/pdf' });
    saveAs(blob, 'cv.pdf');
  }

  return (
    <Modal
      open={visible}
      title={data.name}
      onOk={close}
      onCancel={close}
      footer={null}
      width={600}
      centered
      forceRender
    >
      <Form
        form={form}
        name="edit-applicant"
        onFinish={handleSubmit}
        hideRequiredMark
        initialValues={{
          stage: data.stage,
          notes: data.notes,
          rating: data.rating,
        }}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Stage">
            <Form.Item style={{ margin: 0 }} name="stage" required>
              <Select bordered={false}>
                {pipeline.map((stage) => (
                  <Select.Option key={stage} value={stage}>
                    {stage}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <a href={`mailto:${data.email}`}>{data.email}</a>
          </Descriptions.Item>
          <Descriptions.Item label="CV">
            <Button type="link" onClick={downloadCV} style={{ margin: 0, padding: 0 }}>
              Download
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {data.phone ? <a href={`tel:${data.phone}`}>{data.phone}</a> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="LinkedIn">
            {data.linkedin ? (
              <a href={data.linkedin} target="_blank" rel="noreferrer">
                {data.linkedin}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Website">
            {data.website ? (
              <a href={data.website} target="_blank" rel="noreferrer">
                {data.website}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Introduction">
            {data.introduction || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Notes">
            <Form.Item style={{ margin: 0 }} name="notes">
              <Input.TextArea bordered={false} style={{ padding: 0, margin: 0 }} />
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item label="Rating">
            <Form.Item style={{ margin: 0 }} name="rating">
              <Rate />
            </Form.Item>
          </Descriptions.Item>
        </Descriptions>
        <div style={{ textAlign: 'end', marginTop: '1rem' }}>
          <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
            Save
          </Button>
          <Button type="default" htmlType="button" onClick={deleteApplicant} danger>
            Delete
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
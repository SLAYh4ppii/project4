import React, { useEffect } from 'react';
import { Modal, Descriptions, Form, Input, Button, Rate, Select, message } from 'antd';
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
    try {
      await fetch('/api/applicants', {
        method: 'PUT',
        body: JSON.stringify({ ...values, id: data._id }),
      });
      close();
    } catch (error) {
      message.error('Failed to update applicant');
    }
  }

  async function deleteApplicant() {
    try {
      await fetch('/api/applicants', {
        method: 'DELETE',
        body: JSON.stringify(data._id),
      });
      close();
    } catch (error) {
      message.error('Failed to delete applicant');
    }
  }

  async function downloadCV() {
    try {
      console.log('[CV Download] Starting download process');
      console.log('[CV Download] CV ID:', data.cv);
      
      if (!data.cv) {
        console.log('[CV Download] No CV ID found');
        message.error('No CV file available');
        return;
      }

      message.loading({ content: 'Downloading CV...', key: 'cvDownload' });

      console.log('[CV Download] Fetching CV from API');
      const response = await fetch(`/api/cv/${encodeURIComponent(data.cv)}`);
      console.log('[CV Download] API Response status:', response.status);
      
      if (!response.ok) {
        console.log('[CV Download] API Response not OK:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('[CV Download] Converting response to blob');
      const blob = await response.blob();
      console.log('[CV Download] Blob size:', blob.size);
      console.log('[CV Download] Blob type:', blob.type);

      if (blob.size === 0) {
        console.log('[CV Download] Empty blob received');
        throw new Error('Received empty file');
      }

      const filename = `${data.name.replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf`;
      console.log('[CV Download] Generated filename:', filename);
      
      console.log('[CV Download] Initiating file save');
      saveAs(blob, filename);
      console.log('[CV Download] File save initiated');

      message.success({ content: 'CV downloaded successfully', key: 'cvDownload' });
    } catch (error) {
      console.error('[CV Download] Error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        cvId: data.cv,
        applicantId: data._id,
        applicantName: data.name
      });
      
      message.error({ 
        content: 'Failed to download CV. Please try again later.', 
        key: 'cvDownload' 
      });
    }
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
            <Button 
              type="link" 
              onClick={downloadCV} 
              style={{ margin: 0, padding: 0 }}
              disabled={!data.cv}
            >
              {data.cv ? 'Download' : 'No CV available'}
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
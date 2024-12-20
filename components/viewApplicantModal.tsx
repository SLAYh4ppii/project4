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

export default function ViewApplicantModal({ visible, data, close, pipeline }: ViewApplicantModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [data, form]);

  async function handleSubmit(values: any) {
    try {
      await fetch('/api/applicants', {
        method: 'PUT',
        body: JSON.stringify({ ...values, id: data._id }),
      });
      close();
    } catch (error) {
      console.error('Failed to update applicant:', error);
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
      console.error('Failed to delete applicant:', error);
      message.error('Failed to delete applicant');
    }
  }

  async function downloadCV() {
    const loadingKey = 'cvDownload';
    console.log('[CV Download] Starting download for:', {
      applicantId: data._id,
      applicantName: data.name,
      cvId: data.cv
    });

    try {
      if (!data.cv) {
        console.log('[CV Download] Error: No CV ID available');
        message.error('No CV file available');
        return;
      }

      message.loading({ content: 'Downloading CV...', key: loadingKey });
      console.log('[CV Download] Fetching CV file...');

      const response = await fetch(`/api/cv/${encodeURIComponent(data.cv)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download CV: ${response.statusText}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Received empty file');
      }

      const filename = `${data.name.replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf`;
      saveAs(blob, filename);
      
      message.success({ 
        content: 'CV downloaded successfully', 
        key: loadingKey,
        duration: 2 
      });
    } catch (error) {
      console.error('[CV Download] Error:', error);
      message.error({ 
        content: 'Failed to download CV. Please try again.',
        key: loadingKey,
        duration: 3
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
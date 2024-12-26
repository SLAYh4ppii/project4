import { Form, Input, Button, Upload, message } from 'antd';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { useState } from 'react';

interface ApplicationFormProps {
  jobId: string;
}

interface JobApplication {
  name: string;
  email: string;
  cv: UploadFile[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
}

export default function ApplicationForm({ jobId }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  const beforeUpload = (file: RcFile) => {
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

  const handleSubmit = async (values: JobApplication) => {
    try {
      setIsSubmitting(true);
      
      let cvFileName = '';
      if (values.cv?.[0]?.originFileObj) {
        const formData = new FormData();
        formData.append('file', values.cv[0].originFileObj);
        
        const uploadResponse = await fetch('/api/cv', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload CV');
        }
        
        const uploadData = await uploadResponse.json();
        cvFileName = uploadData.filename;
      }

      const applicationData = {
        ...values,
        cv: cvFileName,
        listing: jobId,
      };

      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      message.success('Application submitted successfully');
      form.resetFields();
      window.location.href = '/jobs';
    } catch (error) {
      console.error('Application submission error:', error);
      message.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      name="job-application"
      onFinish={handleSubmit}
      layout="vertical"
      disabled={isSubmitting}
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please enter your name' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="cv"
        label="CV"
        rules={[{ required: true, message: 'Please upload your CV' }]}
      >
        <Upload
          accept=".pdf"
          maxCount={1}
          beforeUpload={beforeUpload}
        >
          <Button>Upload CV (PDF only, max 10MB)</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        name="phone"
        label="Phone Number"
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="linkedin"
        label="LinkedIn URL"
        rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="website"
        label="Personal Website"
        rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="introduction"
        label="Short Introduction"
        rules={[{ max: 300, message: 'Maximum 300 characters' }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit"
          loading={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </Form.Item>
    </Form>
  );
}
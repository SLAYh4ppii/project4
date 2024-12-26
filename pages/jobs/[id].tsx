import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import styles from '../../styles/Home.module.css';
import listingStyles from '../../styles/ListingsPage.module.css';
import {
  Row,
  Col,
  Spin,
  Form,
  Input,
  Button,
  Divider,
  message,
  Upload,
} from 'antd';
import ReactMarkdown from 'react-markdown';
import { Job } from '@/types';
import type { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';

interface JobApplication {
  name: string;
  email: string;
  cv: UploadFile[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
}

export default function JobPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  const { data: job, error } = useSWR<Job>(
    id ? `/api/jobListing/${id}` : null
  );

  if (error) {
    return (
      <div className={styles.container}>
        <p>Failed to load job listing</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.container}>
        <Spin size="large" />
      </div>
    );
  }

  const handleSubmit = async (values: JobApplication) => {
    try {
      setIsSubmitting(true);
      
      // First upload the CV if provided
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
        cvFileName = uploadData.message;
      }

      // Then submit the application
      const applicationData = {
        ...values,
        cv: cvFileName,
        listing: id,
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
      router.push('/jobs');
    } catch (error) {
      console.error('Application submission error:', error);
      message.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{job.title} - Simple ATS</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className={styles.main}>
        <Row justify="center" align="top">
          <Col xs={24} lg={16}>
            <Link href="/jobs" className={listingStyles.button_s}>
              Back to Listings
            </Link>
            <Divider />
            <ReactMarkdown>{job.description}</ReactMarkdown>
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
                  beforeUpload={() => false}
                >
                  <Button>Upload CV</Button>
                </Upload>
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
          </Col>
        </Row>
      </main>
    </div>
  );
}
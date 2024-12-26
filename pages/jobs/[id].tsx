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

interface JobApplication {
  name: string;
  email: string;
  cv: UploadFile[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
  listing?: string;
}

export default function JobPage() {
  const router = useRouter();
  const { id } = router.query;

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
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, listing: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      message.success('Application submitted successfully');
      router.push('/jobs');
    } catch (error) {
      message.error('Failed to submit application');
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
              name="job-application"
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
                <Upload accept=".pdf">
                  <Button>Upload CV</Button>
                </Upload>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit Application
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </main>
    </div>
  );
}
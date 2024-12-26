import Head from 'next/head';
import { Row, Col } from 'antd';
import styles from '@/styles/Home.module.css';
import { Job } from '@/types';
import JobHeader from '@/components/job/JobHeader';
import JobDescription from '@/components/job/JobDescription';
import ApplicationForm from '@/components/job/ApplicationForm';

interface JobPageProps {
  job: Job | null;
}

export default function JobPage({ job }: JobPageProps) {
  if (!job) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Job Not Found - Simple ATS</title>
          <link rel="icon" href="/favicon.png" />
        </Head>
        <main className={styles.main}>
          <Row justify="center" align="top">
            <Col xs={24} lg={16}>
              <JobHeader />
              <p>This job listing could not be found.</p>
            </Col>
          </Row>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{job.title} - Simple ATS</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className={styles.main}>
        <Row justify="center" align="top">
          <Col xs={24} lg={16}>
            <JobHeader />
            <JobDescription description={job.description} />
            <ApplicationForm jobId={job._id.toString()} />
          </Col>
        </Row>
      </main>
    </div>
  );
}

export async function getServerSideProps({ params }: { params: { id: string } }) {
  const url = process.env.URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${url}/api/jobListing/${params.id}`);
    if (!res.ok) {
      return { props: { job: null } };
    }
    const job = await res.json();
    return { props: { job } };
  } catch (error) {
    console.error('Failed to fetch job:', error);
    return { props: { job: null } };
  }
}
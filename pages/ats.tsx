import { Layout } from 'antd';
import JobListings from '@/components/jobListings';

export default function ATS() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content style={{ padding: '24px' }}>
        <JobListings />
      </Layout.Content>
    </Layout>
  );
}
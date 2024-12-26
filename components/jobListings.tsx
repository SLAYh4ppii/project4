import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Layout,
  List,
  Card,
  Typography,
  Divider,
  Button,
  Row,
  Col,
  Spin,
} from 'antd';
import styles from '@/styles/ATS.module.css';
import homeStyle from '@/styles/Home.module.css';
import { PlusOutlined } from '@ant-design/icons';
import AddJobModal from './addJobModal';
import EditJobModal from './editJobModal';
import { Job } from '@/types';

const { Content } = Layout;
const { Title } = Typography;

export default function JobListings() {
  const [newJobModalVisible, setNewJobModalVisible] = useState(false);
  const [editJobModalVisible, setEditJobModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Job | null>(null);

  const { data: jobs, error } = useSWR<Job[]>('/api/jobs', async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return res.json();
  });

  if (error) return <div>Failed to load</div>;
  if (!jobs) {
    return (
      <div className={homeStyle.container}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className={styles.siteLayoutBackground} style={{ paddingTop: 84, minHeight: '100vh' }}>
      <AddJobModal
        visible={newJobModalVisible}
        close={() => {
          mutate('/api/jobs');
          setNewJobModalVisible(false);
        }}
      />
      {selectedListing && (
        <EditJobModal
          data={selectedListing}
          visible={editJobModalVisible}
          close={() => {
            mutate('/api/jobs');
            setEditJobModalVisible(false);
          }}
        />
      )}
      <Content style={{ padding: '0 24px', minHeight: '76vh' }}>
        <Row align="middle">
          <Col flex="auto">
            <Title style={{ margin: 0 }} level={2}>
              Job Listings
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setNewJobModalVisible(true)}
            >
              Add Listing
            </Button>
          </Col>
        </Row>
        <Divider />
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3,
          }}
          dataSource={jobs}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => {
                  setSelectedListing(item);
                  setEditJobModalVisible(true);
                }}
                title={item.title}
              >
                {item.description.length <= 88
                  ? item.description
                  : `${item.description.substring(0, 85)}...`}
              </Card>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
}
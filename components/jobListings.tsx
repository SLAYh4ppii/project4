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
  Modal,
} from 'antd';
import styles from '@/styles/ATS.module.css';
import homeStyle from '@/styles/Home.module.css';
import { PlusOutlined } from '@ant-design/icons';
import AddJobModal from './addJobModal';
import EditJobModal from './editJobModal';
import ApplicantView from './applicantView';
import { Job } from '@/types';

const { Content } = Layout;
const { Title } = Typography;

export default function JobListings() {
  const [newJobModalVisible, setNewJobModalVisible] = useState(false);
  const [editJobModalVisible, setEditJobModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Job | null>(null);
  const [showApplicants, setShowApplicants] = useState(false);

  const { data: jobs, error } = useSWR<Job[]>('/api/jobs', async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return res.json();
  });

  const { data: pipeline } = useSWR<string[]>('/api/pipeline');

  if (error) return <div>Failed to load</div>;
  if (!jobs) return null;

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
        <>
          <EditJobModal
            data={selectedListing}
            visible={editJobModalVisible}
            close={() => {
              mutate('/api/jobs');
              setEditJobModalVisible(false);
            }}
          />
          <Modal
            open={showApplicants}
            title={`Applicants for ${selectedListing.title}`}
            onCancel={() => setShowApplicants(false)}
            width={1000}
            footer={null}
          >
            <ApplicantView 
              data={selectedListing._id.toString()}
              pipeline={pipeline || ['Applied', 'Interview', 'Offer', 'Rejected']}
            />
          </Modal>
        </>
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
                title={item.title}
                actions={[
                  <Button 
                    key="edit" 
                    type="link" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedListing(item);
                      setEditJobModalVisible(true);
                    }}
                  >
                    Edit
                  </Button>,
                  <Button 
                    key="applicants" 
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedListing(item);
                      setShowApplicants(true);
                    }}
                  >
                    View Applicants
                  </Button>
                ]}
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
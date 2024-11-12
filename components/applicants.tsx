import React, { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Divider,
  Spin,
  Row,
  Col,
  Button,
  MenuProps,
} from "antd";
import useSWR from "swr";
import styles from "../styles/ATS.module.css";
import homeStyle from "../styles/Home.module.css";
import { PlusOutlined } from "@ant-design/icons";
import InsertApplicantModal from "./insertApplicantModal";
import ApplicantView from "./applicantView";
import { Job } from "@/types";

const { Content, Sider } = Layout;
const { Title } = Typography;

interface ApplicantsProps {
  data: {
    initialId: string;
    pipeline: string[];
  };
}

export default function Applicants({ data }: ApplicantsProps) {
  const [insertApplicantModalVisible, setInsertApplicantModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(data.initialId);

  const { data: jobs, error } = useSWR<Job[]>("/api/jobs", async (url) => {
    const res = await fetch(url);
    return res.json();
  });

  if (error) return <div>Failed to load</div>;
  if (!jobs)
    return (
      <div className={homeStyle.container}>
        <Spin size="large" />
      </div>
    );

  const handleMenuSelect: MenuProps['onSelect'] = (e) => {
    if (e && e.key) {
      const selectedJob = jobs.find((job, index) => index.toString() === e.key);
      if (selectedJob) {
        setSelectedListing(selectedJob._id);
      }
    }
  };

  return (
    <Layout
      className={styles.siteLayoutBackground}
      style={{ paddingTop: 84, minHeight: "100vh" }}
    >
      <InsertApplicantModal
        visible={insertApplicantModalVisible}
        close={() => {
          setInsertApplicantModalVisible(false);
        }}
      />
      <Row align="middle" style={{ padding: "0 24px" }}>
        <Col flex="auto">
          <Title level={2} style={{ margin: 0 }}>
            Applicants
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setInsertApplicantModalVisible(true);
            }}
          >
            Manual Insert
          </Button>
        </Col>
      </Row>
      <Divider />
      <Layout className={styles.siteLayoutBackground}>
        <Sider className={styles.siteLayoutBackground} width={200}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["0"]}
            style={{ height: "100%" }}
            onSelect={handleMenuSelect}
            items={jobs.map((job, i) => ({
              key: i.toString(),
              label: job.title,
            }))}
          />
        </Sider>
        <Content
          style={{
            padding: "0 24px",
          }}
        >
          <ApplicantView
            data={selectedListing}
            pipeline={data.pipeline}
          />
        </Content>
      </Layout>
    </Layout>
  );
}
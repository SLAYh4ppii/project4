import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import styles from "../../styles/Home.module.css";
import listingStyles from "../../styles/ListingsPage.module.css";
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
} from "antd";
import ReactMarkdown from "react-markdown";
import { Job } from "@/types";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const validateMessages = {
  required: "This field is required!",
  types: {
    email: "Not a valid email!",
    number: "Not a valid number!",
    url: "Not a valid url!",
  },
};

interface JobApplication {
  name: string;
  email: string;
  cv: any[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
  listing?: string;
}

function JobDetails() {
  const [form] = Form.useForm<JobApplication>();
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR<Job>(
    id ? `/api/jobListing/${id}` : null,
    async (url) => {
      const res = await fetch(url);
      return res.json();
    }
  );

  async function handleSubmit(values: JobApplication) {
    try {
      values.listing = id as string;
      await fetch("/api/applicants", {
        method: "POST",
        body: JSON.stringify(values),
      });
      form.resetFields();
      message.success("Your application has been submitted");
      // Trigger a refresh of the applicants list
      mutate(`/api/jobs/${id}`);
    } catch (error) {
      message.error("Failed to submit application");
    }
  }

  if (error) {
    return (
      <div>
        This page does not exist,{" "}
        <Link href="/jobs">
          click here to go back.
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container} {...listingStyles}>
      <Head>
        <title>{data.title} - Jobs</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className={styles.main}>
        <Row style={{ paddingTop: "4rem" }} justify="center" align="top">
          <Col xs={{ span: 20 }} lg={{ span: 10 }}>
            <h1>{data.title}</h1>
            <h5>{data.location}</h5>
            <ReactMarkdown>{data.description}</ReactMarkdown>
            <Divider style={{ margin: "3rem 0" }} />
            <h3>Apply For This Job</h3>
            <Form
              form={form}
              {...layout}
              name="job-application"
              onFinish={handleSubmit}
              validateMessages={validateMessages}
              style={{ maxWidth: "600px" }}
            >
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true }, { type: "email" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="cv"
                label="CV"
                rules={[{ required: true }]}
              >
                <Upload name="file" action="/api/cv" accept=".pdf">
                  <Button>Upload CV</Button>
                </Upload>
              </Form.Item>
              <Form.Item name="phone" label="Phone Number">
                <Input />
              </Form.Item>
              <Form.Item
                name="linkedin"
                label="LinkedIn"
                rules={[{ type: "url" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="website"
                label="Website"
                rules={[{ type: "url" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="introduction"
                label="Short Introduction"
                rules={[
                  {
                    max: 300,
                    message: "Your introduction cannot be longer than 300 characters!",
                  },
                ]}
              >
                <Input.TextArea rows={8} />
              </Form.Item>
              <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                <Button type="primary" htmlType="submit">
                  Submit Application
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/baykamsay/simple-ats"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}

export default JobDetails;
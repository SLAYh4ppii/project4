import React, { useEffect } from "react";
import Router from "next/router";
import cookie from "js-cookie";
import Head from "next/head";
import { Layout, Form, Input, Button, message, Typography } from "antd";

const { Text } = Typography;
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
const { Content, Footer } = Layout;

interface LoginForm {
  username: string;
  password: string;
}

const Login = () => {
  const [form] = Form.useForm<LoginForm>();

  async function handleSubmit(values: LoginForm) {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.error) {
        message.error(data.message);
        return;
      }

      if (data.token) {
        cookie.set("token", data.token, {
          expires: 2,
          secure: true,
          sameSite: "strict",
        });
        Router.push("/ats");
      }
    } catch (error) {
      message.error("An error occurred during login");
    }
  }

  useEffect(() => {
    Router.prefetch("/ats");
  }, []);

  return (
    <div>
      <Head>
        <title>Login - Simple ATS</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Form
            form={form}
            {...layout}
            name="basic"
            onFinish={handleSubmit}
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 4,
              boxShadow: "2px 2px 6px -3px rgba(0,0,0,0.15)",
            }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
            <Text>
              Demo Username: guest <br /> Demo Password: guest
            </Text>
          </Form>
        </Content>
        <Footer style={{ textAlign: "center" }}>Baykam Say ©2020</Footer>
      </Layout>
    </div>
  );
};

export default Login;
import { useRouter } from 'next/router';
import { Form, Input, Button, message } from 'antd';

interface SignupFormData {
  username: string;
  password: string;
}

export default function Signup() {
  const router = useRouter();
  const [form] = Form.useForm<SignupFormData>();

  const handleSubmit = async (values: SignupFormData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      message.success('Account created successfully');
      router.push('/login');
    } catch (error) {
      message.error('Failed to create account');
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      style={{ maxWidth: 400, margin: '40px auto', padding: '20px' }}
    >
      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Sign Up
        </Button>
      </Form.Item>
    </Form>
  );
}
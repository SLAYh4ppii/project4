import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import '../styles/globals.css';
import 'antd/dist/reset.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorLink: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          fontSize: 14,
          colorText: 'rgba(0, 0, 0, 0.65)',
          colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
          colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 2,
          colorBorder: '#d9d9d9',
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}

export default MyApp;
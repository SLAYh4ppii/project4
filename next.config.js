/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    '@rc-component/trigger',
    '@ant-design/cssinjs',
    '@ant-design/icons-svg',
    '@ctrl/tinycolor',
    '@babel/runtime',
    'rc-input'
  ],
  experimental: {
    esmExternals: false
  }
};

module.exports = nextConfig;
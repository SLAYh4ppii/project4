/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['antd', '@ant-design/icons', 'rc-util', 'rc-pagination', 'rc-picker', '@rc-component/trigger', '@ant-design/cssinjs', '@ant-design/icons-svg', '@ctrl/tinycolor', '@babel/runtime'],
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    };
    return config;
  }
};

module.exports = nextConfig;
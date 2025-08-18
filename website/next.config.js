/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    mdxRs: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/KInfoGit' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/KInfoGit' : '',
}

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

module.exports = withMDX(nextConfig)
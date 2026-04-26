import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://team-showcase.vercel.app'),
  title: {
    default: '贵州特色食品数智化技术创新与应用研究中心 · 食品加工研发团队',
    template: '%s | 贵州特色食品数智化技术创新与应用研究中心'
  },
  description:
    '贵州特色食品数智化技术创新与应用研究中心食品加工研发团队官网，展示成员信息、研究方向、项目成果、论文与案例。地址：贵州省贵阳市贵安新区云安路1号。',
  keywords: [
    '团队展示网站',
    '成员信息展示',
    '团队官网',
    'Vercel 部署',
    '研究团队',
    '项目成果展示'
  ],
  openGraph: {
    title: '贵州特色食品数智化技术创新与应用研究中心 · 食品加工研发团队',
    description: '展示团队成员、研究方向、项目成果与案例的高质感官网。地址：贵州省贵阳市贵安新区云安路1号。',
    url: 'https://team-showcase.vercel.app',
    siteName: 'Team Portfolio',
    locale: 'zh_CN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: '贵州特色食品数智化技术创新与应用研究中心 · 食品加工研发团队',
    description: '高质感团队展示网站，适合科研团队对外品牌展示与成果传播。'
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://team-showcase.vercel.app'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

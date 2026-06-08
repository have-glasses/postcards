import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMemberBySlug, members } from '../data';
import { siteName, siteUrl } from '../site';
import { TeamPage } from '../team-page';

type MemberPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return members.map((member) => ({ slug: member.slug }));
}

export function generateMetadata({ params }: MemberPageProps): Metadata {
  const member = getMemberBySlug(params.slug);

  if (!member) {
    return {};
  }

  const pageUrl = `${siteUrl}/${member.slug}`;
  const imageUrl = `${siteUrl}/api/og/${member.slug}`;

  return {
    title: `${member.name} · 个人电子名片`,
    description: `${member.name}，${member.role}，${member.organization}。研究方向：${member.direction}。`,
    alternates: {
      canonical: pageUrl
    },
    openGraph: {
      title: `${member.name} · 个人电子名片`,
      description: `${member.name}，${member.role}。${member.bio}`,
      url: pageUrl,
      siteName,
      locale: 'zh_CN',
      type: 'profile',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${member.name} · 个人电子名片`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${member.name} · 个人电子名片`,
      description: `${member.name}，${member.role}。${member.bio}`,
      images: [imageUrl]
    }
  };
}

export default function MemberPage({ params }: MemberPageProps) {
  const member = getMemberBySlug(params.slug);

  if (!member) {
    notFound();
  }

  return <TeamPage featuredMember={member} />;
}

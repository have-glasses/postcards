import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMemberBySlug, members } from '../data';
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

  return {
    title: `${member.name} · 个人电子名片`,
    description: `${member.name}，${member.role}，${member.organization}。研究方向：${member.direction}。`,
    openGraph: {
      title: `${member.name} · 个人电子名片`,
      description: `${member.name}，${member.role}。${member.bio}`,
      images: [member.photo]
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

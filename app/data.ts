import membersData from './members.json';
import siteContentData from './site-content.json';

export type Member = {
  slug: string;
  name: string;
  role: string;
  organization: string;
  phone: string;
  email: string;
  direction: string;
  certificate: string;
  bio: string;
  tags: string[];
  photo: string;
};

export const members: Member[] = membersData;

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type AchievementItem = {
  title: string;
  tag: string;
  venue?: string;
  desc?: string;
  impact?: string;
};

export type SiteContent = {
  brand: {
    mark: string;
    englishName: string;
    chineseName: string;
    nav: {
      profile: string;
      overview: string;
      members: string;
      achievements: string;
      contact: string;
    };
  };
  overview: {
    title: string;
    description: string;
    metrics: Metric[];
  };
  sections: {
    membersKicker: string;
    membersTitle: string;
    achievementsKicker: string;
    achievementsTitle: string;
    contactKicker: string;
    contactTitle: string;
  };
  achievements: {
    papersTitle: string;
    projectsTitle: string;
    casesTitle: string;
    papers: Array<AchievementItem & { venue: string }>;
    projects: Array<AchievementItem & { desc: string }>;
    cases: Array<AchievementItem & { impact: string }>;
  };
  contact: {
    description: string;
    emailLabel: string;
    phoneLabel: string;
    addressLabel: string;
    address: string;
  };
  footer: {
    kicker: string;
    text: string;
  };
};

export const siteContent: SiteContent = siteContentData;
export const metrics = siteContent.overview.metrics;
export const achievements = siteContent.achievements;

export function getMemberBySlug(slug: string) {
  return members.find((member) => member.slug === slug);
}

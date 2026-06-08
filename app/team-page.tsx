import Image from 'next/image';
import Link from 'next/link';
import { achievements, members, metrics, type Member } from './data';

export function TeamPage({ featuredMember }: { featuredMember?: Member }) {
  const contactMember = featuredMember ?? members[0];

  return (
    <main className="page-root">
      <div className="bg-layer bg-grid" />
      <div className="bg-layer bg-gradient" />
      <div className="bg-layer bg-glow" />

      <div className="layout-wrap">
        <header className="top-nav">
          <Link href="/" className="flex items-center gap-3">
            <div className="brand-mark brand-mark-vertical">食研</div>
            <div>
              <p className="micro-label">Guizhou Food Digital Innovation Center</p>
              <p className="top-brand text-lg font-medium text-white md:text-xl">贵州特色食品数智化技术创新与应用研究中心</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex lg:text-base">
            {featuredMember ? <a href="#profile" className="nav-link">名片</a> : null}
            <a href="#overview" className="nav-link">总览</a>
            <a href="#members" className="nav-link">成员</a>
            <a href="#achievements" className="nav-link">成果</a>
            <a href="#contact" className="nav-link">联系</a>
          </nav>
        </header>

        {featuredMember ? <PersonalCard member={featuredMember} /> : null}

        <section id="overview" className={`reveal-section ${featuredMember ? 'mt-16' : ''}`}>
          <div className="panel panel-hero p-8 md:p-10">
            <div className="hero-divider" aria-hidden="true" />
            <h1 className="hero-title mt-6 text-3xl font-semibold leading-tight text-white md:text-5xl">
              <span className="title-accent title-accent-large">食品加工研发团队</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              以数智赋能特色食品研发，以专业展示连接产业合作。
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {metrics.map((item) => (
                <div key={item.label} className="metric-card">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="members" className="reveal-section mt-16">
          <p className="section-kicker">Member Directory</p>
          <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">核心成员</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {members.map((member) => (
              <MemberCard key={member.slug} member={member} isActive={member.slug === featuredMember?.slug} />
            ))}
          </div>
        </section>

        <section id="achievements" className="panel reveal-section mt-16 p-7">
          <p className="section-kicker">Research & Delivery</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">团队成果 / 论文 / 项目案例</h3>
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            <CategoryCard title="论文成果" items={achievements.papers} itemKey="venue" />
            <CategoryCard title="项目成果" items={achievements.projects} itemKey="desc" />
            <CategoryCard title="案例价值" items={achievements.cases} itemKey="impact" />
          </div>
        </section>

        <section id="contact" className="panel reveal-section mt-16 p-7">
          <p className="section-kicker">Contact</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">合作与联系</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            如需进一步了解团队建设、成果展示或合作对接，欢迎随时联系交流。
          </p>
          <div className="mt-6 grid gap-4">
            <div className="sub-card p-4">
              <p className="text-xs text-slate-400">邮箱</p>
              <p className="mt-1 text-sm text-white">{contactMember.email}</p>
            </div>
            <div className="sub-card p-4">
              <p className="text-xs text-slate-400">电话</p>
              <p className="mt-1 text-sm text-white">{contactMember.phone}</p>
            </div>
            <div className="sub-card p-4">
              <p className="text-xs text-slate-400">地址</p>
              <p className="mt-1 text-sm text-white">贵州省贵阳市贵安新区云安路1号</p>
            </div>
          </div>
        </section>

        <footer className="panel reveal-section mt-16 flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-kicker">Team Brand Footer</p>
            <p className="mt-2 text-sm text-slate-300">Team Showcase © 2026 · Built for premium external presentation.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <a href="#overview" className="nav-link">总览</a>
            <a href="#members" className="nav-link">成员</a>
            <a href="#achievements" className="nav-link">成果</a>
            <a href="#contact" className="nav-link">联系</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function PersonalCard({ member }: { member: Member }) {
  return (
    <section id="profile" className="reveal-section">
      <div className="personal-card panel">
        <div className="personal-photo">
          <Image
            src={member.photo}
            alt={member.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 38vw"
            className="object-cover"
          />
        </div>
        <div className="personal-content">
          <p className="section-kicker">Personal Card</p>
          <h1 className="hero-title mt-3 text-5xl font-semibold leading-tight text-white md:text-7xl">{member.name}</h1>
          <p className="mt-3 text-lg text-cyan-100">{member.role}</p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">{member.bio}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {member.tags.map((tag) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            <InfoRow label="工作单位" value={member.organization} />
            <InfoRow label="电话" value={member.phone} />
            <InfoRow label="邮箱" value={member.email} />
            <InfoRow label="证书" value={member.certificate} />
          </div>
          <div className="mt-3">
            <InfoRow label="研究方向" value={member.direction} />
          </div>
          <div className="personal-actions mt-7 flex flex-wrap gap-3">
            <a className="primary-action" href={`tel:${member.phone.replace(/（.*$/, '')}`}>拨打电话</a>
            <a className="secondary-action" href={`mailto:${member.email}`}>发送邮件</a>
            <a className="secondary-action" href="#members">查看团队</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MemberCard({ member, isActive }: { member: Member; isActive: boolean }) {
  return (
    <article className={`member-card ${isActive ? 'member-card-active' : ''}`}>
      <Link href={`/${member.slug}`} className="block">
        <div className="relative h-72 overflow-hidden rounded-t-[1.4rem]">
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="(max-width: 1280px) 50vw, 25vw"
            className="object-cover transition duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/35 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs tracking-[0.2em] text-cyan-100/80">{member.role}</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">{member.name}</h3>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        {isActive ? <p className="active-label">当前名片</p> : null}
        <p className="text-sm leading-6 text-slate-300">{member.bio}</p>
        <div className="flex flex-wrap gap-2">
          {member.tags.map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
        <div className="grid gap-2 text-sm">
          <InfoRow label="工作单位" value={member.organization} />
          <InfoRow label="电话" value={member.phone} />
          <InfoRow label="邮箱" value={member.email} />
          <InfoRow label="证书" value={member.certificate} />
          <InfoRow label="研究方向" value={member.direction} />
        </div>
        <Link href={`/${member.slug}`} className="profile-link">打开个人名片</Link>
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right text-slate-100">{value}</span>
    </div>
  );
}

function CategoryCard({
  title,
  items,
  itemKey
}: {
  title: string;
  items: Array<{ title: string; [key: string]: string }>;
  itemKey: 'venue' | 'desc' | 'impact';
}) {
  return (
    <div className="sub-card p-5">
      <p className="text-sm font-semibold text-cyan-200">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.title} className="sub-card p-3">
            <p className="text-sm text-white/90">{item.title}</p>
            <p className="mt-1 text-xs leading-6 text-slate-300">{item[itemKey]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

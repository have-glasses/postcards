import Image from 'next/image';

const members = [
  {
    name: '邹妍',
    role: '中心负责人 / 核心成员',
    organization: '贵州轻工职业大学',
    phone: '18685296723（微信同号）',
    email: '542377577@qq.com',
    direction: '特色食品研发，工艺优化，质量管理',
    certificate: '轻工化工系副主任、副教授，中心负责人，贵州省食品工业协会副会长，贵州省2025届白酒评委',
    bio: '围绕特色食品研发与工艺优化开展教学与科研，长期推动质量管理体系在项目落地中的应用。',
    tags: ['特色食品研发', '工艺优化', '质量管理'],
    photo: '/members/zou-yan.svg'
  },
  {
    name: '沈祉君',
    role: '核心成员',
    organization: '贵州轻工职业大学',
    phone: '18285078240（微信同号）',
    email: 'shenzj09@qq.com',
    direction: '特色饮品研发、酱香型白酒、食品营养与健康、食品加工工艺技术',
    certificate: '高级品酒师、贵州省食品科学技术学会会员',
    bio: '聚焦特色饮品与酱香型白酒方向研究，关注食品营养健康与食品加工工艺技术协同创新。',
    tags: ['特色饮品研发', '酱香型白酒', '食品营养健康', '加工工艺'],
    photo: '/members/shen-zhijun.svg'
  },
  {
    name: '李扬',
    role: '核心成员',
    organization: '贵州轻工职业大学',
    phone: '18785026138（微信同号）',
    email: '1985782143@qq.com',
    direction: '酱香白酒、酸汤感官分析；药食同源饮品研发；酱香低度酒智能体研发',
    certificate: '高级品酒师、贵州省2025届白酒评委、贵州省酸汤协会会员',
    bio: '聚焦酱香白酒与酸汤感官分析，推动药食同源饮品研发及酱香低度酒智能体研发应用。',
    tags: ['酱香白酒', '酸汤感官分析', '药食同源饮品', '低度酒智能体'],
    photo: '/members/li-yang.svg'
  },
  {
    name: '曹婧',
    role: '核心成员',
    organization: '贵州轻工职业大学轻工化工系',
    phone: '18275188713（微信同号）',
    email: '232469324@qq.com',
    direction: '食品研发，配方工艺优化，标签管理，标准化管理',
    certificate: '轻工化工系教师，食品加工技术高级工程师，高级食品检验工，贵州省食品科学技术学会会员，2016年全国食品工业科技创新卓越工作者',
    bio: '长期从事食品研发与工艺优化工作，擅长标签管理和标准化管理体系建设。',
    tags: ['食品研发', '配方工艺优化', '标签管理', '标准化管理'],
    photo: '/members/cao-jing.svg'
  },
  {
    name: '马志方',
    role: '核心成员',
    organization: '贵州轻工职业大学轻工化工系',
    phone: '18101075203（微信同号）',
    email: '461973573@qq.com',
    direction: '质量管理，食品合规，采购及供应商管理，项目管理',
    certificate: '食品检验检测专业教研室主任，高级农产品食品检验员，曾任职全球知名乳制品企业和水果制品企业',
    bio: '具备产业与高校双重实践经验，专注质量管理、食品合规与供应链协同管理。',
    tags: ['质量管理', '食品合规', '供应商管理', '项目管理'],
    photo: '/members/ma-zhifang.svg'
  },
  {
    name: '王怡',
    role: '核心成员',
    organization: '贵州轻工职业大学',
    phone: '18084212755（微信同号）',
    email: '3030991925@qq.com',
    direction: '食品质量检验检测、质量管理',
    certificate: '化学基础教研室主任，高级农产品食品检验员',
    bio: '围绕食品质量检验检测与质量管理开展教学科研，支撑团队质量控制与评价体系建设。',
    tags: ['质量检验检测', '质量管理'],
    photo: '/members/wang-yi.svg'
  },
  {
    name: '李颖',
    role: '核心成员',
    organization: '贵州轻工职业大学',
    phone: '17885902089（微信同号）',
    email: '1363393909@qq.com',
    direction: '发酵微生物、酸汤菌种筛选；食品减压检测技术',
    certificate: '农产品食品检验员三级、品酒师三级、贵州省酸汤协会会员',
    bio: '专注发酵微生物与酸汤菌种筛选，研究食品减压检测技术在质量评价中的应用。',
    tags: ['发酵微生物', '酸汤菌种筛选', '食品检测'],
    photo: '/members/li-ying.svg'
  }
];

const metrics = [
  { label: '团队成员', value: '7', detail: '核心成员展示' },
  { label: '研究方向', value: '8+', detail: '特色食品、饮品研发、白酒、发酵微生物等' },
  { label: '专业证书', value: '28', detail: '技术与管理双向认证' }
];

const timeline = [
  { year: '2022', text: '成立核心研究组，聚焦智能系统落地与平台化建设。' },
  { year: '2023', text: '完成第一代团队官网，建立标准化成员档案体系。' },
  { year: '2024', text: '扩展跨学科协作机制，覆盖算法、产品、设计、工程。' },
  { year: '2025', text: '升级为高质感展示站，支持品牌化对外展示与对接。' }
];

const achievements = {
  papers: [
    {
      title: '利用乙酸协同氢化钙提升马铃薯片热加工质构特性',
      venue: 'Modern Food Science and Technology, 2022, 38(4):140-146+200',
      tag: '论文'
    },
    {
      title: '辛烯基琥珀酸芡荞糊精酥自聚集特性研究',
      venue: '食品科学, 2023, 44(7): 237-242',
      tag: '论文'
    }
  ],
  projects: [
    {
      title: '贵州轻工职业技术学院专利成果',
      desc: '一种白酒在线检测装置，授权公告号 CN212748439U',
      tag: '专利'
    },
    {
      title: '科研成果产学研转化',
      desc: '围绕特色食品加工、品质提升与技术转化开展联合研究。',
      tag: '成果转化'
    }
  ],
  cases: [
    {
      title: '校企联合科研项目',
      impact: '推动特色食品工艺优化与产品性能提升，形成可落地技术方案。',
      tag: '案例'
    },
    {
      title: '应用研究与专利布局',
      impact: '围绕检测、加工与质量控制形成论文与专利协同成果。',
      tag: '案例'
    }
  ]
};

export default function Home() {
  return (
    <main className="page-root">
      <div className="bg-layer bg-grid" />
      <div className="bg-layer bg-gradient" />
      <div className="bg-layer bg-glow" />

      <div className="layout-wrap">
        <header className="top-nav">
          <div className="flex items-center gap-3">
            <div className="brand-mark brand-mark-vertical">食研</div>
            <div>
              <p className="micro-label">Guizhou Food Digital Innovation Center</p>
              <p className="top-brand text-lg font-medium text-white md:text-xl">贵州特色食品数智化技术创新与应用研究中心</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex lg:text-base">
            <a href="#overview" className="nav-link">总览</a>
            <a href="#members" className="nav-link">成员</a>
            <a href="#achievements" className="nav-link">成果</a>
            <a href="#timeline" className="nav-link">发展</a>
            <a href="#contact" className="nav-link">联系</a>
          </nav>
        </header>

        <section id="overview" className="reveal-section">
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
              <article key={member.name} className="member-card">
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

                <div className="space-y-4 p-5">
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
                </div>
              </article>
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
            <div className="sub-card"><p className="text-xs text-slate-400">邮箱</p><p className="mt-1 text-sm text-white">1985782143@qq.com</p></div>
            <div className="sub-card"><p className="text-xs text-slate-400">电话</p><p className="mt-1 text-sm text-white">18785026138</p></div>
            <div className="sub-card"><p className="text-xs text-slate-400">地址</p><p className="mt-1 text-sm text-white">贵州省贵阳市贵安新区云安路1号</p></div>
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

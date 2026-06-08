import membersData from './members.json';

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

export const metrics = [
  { label: '团队成员', value: '7', detail: '核心成员展示' },
  { label: '研究方向', value: '8+', detail: '特色食品、饮品研发、白酒、发酵微生物等' },
  { label: '专业证书', value: '28', detail: '技术与管理双向认证' }
];

export const achievements = {
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

export function getMemberBySlug(slug: string) {
  return members.find((member) => member.slug === slug);
}

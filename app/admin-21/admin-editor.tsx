'use client';

import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AchievementItem, Member, Metric, SiteContent } from '../data';

type SaveState = {
  status: 'idle' | 'saving' | 'success' | 'error';
  message: string;
};

type PendingPhoto = {
  content: string;
  filename: string;
  path: string;
};

type AdminTab = 'members' | 'content';
type AchievementGroup = 'papers' | 'projects' | 'cases';

const editableFields: Array<{ key: keyof Omit<Member, 'tags'>; label: string; multiline?: boolean }> = [
  { key: 'slug', label: '链接标识' },
  { key: 'name', label: '姓名' },
  { key: 'role', label: '角色' },
  { key: 'organization', label: '单位' },
  { key: 'phone', label: '电话' },
  { key: 'email', label: '邮箱' },
  { key: 'direction', label: '研究方向', multiline: true },
  { key: 'certificate', label: '证书', multiline: true },
  { key: 'bio', label: '简介', multiline: true },
  { key: 'photo', label: '照片路径' }
];

const achievementConfig: Record<AchievementGroup, { titleKey: 'papersTitle' | 'projectsTitle' | 'casesTitle'; label: string; detailKey: 'venue' | 'desc' | 'impact'; detailLabel: string }> = {
  papers: { titleKey: 'papersTitle', label: '论文成果', detailKey: 'venue', detailLabel: '期刊 / 来源' },
  projects: { titleKey: 'projectsTitle', label: '项目成果', detailKey: 'desc', detailLabel: '描述' },
  cases: { titleKey: 'casesTitle', label: '案例价值', detailKey: 'impact', detailLabel: '价值 / 影响' }
};

export function AdminEditor({
  initialMembers,
  initialSiteContent
}: {
  initialMembers: Member[];
  initialSiteContent: SiteContent;
}) {
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<Member[]>(() => initialMembers.map(cloneMember));
  const [siteContent, setSiteContent] = useState<SiteContent>(() => cloneSiteContent(initialSiteContent));
  const [pendingPhotos, setPendingPhotos] = useState<Record<string, PendingPhoto>>({});
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle', message: '' });
  const [activeSlug, setActiveSlug] = useState(initialMembers[0]?.slug ?? '');
  const [activeTab, setActiveTab] = useState<AdminTab>('members');

  const activeMember = useMemo(
    () => members.find((member) => member.slug === activeSlug) ?? members[0],
    [activeSlug, members]
  );

  function updateMember(slug: string, patch: Partial<Member>) {
    setMembers((currentMembers) =>
      currentMembers.map((member) => (member.slug === slug ? { ...member, ...patch } : member))
    );

    if (patch.slug) {
      setActiveSlug(patch.slug);
    }
  }

  function updateTag(slug: string, index: number, value: string) {
    setMembers((currentMembers) =>
      currentMembers.map((member) => {
        if (member.slug !== slug) {
          return member;
        }

        const tags = [...member.tags];
        tags[index] = value;
        return { ...member, tags };
      })
    );
  }

  function addTag(slug: string) {
    updateMember(slug, {
      tags: [...(members.find((member) => member.slug === slug)?.tags ?? []), '']
    });
  }

  function removeTag(slug: string, index: number) {
    const member = members.find((item) => item.slug === slug);

    if (!member) {
      return;
    }

    updateMember(slug, {
      tags: member.tags.filter((_, tagIndex) => tagIndex !== index)
    });
  }

  function addMember() {
    const member = createBlankMember(members);

    setMembers((currentMembers) => [...currentMembers, member]);
    setActiveSlug(member.slug);
    setActiveTab('members');
    setSaveState({ status: 'idle', message: '' });
  }

  function removeActiveMember() {
    if (!activeMember) {
      return;
    }

    const confirmed = window.confirm(`确定删除 ${activeMember.name || activeMember.slug} 吗？保存后才会同步到线上。`);

    if (!confirmed) {
      return;
    }

    setMembers((currentMembers) => {
      const nextMembers = currentMembers.filter((member) => member.slug !== activeMember.slug);
      setActiveSlug(nextMembers[0]?.slug ?? '');
      return nextMembers;
    });
    setPendingPhotos((currentPhotos) => {
      const nextPhotos = { ...currentPhotos };
      delete nextPhotos[activeMember.slug];
      return nextPhotos;
    });
    setSaveState({ status: 'idle', message: '' });
  }

  async function uploadPhoto(slug: string, file: File | null) {
    if (!file) {
      return;
    }

    const extension = getImageExtension(file);

    if (!extension) {
      setSaveState({ status: 'error', message: '照片仅支持 png、jpg、jpeg、webp' });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setSaveState({ status: 'error', message: '照片不能超过 3MB' });
      return;
    }

    const member = members.find((item) => item.slug === slug);
    const safeSlug = toSafeSlug(member?.slug ?? slug);

    if (!safeSlug) {
      setSaveState({ status: 'error', message: '请先填写有效的链接标识' });
      return;
    }

    const content = await readFileAsBase64(file);
    const filename = `${safeSlug}.${extension}`;
    const path = `/members/${filename}`;

    updateMember(slug, { photo: path });
    setPendingPhotos((currentPhotos) => ({
      ...currentPhotos,
      [slug]: {
        content,
        filename,
        path
      }
    }));
    setSaveState({ status: 'idle', message: '' });
  }

  async function saveAll() {
    setSaveState({ status: 'saving', message: '保存中...' });

    try {
      const response = await fetch('/api/admin-21/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, members, siteContent, photos: Object.values(pendingPhotos) })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? '保存失败');
      }

      setSaveState({
        status: 'success',
        message: result.commit ? `已保存，提交 ${result.commit.slice(0, 7)}` : '已保存'
      });
      setPendingPhotos({});
    } catch (error) {
      setSaveState({
        status: 'error',
        message: error instanceof Error ? error.message : '保存失败'
      });
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-header">
          <div>
            <p className="section-kicker">Admin</p>
            <h1>内容编辑</h1>
          </div>
          <a href="/" className="secondary-action">返回首页</a>
        </div>

        <div className="admin-login">
          <label>
            编辑密码
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button className="primary-action" type="button" onClick={saveAll} disabled={saveState.status === 'saving'}>
            {saveState.status === 'saving' ? '保存中' : '保存'}
          </button>
        </div>

        {saveState.message ? <p className={`admin-status admin-status-${saveState.status}`}>{saveState.message}</p> : null}

        <div className="admin-tabs">
          <button type="button" className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>
            成员信息
          </button>
          <button type="button" className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>
            页面内容
          </button>
        </div>

        {activeTab === 'members' ? (
          <>
            <div className="admin-actions">
              <button type="button" className="secondary-action" onClick={addMember}>新增成员</button>
              <button type="button" className="danger-action" onClick={removeActiveMember} disabled={!activeMember}>
                删除当前成员
              </button>
            </div>

            <div className="admin-layout">
              <aside className="admin-member-list">
                {members.map((member, index) => (
                  <button
                    key={`${member.slug}-${index}`}
                    type="button"
                    className={member.slug === activeMember?.slug ? 'active' : ''}
                    onClick={() => setActiveSlug(member.slug)}
                  >
                    <span>{member.name || '未命名成员'}</span>
                    <small>/{member.slug}</small>
                  </button>
                ))}
              </aside>

              {activeMember ? (
                <div className="admin-form">
                  {editableFields.map((field) => (
                    <label key={field.key}>
                      {field.label}
                      {field.multiline ? (
                        <textarea
                          value={String(activeMember[field.key])}
                          onChange={(event) =>
                            updateMember(activeMember.slug, { [field.key]: event.target.value } as Partial<Member>)
                          }
                        />
                      ) : (
                        <input
                          value={String(activeMember[field.key])}
                          onChange={(event) =>
                            updateMember(activeMember.slug, { [field.key]: event.target.value } as Partial<Member>)
                          }
                        />
                      )}
                      {field.key === 'slug' ? (
                        <small className="admin-field-help">不能重复；建议使用小写英文、数字和短横线，例如 li-yang。</small>
                      ) : null}
                    </label>
                  ))}

                  <div className="admin-photo-upload">
                    <div>
                      <p>上传照片</p>
                      <small>选择 png、jpg、jpeg 或 webp，保存后自动同步为当前照片路径。</small>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => uploadPhoto(activeMember.slug, event.target.files?.[0] ?? null)}
                    />
                    {pendingPhotos[activeMember.slug] ? (
                      <small className="admin-field-help">待保存：{pendingPhotos[activeMember.slug].path}</small>
                    ) : null}
                  </div>

                  <div className="admin-tags">
                    <div className="admin-tags-title">
                      <span>标签</span>
                      <button type="button" onClick={() => addTag(activeMember.slug)}>增加标签</button>
                    </div>
                    {activeMember.tags.map((tag, index) => (
                      <div key={`${activeMember.slug}-${index}`} className="admin-tag-row">
                        <input value={tag} onChange={(event) => updateTag(activeMember.slug, index, event.target.value)} />
                        <button type="button" onClick={() => removeTag(activeMember.slug, index)}>删除</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <SiteContentEditor siteContent={siteContent} setSiteContent={setSiteContent} />
        )}
      </section>
    </main>
  );
}

function SiteContentEditor({
  siteContent,
  setSiteContent
}: {
  siteContent: SiteContent;
  setSiteContent: Dispatch<SetStateAction<SiteContent>>;
}) {
  function updateContent(updater: (content: SiteContent) => SiteContent) {
    setSiteContent((current) => updater(cloneSiteContent(current)));
  }

  function updateMetric(index: number, patch: Partial<Metric>) {
    updateContent((content) => {
      content.overview.metrics[index] = { ...content.overview.metrics[index], ...patch };
      return content;
    });
  }

  function addMetric() {
    updateContent((content) => {
      content.overview.metrics.push({ label: '新指标', value: '', detail: '' });
      return content;
    });
  }

  function removeMetric(index: number) {
    updateContent((content) => {
      content.overview.metrics = content.overview.metrics.filter((_, metricIndex) => metricIndex !== index);
      return content;
    });
  }

  function updateAchievement(group: AchievementGroup, index: number, patch: Partial<AchievementItem>) {
    updateContent((content) => {
      const items = [...content.achievements[group]];
      items[index] = { ...items[index], ...patch } as never;
      content.achievements[group] = items as never;
      return content;
    });
  }

  function addAchievement(group: AchievementGroup) {
    const { detailKey } = achievementConfig[group];

    updateContent((content) => {
      const item = { title: '新条目', tag: '', [detailKey]: '' };
      content.achievements[group] = [...content.achievements[group], item] as never;
      return content;
    });
  }

  function removeAchievement(group: AchievementGroup, index: number) {
    updateContent((content) => {
      content.achievements[group] = content.achievements[group].filter((_, itemIndex) => itemIndex !== index) as never;
      return content;
    });
  }

  return (
    <div className="admin-content-form">
      <fieldset>
        <legend>顶部栏</legend>
        <label>
          左侧标识
          <input value={siteContent.brand.mark} onChange={(event) => updateContent((content) => ({ ...content, brand: { ...content.brand, mark: event.target.value } }))} />
        </label>
        <label>
          英文名称
          <input value={siteContent.brand.englishName} onChange={(event) => updateContent((content) => ({ ...content, brand: { ...content.brand, englishName: event.target.value } }))} />
        </label>
        <label>
          中文名称
          <input value={siteContent.brand.chineseName} onChange={(event) => updateContent((content) => ({ ...content, brand: { ...content.brand, chineseName: event.target.value } }))} />
        </label>
        <div className="admin-inline-grid">
          {Object.entries(siteContent.brand.nav).map(([key, value]) => (
            <label key={key}>
              导航：{navLabel(key)}
              <input
                value={value}
                onChange={(event) =>
                  updateContent((content) => ({
                    ...content,
                    brand: {
                      ...content.brand,
                      nav: { ...content.brand.nav, [key]: event.target.value }
                    }
                  }))
                }
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>总览</legend>
        <label>
          大标题
          <input value={siteContent.overview.title} onChange={(event) => updateContent((content) => ({ ...content, overview: { ...content.overview, title: event.target.value } }))} />
        </label>
        <label>
          副标题
          <textarea value={siteContent.overview.description} onChange={(event) => updateContent((content) => ({ ...content, overview: { ...content.overview, description: event.target.value } }))} />
        </label>
        <div className="admin-repeater-title">
          <span>统计指标</span>
          <button type="button" onClick={addMetric}>新增指标</button>
        </div>
        {siteContent.overview.metrics.map((metric, index) => (
          <div key={`${metric.label}-${index}`} className="admin-repeater-row">
            <input value={metric.label} placeholder="名称" onChange={(event) => updateMetric(index, { label: event.target.value })} />
            <input value={metric.value} placeholder="数值" onChange={(event) => updateMetric(index, { value: event.target.value })} />
            <input value={metric.detail} placeholder="说明" onChange={(event) => updateMetric(index, { detail: event.target.value })} />
            <button type="button" onClick={() => removeMetric(index)}>删除</button>
          </div>
        ))}
      </fieldset>

      <fieldset>
        <legend>分区标题</legend>
        <div className="admin-inline-grid">
          <label>
            成员英文小标题
            <input value={siteContent.sections.membersKicker} onChange={(event) => updateContent((content) => ({ ...content, sections: { ...content.sections, membersKicker: event.target.value } }))} />
          </label>
          <label>
            成员标题
            <input value={siteContent.sections.membersTitle} onChange={(event) => updateContent((content) => ({ ...content, sections: { ...content.sections, membersTitle: event.target.value } }))} />
          </label>
          <label>
            成果英文小标题
            <input value={siteContent.sections.achievementsKicker} onChange={(event) => updateContent((content) => ({ ...content, sections: { ...content.sections, achievementsKicker: event.target.value } }))} />
          </label>
          <label>
            成果标题
            <input value={siteContent.sections.achievementsTitle} onChange={(event) => updateContent((content) => ({ ...content, sections: { ...content.sections, achievementsTitle: event.target.value } }))} />
          </label>
          <label>
            联系英文小标题
            <input value={siteContent.sections.contactKicker} onChange={(event) => updateContent((content) => ({ ...content, sections: { ...content.sections, contactKicker: event.target.value } }))} />
          </label>
          <label>
            联系标题
            <input value={siteContent.sections.contactTitle} onChange={(event) => updateContent((content) => ({ ...content, sections: { ...content.sections, contactTitle: event.target.value } }))} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>团队成果</legend>
        {(['papers', 'projects', 'cases'] as AchievementGroup[]).map((group) => {
          const config = achievementConfig[group];

          return (
            <div key={group} className="admin-achievement-group">
              <label>
                {config.label}标题
                <input
                  value={siteContent.achievements[config.titleKey]}
                  onChange={(event) =>
                    updateContent((content) => ({
                      ...content,
                      achievements: { ...content.achievements, [config.titleKey]: event.target.value }
                    }))
                  }
                />
              </label>
              <div className="admin-repeater-title">
                <span>{config.label}条目</span>
                <button type="button" onClick={() => addAchievement(group)}>新增条目</button>
              </div>
              {siteContent.achievements[group].map((item, index) => (
                <div key={`${item.title}-${index}`} className="admin-repeater-row admin-repeater-row-stack">
                  <input value={item.title} placeholder="标题" onChange={(event) => updateAchievement(group, index, { title: event.target.value })} />
                  <input value={item.tag} placeholder="标签" onChange={(event) => updateAchievement(group, index, { tag: event.target.value })} />
                  <textarea value={String(item[config.detailKey] ?? '')} placeholder={config.detailLabel} onChange={(event) => updateAchievement(group, index, { [config.detailKey]: event.target.value })} />
                  <button type="button" onClick={() => removeAchievement(group, index)}>删除</button>
                </div>
              ))}
            </div>
          );
        })}
      </fieldset>

      <fieldset>
        <legend>合作联系</legend>
        <label>
          联系说明
          <textarea value={siteContent.contact.description} onChange={(event) => updateContent((content) => ({ ...content, contact: { ...content.contact, description: event.target.value } }))} />
        </label>
        <div className="admin-inline-grid">
          <label>
            邮箱标签
            <input value={siteContent.contact.emailLabel} onChange={(event) => updateContent((content) => ({ ...content, contact: { ...content.contact, emailLabel: event.target.value } }))} />
          </label>
          <label>
            电话标签
            <input value={siteContent.contact.phoneLabel} onChange={(event) => updateContent((content) => ({ ...content, contact: { ...content.contact, phoneLabel: event.target.value } }))} />
          </label>
          <label>
            地址标签
            <input value={siteContent.contact.addressLabel} onChange={(event) => updateContent((content) => ({ ...content, contact: { ...content.contact, addressLabel: event.target.value } }))} />
          </label>
          <label>
            地址
            <input value={siteContent.contact.address} onChange={(event) => updateContent((content) => ({ ...content, contact: { ...content.contact, address: event.target.value } }))} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>页脚</legend>
        <label>
          页脚小标题
          <input value={siteContent.footer.kicker} onChange={(event) => updateContent((content) => ({ ...content, footer: { ...content.footer, kicker: event.target.value } }))} />
        </label>
        <label>
          页脚文字
          <input value={siteContent.footer.text} onChange={(event) => updateContent((content) => ({ ...content, footer: { ...content.footer, text: event.target.value } }))} />
        </label>
      </fieldset>
    </div>
  );
}

function getImageExtension(file: File) {
  const byType: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp'
  };

  return byType[file.type] ?? null;
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      const result = String(reader.result ?? '');
      const [, content = ''] = result.split(',');
      resolve(content);
    });
    reader.addEventListener('error', () => reject(new Error('照片读取失败')));
    reader.readAsDataURL(file);
  });
}

function toSafeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function createBlankMember(existingMembers: Member[]): Member {
  const nextIndex = existingMembers.length + 1;
  let slug = `new-member-${nextIndex}`;
  let suffix = nextIndex;
  const usedSlugs = new Set(existingMembers.map((member) => member.slug));

  while (usedSlugs.has(slug)) {
    suffix += 1;
    slug = `new-member-${suffix}`;
  }

  return {
    slug,
    name: '新成员',
    role: '核心成员',
    organization: '贵州轻工职业技术大学',
    phone: '',
    email: '',
    direction: '',
    certificate: '',
    bio: '',
    tags: [],
    photo: '/members/zou-yan.png'
  };
}

function cloneMember(member: Member): Member {
  return {
    ...member,
    tags: [...member.tags]
  };
}

function cloneSiteContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content)) as SiteContent;
}

function navLabel(key: string) {
  const labels: Record<string, string> = {
    profile: '名片',
    overview: '总览',
    members: '成员',
    achievements: '成果',
    contact: '联系'
  };

  return labels[key] ?? key;
}

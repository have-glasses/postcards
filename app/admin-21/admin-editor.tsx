'use client';

import { useMemo, useState } from 'react';
import type { Member } from '../data';

type SaveState = {
  status: 'idle' | 'saving' | 'success' | 'error';
  message: string;
};

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

export function AdminEditor({ initialMembers }: { initialMembers: Member[] }) {
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<Member[]>(() => initialMembers.map(cloneMember));
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle', message: '' });
  const [activeSlug, setActiveSlug] = useState(initialMembers[0]?.slug ?? '');

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
    setSaveState({ status: 'idle', message: '' });
  }

  async function saveMembers() {
    setSaveState({ status: 'saving', message: '保存中...' });

    try {
      const response = await fetch('/api/admin-21/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, members })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? '保存失败');
      }

      setSaveState({
        status: 'success',
        message: result.commit ? `已保存，提交 ${result.commit.slice(0, 7)}` : '已保存'
      });
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
            <h1>成员编辑</h1>
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
          <button className="primary-action" type="button" onClick={saveMembers} disabled={saveState.status === 'saving'}>
            {saveState.status === 'saving' ? '保存中' : '保存'}
          </button>
        </div>

        {saveState.message ? <p className={`admin-status admin-status-${saveState.status}`}>{saveState.message}</p> : null}

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
      </section>
    </main>
  );
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
    organization: '贵州轻工职业大学',
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

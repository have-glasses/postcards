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

        <div className="admin-layout">
          <aside className="admin-member-list">
            {members.map((member) => (
              <button
                key={member.slug}
                type="button"
                className={member.slug === activeMember?.slug ? 'active' : ''}
                onClick={() => setActiveSlug(member.slug)}
              >
                <span>{member.name}</span>
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

function cloneMember(member: Member): Member {
  return {
    ...member,
    tags: [...member.tags]
  };
}

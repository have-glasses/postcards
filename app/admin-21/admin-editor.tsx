'use client';

import { useMemo, useState } from 'react';
import type { Member } from '../data';

type SaveState = {
  status: 'idle' | 'saving' | 'success' | 'error';
  message: string;
};

type PendingPhoto = {
  content: string;
  filename: string;
  path: string;
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
  const [pendingPhotos, setPendingPhotos] = useState<Record<string, PendingPhoto>>({});
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

  async function saveMembers() {
    setSaveState({ status: 'saving', message: '保存中...' });

    try {
      const response = await fetch('/api/admin-21/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, members, photos: Object.values(pendingPhotos) })
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
      </section>
    </main>
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

import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import type { Member } from '../../../data';

export const runtime = 'nodejs';

const MEMBERS_PATH = 'app/members.json';

type SaveRequest = {
  password?: string;
  members?: unknown;
};

function hashValue(value: string) {
  return createHash('sha256').update(value).digest();
}

function isPasswordValid(input: string) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return false;
  }

  return timingSafeEqual(hashValue(input), hashValue(expected));
}

function isMember(value: unknown): value is Member {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const member = value as Record<string, unknown>;
  const requiredTextFields = [
    'slug',
    'name',
    'role',
    'organization',
    'phone',
    'email',
    'direction',
    'certificate',
    'bio',
    'photo'
  ];

  return (
    requiredTextFields.every((field) => typeof member[field] === 'string') &&
    Array.isArray(member.tags) &&
    member.tags.every((tag) => typeof tag === 'string')
  );
}

function normalizeMembers(value: unknown) {
  if (!Array.isArray(value) || !value.every(isMember)) {
    throw new Error('成员数据格式不正确');
  }

  const slugs = new Set<string>();

  value.forEach((member) => {
    if (!member.slug.trim() || slugs.has(member.slug)) {
      throw new Error('成员链接标识不能为空或重复');
    }
    slugs.add(member.slug);
  });

  return value.map((member) => ({
    slug: member.slug.trim(),
    name: member.name.trim(),
    role: member.role.trim(),
    organization: member.organization.trim(),
    phone: member.phone.trim(),
    email: member.email.trim(),
    direction: member.direction.trim(),
    certificate: member.certificate.trim(),
    bio: member.bio.trim(),
    tags: member.tags.map((tag) => tag.trim()).filter(Boolean),
    photo: member.photo.trim()
  }));
}

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPO ?? 'have-glasses/postcards';
  const branch = process.env.GITHUB_BRANCH ?? 'master';

  if (!token) {
    throw new Error('缺少 GITHUB_TOKEN 环境变量');
  }

  return { token, repository, branch };
}

async function githubRequest(url: string, init: RequestInit & { token: string }) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${init.token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub 请求失败：${response.status} ${message}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  let body: SaveRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求内容不是有效 JSON' }, { status: 400 });
  }

  if (!body.password || !isPasswordValid(body.password)) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 });
  }

  let normalizedMembers: Member[];

  try {
    normalizedMembers = normalizeMembers(body.members);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '成员数据格式不正确' }, { status: 400 });
  }

  try {
    const { token, repository, branch } = getGitHubConfig();
    const encodedPath = MEMBERS_PATH.split('/').map(encodeURIComponent).join('/');
    const fileUrl = `https://api.github.com/repos/${repository}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    const currentFile = await githubRequest(fileUrl, { method: 'GET', token });
    const content = `${JSON.stringify(normalizedMembers, null, 2)}\n`;

    const result = await githubRequest(`https://api.github.com/repos/${repository}/contents/${encodedPath}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        branch,
        message: 'Update member card data',
        content: Buffer.from(content, 'utf8').toString('base64'),
        sha: currentFile.sha
      })
    });

    return NextResponse.json({
      ok: true,
      commit: result.commit?.sha ?? null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存失败' },
      { status: 500 }
    );
  }
}

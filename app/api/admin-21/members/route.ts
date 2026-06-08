import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import type { Member } from '../../../data';

export const runtime = 'nodejs';

const MEMBERS_PATH = 'app/members.json';
const MEMBER_PHOTO_DIR = 'public/members';

type PhotoUpload = {
  content: string;
  filename: string;
  path: string;
};

type SaveRequest = {
  password?: string;
  members?: unknown;
  photos?: unknown;
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

function normalizePhotos(value: unknown) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('照片数据格式不正确');
  }

  return value.map((photo) => {
    if (!photo || typeof photo !== 'object') {
      throw new Error('照片数据格式不正确');
    }

    const item = photo as Record<string, unknown>;

    if (
      typeof item.content !== 'string' ||
      typeof item.filename !== 'string' ||
      typeof item.path !== 'string'
    ) {
      throw new Error('照片数据格式不正确');
    }

    const filename = item.filename.trim().toLowerCase();

    if (!/^[a-z0-9-]+\.(png|jpg|jpeg|webp)$/.test(filename)) {
      throw new Error('照片文件名不正确');
    }

    if (item.path !== `/members/${filename}`) {
      throw new Error('照片路径不正确');
    }

    if (!/^[A-Za-z0-9+/=]+$/.test(item.content)) {
      throw new Error('照片内容不正确');
    }

    if (Buffer.from(item.content, 'base64').length > 3 * 1024 * 1024) {
      throw new Error('照片不能超过 3MB');
    }

    return {
      content: item.content,
      filename,
      path: item.path
    };
  });
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

async function getGitHubFileSha(repository: string, path: string, branch: string, token: string) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(
    `https://api.github.com/repos/${repository}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub 请求失败：${response.status} ${message}`);
  }

  const file = await response.json();
  return typeof file.sha === 'string' ? file.sha : null;
}

async function updateGitHubFile({
  branch,
  content,
  message,
  path,
  repository,
  token
}: {
  branch: string;
  content: string;
  message: string;
  path: string;
  repository: string;
  token: string;
}) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const sha = await getGitHubFileSha(repository, path, branch, token);
  const body: Record<string, string> = {
    branch,
    content,
    message
  };

  if (sha) {
    body.sha = sha;
  }

  return githubRequest(`https://api.github.com/repos/${repository}/contents/${encodedPath}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body)
  });
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
  let normalizedPhotos: PhotoUpload[];

  try {
    normalizedMembers = normalizeMembers(body.members);
    normalizedPhotos = normalizePhotos(body.photos);
    const memberPhotoPaths = new Set(normalizedMembers.map((member) => member.photo));

    if (normalizedPhotos.some((photo) => !memberPhotoPaths.has(photo.path))) {
      throw new Error('上传照片必须对应成员照片路径');
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '成员数据格式不正确' }, { status: 400 });
  }

  try {
    const { token, repository, branch } = getGitHubConfig();
    const uploadedFiles = [];

    for (const photo of normalizedPhotos) {
      const photoPath = `${MEMBER_PHOTO_DIR}/${photo.filename}`;
      const result = await updateGitHubFile({
        branch,
        content: photo.content,
        message: `Upload member photo ${photo.filename}`,
        path: photoPath,
        repository,
        token
      });
      uploadedFiles.push({
        path: photo.path,
        commit: result.commit?.sha ?? null
      });
    }

    const content = `${JSON.stringify(normalizedMembers, null, 2)}\n`;
    const result = await updateGitHubFile({
      branch,
      content: Buffer.from(content, 'utf8').toString('base64'),
      message: 'Update member card data',
      path: MEMBERS_PATH,
      repository,
      token
    });

    return NextResponse.json({
      ok: true,
      uploadedFiles,
      commit: result.commit?.sha ?? null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存失败' },
      { status: 500 }
    );
  }
}

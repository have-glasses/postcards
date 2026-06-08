import { ImageResponse } from 'next/og';
import { getMemberBySlug } from '../../../data';
import { siteName, siteUrl } from '../../../site';

export const runtime = 'edge';

const imageSize = {
  width: 1200,
  height: 630
};

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const member = getMemberBySlug(params.slug);

  if (!member) {
    return new ImageResponse(
      (
        <div
          style={{
            alignItems: 'center',
            background: '#020617',
            color: '#e2e8f0',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          未找到成员
        </div>
      ),
      {
        ...imageSize
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 52%, #082f49 100%)',
          color: '#f8fafc',
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
          padding: 54,
          position: 'relative',
          width: '100%'
        }}
      >
        <div
          style={{
            background: 'radial-gradient(circle at 18% 12%, rgba(103, 232, 249, 0.25), transparent 32%)',
            display: 'flex',
            inset: 0,
            position: 'absolute'
          }}
        />
        <div
          style={{
            border: '1px solid rgba(125, 211, 252, 0.32)',
            borderRadius: 38,
            boxShadow: '0 26px 70px rgba(2, 6, 23, 0.5)',
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            style={{
              display: 'flex',
              height: '100%',
              position: 'relative',
              width: 390
            }}
          >
            <img
              src={`${siteUrl}${member.photo}`}
              alt={member.name}
              style={{
                height: '100%',
                objectFit: 'cover',
                width: '100%'
              }}
            />
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.72)',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '46px 54px'
            }}
          >
            <div
              style={{
                color: '#bae6fd',
                display: 'flex',
                fontSize: 23,
                letterSpacing: 5,
                marginBottom: 28
              }}
            >
              PERSONAL CARD
            </div>

            <div
              style={{
                color: '#ffffff',
                display: 'flex',
                fontSize: 76,
                fontWeight: 800,
                lineHeight: 1.05
              }}
            >
              {member.name}
            </div>

            <div
              style={{
                color: '#cffafe',
                display: 'flex',
                fontSize: 28,
                marginTop: 18
              }}
            >
              {member.role}
            </div>

            <div
              style={{
                color: '#e2e8f0',
                display: 'flex',
                fontSize: 26,
                lineHeight: 1.55,
                marginTop: 32,
                maxWidth: 610
              }}
            >
              {member.organization}
            </div>

            <div
              style={{
                color: '#cbd5e1',
                display: 'flex',
                fontSize: 23,
                lineHeight: 1.5,
                marginTop: 26,
                maxWidth: 640
              }}
            >
              {member.direction}
            </div>

            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: 14,
                marginTop: 'auto'
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #67e8f9, #818cf8)',
                  borderRadius: 999,
                  color: '#020617',
                  display: 'flex',
                  fontSize: 23,
                  fontWeight: 700,
                  padding: '11px 22px'
                }}
              >
                电子名片
              </div>
              <div
                style={{
                  color: '#94a3b8',
                  display: 'flex',
                  fontSize: 21
                }}
              >
                {siteName}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...imageSize
    }
  );
}

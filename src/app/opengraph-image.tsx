import { ImageResponse } from 'next/og'
import { site } from '../lib/config'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  const title = site.name
  const subtitle = 'Smart deals • True delivered price'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 35%, #1e3a8a 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
            }}
          >
            ⚡
          </div>
          <div style={{ color: 'white', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' }}>{title}</div>
        </div>

        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.05 }}>
            Find the smartest deals
          </div>
          <div style={{ fontSize: 28, opacity: 0.85 }}>{subtitle}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22 }}>
            Compare item price + delivery + memberships
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22 }}>{new URL(site.url).host}</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

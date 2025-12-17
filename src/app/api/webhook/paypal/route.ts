import { NextRequest, NextResponse } from 'next/server'

// Minimal PayPal webhook echo. Add signature verification with PAYPAL_WEBHOOK_ID.
export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('PayPal webhook received', body.event_type)
  return NextResponse.json({ ok: true })
}

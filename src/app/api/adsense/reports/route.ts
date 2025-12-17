import { NextResponse } from 'next/server'

// Placeholder endpoint. Replace with real Google Ads/AdSense Reporting API client.
export async function GET() {
  const mock = {
    date: new Date().toISOString().slice(0,10),
    pageViews: 1234,
    clicks: 56,
    estRevenueGBP: 12.34
  }
  return NextResponse.json(mock)
}

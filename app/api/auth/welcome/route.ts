import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { email, name, role } = await req.json()
  try {
    await sendWelcomeEmail(email, name, role)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}

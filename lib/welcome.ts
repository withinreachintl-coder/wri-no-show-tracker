import { Resend } from 'resend'

export async function sendWelcomeEmail(to: string, orgName: string) {
  const key = process.env.RESEND_API_KEY
  if (!key || key.startsWith('__')) {
    console.log('[welcome] RESEND_API_KEY not configured; skipping')
    return { skipped: true }
  }
  const resend = new Resend(key)
  const from = process.env.RESEND_FROM || 'noreply@wireach.tools'
  try {
    const result = await resend.emails.send({
      from: `No-Show Tracker <${from}>`,
      to,
      subject: 'Welcome to No-Show Tracker',
      text:
        `Welcome to No-Show Tracker.\n\n` +
        `You're set up under "${orgName}". Free tier includes 10 incidents.\n\n` +
        `Log your first one: https://tracker.wireach.tools/log\n` +
        `Manage workers: https://tracker.wireach.tools/workers\n\n` +
        `Reply if you need help.\n\n— Within Reach`,
    })
    return { id: result.data?.id }
  } catch (err) {
    console.error('[welcome] send failed:', err instanceof Error ? err.message : String(err))
    return { error: true }
  }
}

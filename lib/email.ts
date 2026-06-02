import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(key)
  }
  return _resend
}

const FROM = process.env.EMAIL_FROM ?? 'DevKnow <noreply@devknow.dev>'

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'パスワードリセットのご案内 | DevKnow',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">パスワードをリセット</h2>
        <p style="color:#6b7280;font-size:14px;margin-bottom:24px">
          以下のボタンからパスワードをリセットしてください。リンクは1時間有効です。
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
          パスワードをリセットする
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          このメールに心当たりがない場合は無視してください。
        </p>
      </div>
    `,
  })
}

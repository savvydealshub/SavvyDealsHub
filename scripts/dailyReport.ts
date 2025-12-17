import nodemailer from 'nodemailer'

const {
  REPORTS_FROM, REPORTS_TO, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
} = process.env

async function main() {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })

  const text = `Daily Earnings Report
- Page views: 1234
- Clicks: 56
- Estimated Revenue: £12.34`

  const info = await transporter.sendMail({
    from: REPORTS_FROM, to: REPORTS_TO, subject: 'SavvyDealsHub — Daily Earnings', text
  })

  console.log('Report sent:', info.messageId)
}

main().catch(err=>{ console.error(err); process.exit(1) })

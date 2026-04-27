interface SupporterEmailProps {
  supporterName:  string
  creatorName:    string
  amount:         number
  message:        string | null
  thankYouMsg:    string | null
  profileUrl:     string
}

interface CreatorEmailProps {
  creatorName:    string
  supporterName:  string
  amount:         number
  message:        string | null
  dashboardUrl:   string
}

function formatAmount(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(paise / 100)
}

export function supporterEmailHtml({
  supporterName,
  creatorName,
  amount,
  message,
  thankYouMsg,
  profileUrl,
}: SupporterEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thanks for your support!</title>
</head>
<body style="margin:0;padding:0;background:#FFFBEB;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:540px;margin:40px auto;background:#FFF7ED;border-radius:16px;border:1px solid #FDE68A;overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#F97316,#FBBF24);padding:32px 40px;text-align:center;">
      <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="font-size:24px;">☕</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">BrewBase</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Your support just landed!</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <h2 style="margin:0 0 8px;color:#1C1917;font-size:20px;">
        Hey ${supporterName}! 👋
      </h2>
      <p style="color:#92400E;margin:0 0 24px;font-size:15px;line-height:1.6;">
        Your <strong style="color:#F97316;">${formatAmount(amount)}</strong> tip to <strong>${creatorName}</strong> was successful. Thank you for supporting creators!
      </p>

      ${message ? `
      <!-- Your message -->
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#92400E;font-weight:600;">Your message</p>
        <p style="margin:0;color:#1C1917;font-size:14px;font-style:italic;">"${message}"</p>
      </div>
      ` : ''}

      ${thankYouMsg ? `
      <!-- Creator's thank you -->
      <div style="background:#fff;border:1px solid #FDE68A;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#92400E;font-weight:600;">Message from ${creatorName}</p>
        <p style="margin:0;color:#1C1917;font-size:14px;">${thankYouMsg}</p>
      </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align:center;margin-top:28px;">
        <a href="${profileUrl}" style="display:inline-block;background:#F97316;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;">
          Visit ${creatorName}&apos;s page
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #FDE68A;text-align:center;">
      <p style="margin:0;font-size:12px;color:#92400E;">
        Sent by <strong>BrewBase</strong> · The warmest way to support creators
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function creatorEmailHtml({
  creatorName,
  supporterName,
  amount,
  message,
  dashboardUrl,
}: CreatorEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>You received a tip!</title>
</head>
<body style="margin:0;padding:0;background:#FFFBEB;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:540px;margin:40px auto;background:#FFF7ED;border-radius:16px;border:1px solid #FDE68A;overflow:hidden;">
    
    <div style="background:linear-gradient(135deg,#F97316,#FBBF24);padding:32px 40px;text-align:center;">
      <span style="font-size:48px;">🎉</span>
      <h1 style="color:#fff;margin:8px 0 0;font-size:22px;font-weight:700;">You just got a tip!</h1>
    </div>

    <div style="padding:32px 40px;">
      <h2 style="margin:0 0 8px;color:#1C1917;font-size:20px;">
        Hey ${creatorName}! ☕
      </h2>
      <p style="color:#92400E;margin:0 0 24px;font-size:15px;line-height:1.6;">
        <strong>${supporterName}</strong> just sent you <strong style="color:#F97316;font-size:18px;">${formatAmount(amount)}</strong>!
      </p>

      ${message ? `
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#92400E;font-weight:600;">They said</p>
        <p style="margin:0;color:#1C1917;font-size:14px;font-style:italic;">"${message}"</p>
      </div>
      ` : '<p style="color:#92400E;margin:0 0 24px;font-size:14px;">They didn\'t leave a message.</p>'}

      <div style="text-align:center;margin-top:28px;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#F97316;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;">
          View your dashboard
        </a>
      </div>
    </div>

    <div style="padding:20px 40px;border-top:1px solid #FDE68A;text-align:center;">
      <p style="margin:0;font-size:12px;color:#92400E;">
        Sent by <strong>BrewBase</strong> · Keep creating amazing things!
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
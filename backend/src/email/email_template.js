// emails/welcomeTemplate.js
export function welcomeTemplate({ name = "Friend", appName = "SyncSpace", ctaUrl = "https://syncspace.app" } = {}) {
    const safeName = String(name).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeApp = String(appName).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const nowYear = new Date().getFullYear();

    return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome to ${safeApp}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" style="background:#f4f6f8;padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <tr>
              <td style="background:linear-gradient(90deg,#2563eb,#38bdf8);color:#fff;padding:30px;text-align:center;">
                <h1 style="margin:0;font-size:24px;">Welcome to ${safeApp} 🎉</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;text-align:left;">
                <p style="font-size:16px;margin-bottom:16px;">Hi ${safeName},</p>
                <p style="font-size:15px;color:#444;margin-bottom:20px;">
                  We're thrilled to have you join <b>${safeApp}</b>! Start chatting, sharing, and connecting instantly with people who matter most.
                </p>
                <a href="${ctaUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
                  Get Started
                </a>
                <p style="font-size:14px;color:#555;margin-top:30px;">
                  If you didn’t create an account, simply ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;text-align:center;background:#f9fafb;font-size:13px;color:#777;">
                © ${nowYear} ${safeApp}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * 邮件发送工具
 *
 * 开发环境：仅打印到控制台
 * 生产环境：通过 Resend API 发送（无需额外依赖）
 *
 * 使用前先注册 Resend (https://resend.com) 并获取 API Key
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'development' || !RESEND_API_KEY) {
    console.log('---[DEV EMAIL]---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.html.replace(/<[^>]*>/g, '')}`);
    console.log('-----------------');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@fraud-cases.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('发送邮件失败:', err);
    throw new Error('邮件发送失败');
  }
}

export function buildVerificationEmailHtml(token: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const link = `${appUrl}/verify-email?token=${token}`;

  return `
    <div style="max-width:480px;margin:0 auto;padding:24px;font-family:sans-serif">
      <h1 style="font-size:20px;margin-bottom:16px">验证您的邮箱</h1>
      <p style="color:#555;line-height:1.6">感谢您注册诈骗案例曝光平台！请点击下方按钮验证您的邮箱地址：</p>
      <a href="${link}"
         style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;margin:16px 0">
        验证邮箱
      </a>
      <p style="color:#999;font-size:12px">或复制以下链接到浏览器：<br/>${link}</p>
      <p style="color:#999;font-size:12px">此链接 24 小时内有效。</p>
    </div>
  `;
}

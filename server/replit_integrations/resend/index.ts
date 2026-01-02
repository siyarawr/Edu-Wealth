import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendChatInviteEmail(toEmail: string, inviterName: string, inviterEmail: string) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const { data, error } = await client.emails.send({
      from: fromEmail || 'Edu Wealth <noreply@resend.dev>',
      to: [toEmail],
      subject: `${inviterName} invited you to chat on Edu Wealth`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0d9488; margin-bottom: 20px;">You've been invited to chat!</h1>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            <strong>${inviterName}</strong> (${inviterEmail}) has invited you to a secure 1-on-1 conversation on Edu Wealth.
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Edu Wealth is a comprehensive student platform for financial management, seminar planning, and secure communication.
          </p>
          <div style="margin: 30px 0;">
            <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://eduwealth.replit.app'}/chat" 
               style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Join Conversation
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            If you don't have an account, you'll be prompted to sign up when you click the link.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">
            This email was sent by Edu Wealth. If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Failed to send chat invite email:', error);
    throw error;
  }
}

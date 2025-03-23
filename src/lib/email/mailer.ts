import nodemailer, { SentMessageInfo } from 'nodemailer';

// Email templates
export interface EmailTemplate {
  subject: string;
  html: string;
}

// Create a test account if no environment variables are set
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
};

// Get email configuration from environment variables or create test account
const getEmailConfig = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  console.log('Email credentials not found in environment variables. Using test account.');
  return await createTestAccount();
};

// Send email with the provided template
export async function sendEmail(to: string, template: EmailTemplate): Promise<{ success: boolean; info?: SentMessageInfo; error?: Error }> {
  try {
    const config = await getEmailConfig();
    const transporter = nodemailer.createTransport(config);

    const fromEmail = process.env.EMAIL_FROM || 'no-reply@inventorycontrol.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Sistema de Controle de Estoque';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent:', info.messageId);

    // If using test account, log the URL to preview email
    if (config.host === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error as Error };
  }
}

// Generate password reset template
export function generatePasswordResetTemplate(username: string, resetLink: string): EmailTemplate {
  return {
    subject: 'Redefinição de Senha - Sistema de Controle de Estoque',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #333; font-size: 24px;">Redefinição de Senha</h1>
        </div>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">Olá ${username},</p>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Recebemos uma solicitação para redefinir sua senha. Se você não solicitou uma nova senha, ignore este email.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4A6CF7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Redefinir Senha
          </a>
        </div>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Ou copie e cole o link abaixo em seu navegador:
        </p>

        <p style="color: #0066cc; font-size: 14px; word-break: break-all;">
          ${resetLink}
        </p>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Este link expirará em 1 hora por motivos de segurança.
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 14px;">
          <p>Sistema de Controle de Estoque</p>
          <p>Esta é uma mensagem automática, por favor não responda.</p>
        </div>
      </div>
    `,
  };
}

// Generate welcome email template
export function generateWelcomeTemplate(username: string, loginLink: string): EmailTemplate {
  return {
    subject: 'Bem-vindo ao Sistema de Controle de Estoque',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #333; font-size: 24px;">Bem-vindo!</h1>
        </div>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">Olá ${username},</p>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Sua conta no Sistema de Controle de Estoque foi criada com sucesso.
        </p>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Agora você pode acessar todas as funcionalidades do sistema e gerenciar seu inventário de forma eficiente.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginLink}" style="background-color: #4A6CF7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Acessar o Sistema
          </a>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 14px;">
          <p>Sistema de Controle de Estoque</p>
          <p>Em caso de dúvidas, entre em contato com o administrador do sistema.</p>
        </div>
      </div>
    `,
  };
}

// Generate low stock notification template
export function generateLowStockTemplate(
  username: string,
  products: Array<{ name: string; current: number; min: number }>
): EmailTemplate {
  const productRows = products.map(product => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${product.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${product.current}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${product.min}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center; color: ${product.current <= product.min / 2 ? '#d32f2f' : '#f57c00'};">
        ${product.current <= product.min / 2 ? 'Crítico' : 'Baixo'}
      </td>
    </tr>
  `).join('');

  return {
    subject: 'Alerta de Estoque Baixo - Sistema de Controle de Estoque',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #f57c00; font-size: 24px;">⚠️ Alerta de Estoque Baixo</h1>
        </div>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">Olá ${username},</p>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Os seguintes produtos estão com estoque abaixo do nível mínimo e precisam de atenção:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Produto</th>
              <th style="padding: 10px; text-align: center;">Estoque Atual</th>
              <th style="padding: 10px; text-align: center;">Estoque Mínimo</th>
              <th style="padding: 10px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Por favor, faça a reposição destes itens o mais breve possível para evitar interrupções nas operações.
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 14px;">
          <p>Sistema de Controle de Estoque</p>
          <p>Este é um email automático enviado pelo sistema. Por favor, não responda.</p>
        </div>
      </div>
    `,
  };
}

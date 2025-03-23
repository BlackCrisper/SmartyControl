import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/sqlserver-operations';
import { randomBytes } from 'crypto';
import { executeQuery } from '@/lib/db/sqlserver';
import { sendEmail, generatePasswordResetTemplate } from '@/lib/email/mailer';

// Process a reset password request
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);

    // Generate a reset token even if user doesn't exist
    // This prevents user enumeration attacks
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    if (user) {
      // Store token in database
      const query = `
        INSERT INTO PasswordResets (user_id, token, expires_at)
        VALUES (@param0, @param1, @param2)
      `;

      try {
        await executeQuery(query, [user.id, token, expiresAt]);

        // Generate reset link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        // Send password reset email
        const emailTemplate = generatePasswordResetTemplate(user.name, resetLink);
        await sendEmail(email, emailTemplate);

        console.log('Password reset email sent to:', email);
      } catch (error) {
        console.error('Error storing reset token:', error);
      }
    }

    // Always return success to prevent user enumeration
    return NextResponse.json(
      { message: 'Se sua conta existir, você receberá um email com instruções para redefinir sua senha' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing password reset:', error);
    return NextResponse.json(
      { message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}

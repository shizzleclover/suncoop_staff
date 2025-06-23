/**
 * Email Service
 * Handles email sending using SMTP with app password
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      // SMTP Configuration with App Password
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_APP_PASSWORD // Use app password, not regular password
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email transporter verification failed:', error);
        } else {
          logger.info('✅ Email service is ready to send messages');
        }
      });

    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  /**
   * Send email
   */
  async sendEmail({ to, subject, text, html, attachments = [] }) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'SunCoop Staff Management',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER
        },
        to,
        subject,
        text,
        html,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${to}`, {
        messageId: result.messageId,
        subject
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.API_BASE_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request - SunCoop Staff Management';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have requested to reset your password for your SunCoop Staff Management account.</p>
            
            <div class="alert">
              <p><strong>Security Notice:</strong> This link will expire in 10 minutes for your security.</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="btn">Reset Your Password</a>
            </p>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 3px;">${resetUrl}</p>

            <p><strong>If you didn't request this password reset, please ignore this email.</strong></p>
            <p>For security reasons, this link will automatically expire in 10 minutes.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SunCoop Staff Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Password Reset Request - SunCoop Staff Management

Hello,

You have requested to reset your password for your SunCoop Staff Management account.

Reset your password by clicking this link: ${resetUrl}

This link will expire in 10 minutes for your security.

If you didn't request this password reset, please ignore this email.

© ${new Date().getFullYear()} SunCoop Staff Management
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user, tempPassword = null) {
    const subject = 'Welcome to SunCoop Staff Management';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to SunCoop</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .credentials { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SunCoop Staff Management</h1>
          </div>
          <div class="content">
            <p>Hello ${user.firstName},</p>
            <p>Welcome to SunCoop Staff Management System! Your account has been created successfully.</p>
            
            <div class="credentials">
              <h3>Your Login Details:</h3>
              <p><strong>Email:</strong> ${user.email}</p>
              ${user.employeeId ? `<p><strong>Employee ID:</strong> ${user.employeeId}</p>` : ''}
              ${tempPassword ? `<p><strong>Temporary Password:</strong> ${tempPassword}</p>
              <p><em>Please change your password after first login for security.</em></p>` : ''}
            </div>

            <p>You can now access your account and:</p>
            <ul>
              <li>View and manage your work shifts</li>
              <li>Track your working hours</li>
              <li>Update your profile information</li>
              <li>Receive important notifications</li>
            </ul>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.API_BASE_URL || 'http://localhost:5173'}" class="btn">Access SunCoop Portal</a>
            </p>

            <p>If you have any questions or need assistance, please don't hesitate to contact your administrator.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SunCoop Staff Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to SunCoop Staff Management!

Hello ${user.firstName},

Your account has been created successfully.

Login Details:
- Email: ${user.email}
${user.employeeId ? `- Employee ID: ${user.employeeId}` : ''}
${tempPassword ? `- Temporary Password: ${tempPassword}` : ''}

${tempPassword ? 'Please change your password after first login for security.' : ''}

Access the portal at: ${process.env.API_BASE_URL || 'http://localhost:5173'}

If you have any questions, please contact your administrator.

© ${new Date().getFullYear()} SunCoop Staff Management
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;

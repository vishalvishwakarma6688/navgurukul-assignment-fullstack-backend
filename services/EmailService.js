import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { ExternalServiceError } from '../utils/errors.js';

const isEmailConfigured = () => Boolean(config.email.user && config.email.pass);

const createTransporter = () => {
    if (!isEmailConfigured()) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email.user,
            pass: config.email.pass.replace(/\s/g, '')
        }
    });
};

export const sendVerificationEmail = async ({ to, name, code }) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn('Email verification skipped: EMAIL_USER and EMAIL_PASS are not configured.');
        return { skipped: true };
    }

    try {
        await transporter.sendMail({
            from: config.email.from,
            to,
            subject: 'Verify your Progressive Study account',
            text: `Hi ${name}, your verification code is ${code}. It expires in ${config.email.verificationMinutes} minutes.`,
            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
                    <h2>Verify your Progressive Study account</h2>
                    <p>Hi ${name},</p>
                    <p>Use this code to verify your email address:</p>
                    <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
                    <p>This code expires in ${config.email.verificationMinutes} minutes.</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Verification email failed:', {
            code: error.code,
            command: error.command,
            response: error.response
        });
        throw new ExternalServiceError(
            'Could not send verification email. Check EMAIL_USER and EMAIL_PASS, then try again.'
        );
    }

    return { skipped: false };
};

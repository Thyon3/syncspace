
import { resendClient, sender } from '../config/resend.js';
import { welcomeTemplate } from './email_template.js';
export const sendWelcomeEmail = async function (email, client, clientUrl) {
    const { data, error } = resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: 'Hello World  ato asnake mengesha you have recieved an email',
        html: welcomeTemplate(),
    });

    if (error) {
        console.error(error);
        throw new Error('failed to send email');
    }
    console.log('welcome email sent successfully', data);
}

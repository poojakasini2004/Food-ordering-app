import nodemailer from 'nodemailer';
import { logger } from './logger';

interface OrderItemForEmail {
  itemNameSnapshot: string;
  quantity: number;
  unitPrice: number;
}

interface SendOrderConfirmationParams {
  customerEmail: string;
  customerName: string;
  orderId: string;
  items: OrderItemForEmail[];
  totalAmount: number;
}

export async function sendOrderConfirmationEmail({
  customerEmail,
  customerName,
  orderId,
  items,
  totalAmount,
}: SendOrderConfirmationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Generate items list HTML
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.itemNameSnapshot} × ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
          $${(item.unitPrice * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join('');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                🍽 SmartX Foods
              </h1>
              <p style="margin: 10px 0 0 0; color: #fed7aa; font-size: 16px;">
                Thank you for trusting our food app!
              </p>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: center;">
              <div style="background-color: #d1fae5; border: 2px solid #6ee7b7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <span style="font-size: 48px;">✅</span>
                <h2 style="margin: 10px 0 5px 0; color: #065f46; font-size: 24px;">Order Confirmed!</h2>
                <p style="margin: 0; color: #047857; font-size: 14px;">Your order has been received and is being prepared.</p>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Dear <strong>${customerName}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                We're delighted to confirm your order from <strong>SmartX Foods</strong>! Our team is preparing your delicious meal with care and attention.
              </p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Order Details</h3>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">
                  <strong>Order ID:</strong> <span style="font-family: monospace; font-size: 12px;">${orderId}</span>
                </p>
              </div>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Your Order</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 16px; background-color: #fef3c7; font-weight: bold; color: #92400e; font-size: 16px;">
                    Total
                  </td>
                  <td style="padding: 16px; background-color: #fef3c7; text-align: right; font-weight: bold; color: #f97316; font-size: 20px;">
                    $${totalAmount.toFixed(2)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Method -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #d1fae5; border: 2px solid #6ee7b7; border-radius: 8px; padding: 15px; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">💵</span>
                <span style="color: #065f46; font-weight: 600; font-size: 15px;">Payment Method: Cash on Delivery</span>
              </div>
            </td>
          </tr>

          <!-- Closing Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                We take pride in serving fresh, delicious food made with quality ingredients. Your satisfaction is our priority!
              </p>
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Thank you again for trusting SmartX Foods!</strong> We hope you enjoy every bite of your meal. We look forward to serving you again soon.
              </p>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="https://yourapp.com/menu" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Order Again
              </a>
              <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                Please visit our app to place your next order!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">
                © 2026 SmartX Foods. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                This email was sent to ${customerEmail}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"SmartX Foods" <${process.env.EMAIL_FROM}>`,
      to: customerEmail,
      subject: 'Thank you for trusting our food app! 🍽️',
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    logger.info('Order confirmation email sent successfully', {
      customerEmail,
      orderId,
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to send order confirmation email', {
      error: String(error),
      customerEmail,
      orderId,
    });

    return {
      success: false,
      error: 'Failed to send confirmation email',
    };
  }
}

export async function sendOrderReadyEmail({
  customerEmail,
  customerName,
  orderId,
  items,
  totalAmount,
}: SendOrderConfirmationParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Log environment check
    if (!process.env.EMAIL_FROM) {
      logger.error('sendOrderReadyEmail: EMAIL_FROM environment variable is missing');
      return {
        success: false,
        error: 'Email configuration error: EMAIL_FROM is missing',
      };
    }

    if (!process.env.EMAIL_APP_PASSWORD) {
      logger.error('sendOrderReadyEmail: EMAIL_APP_PASSWORD environment variable is missing');
      return {
        success: false,
        error: 'Email configuration error: EMAIL_APP_PASSWORD is missing',
      };
    }

    logger.info('sendOrderReadyEmail: Starting email send', {
      customerEmail,
      orderId,
      customerName,
      itemCount: items.length,
      totalAmount,
      emailFrom: process.env.EMAIL_FROM,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const shortOrderId = orderId.slice(-8);

    // Generate simple items list
    const itemsList = items
      .map(
        (item) =>
          `- ${item.itemNameSnapshot} x${item.quantity} — $${(item.unitPrice * item.quantity).toFixed(2)}`
      )
      .join('\n');

    const emailText = `Hi ${customerName},

Great news! Your order #${shortOrderId} is now ready.

Please come and pick up your order.

Here's what you ordered:
${itemsList}

Order Total: $${totalAmount.toFixed(2)}
Payment: Cash on Delivery

Thank you for ordering with us!

SmartX Technologies`;

    // HTML version for better formatting
    const itemsListHtml = items
      .map(
        (item) =>
          `<li style="margin: 8px 0; color: #374151; font-size: 15px;">
            ${item.itemNameSnapshot} <strong>x${item.quantity}</strong> — <strong>$${(item.unitPrice * item.quantity).toFixed(2)}</strong>
          </li>`
      )
      .join('');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                🎉 Your Order is Ready!
              </h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">
                Come and pick it up!
              </p>
            </td>
          </tr>

          <!-- Ready Message -->
          <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: center;">
              <div style="background-color: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 25px;">
                <span style="font-size: 48px;">✅</span>
                <h2 style="margin: 10px 0 5px 0; color: #065f46; font-size: 24px;">Great news!</h2>
                <p style="margin: 0; color: #047857; font-size: 16px;">Your order is ready for pickup.</p>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${customerName}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Your order <strong style="font-family: monospace; background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px;">#${shortOrderId}</strong> is now ready!
              </p>
              <p style="margin: 15px 0 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Please come and pick up your order.
              </p>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Here's what you ordered:</h3>
                <ul style="margin: 0; padding: 0; list-style: none;">
                  ${itemsListHtml}
                </ul>
              </div>
            </td>
          </tr>

          <!-- Order Total -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; text-align: center;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">Order Total</p>
                <p style="margin: 5px 0 0 0; color: #f97316; font-size: 28px; font-weight: bold;">
                  $${totalAmount.toFixed(2)}
                </p>
              </div>
            </td>
          </tr>

          <!-- Payment Method -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #d1fae5; border: 2px solid #6ee7b7; border-radius: 8px; padding: 15px; text-align: center;">
                <span style="font-size: 24px;">💵</span>
                <span style="color: #065f46; font-weight: 600; font-size: 15px; margin-left: 10px;">Payment: Cash on Delivery</span>
              </div>
            </td>
          </tr>

          <!-- Closing Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Thank you for ordering with us!</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
                SmartX Technologies
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">
                © 2026 SmartX Foods. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                This email was sent to ${customerEmail}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"SmartX Foods" <${process.env.EMAIL_FROM}>`,
      to: customerEmail,
      subject: 'Your order is ready for pickup! 🎉',
      text: emailText,
      html: emailHtml,
    };

    logger.info('sendOrderReadyEmail: Sending email via transporter', {
      to: customerEmail,
      from: mailOptions.from,
      subject: mailOptions.subject,
    });

    await transporter.sendMail(mailOptions);

    logger.info('sendOrderReadyEmail: Email sent successfully', {
      customerEmail,
      orderId: shortOrderId,
    });

    return { success: true };
  } catch (error) {
    logger.error('sendOrderReadyEmail: Failed to send email', {
      error: String(error),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      customerEmail,
      orderId,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send order ready email',
    };
  }
}

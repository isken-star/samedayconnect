import { ConsoleEmailProvider } from "./consoleProvider";
import { PostmarkEmailProvider } from "./postmarkProvider";
import { SendGridEmailProvider } from "./sendgridProvider";
import type { EmailProvider } from "./provider";

export function getEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ?? "console").toLowerCase();
  const fromEmail = process.env.EMAIL_FROM ?? "no-reply@samedayconnect.co.uk";

  if (provider === "postmark") {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    if (!token) {
      throw new Error("Missing POSTMARK_SERVER_TOKEN for postmark email provider.");
    }
    return new PostmarkEmailProvider(token, fromEmail);
  }

  if (provider === "sendgrid") {
    const token = process.env.SENDGRID_API_KEY;
    if (!token) {
      throw new Error("Missing SENDGRID_API_KEY for sendgrid email provider.");
    }
    return new SendGridEmailProvider(token, fromEmail);
  }

  // TODO: add additional transactional email providers as needed.
  return new ConsoleEmailProvider();
}

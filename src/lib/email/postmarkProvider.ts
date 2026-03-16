import type {
  EmailProvider,
  SendJoinApplicationNotificationInput,
  SendMagicLinkInput,
} from "./provider";
import { formatJoinApplicationNotificationText } from "./provider";

export class PostmarkEmailProvider implements EmailProvider {
  constructor(
    private readonly serverToken: string,
    private readonly fromEmail: string,
  ) {}

  async sendMagicLink(input: SendMagicLinkInput): Promise<void> {
    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": this.serverToken,
      },
      body: JSON.stringify({
        From: this.fromEmail,
        To: input.toEmail,
        Subject: "Your Same Day Connect sign-in link",
        TextBody: `Use this secure sign-in link:\n\n${input.signInUrl}\n\nThis link expires in 15 minutes and can only be used once.`,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Postmark send failed (${response.status}): ${body}`);
    }
  }

  async sendJoinApplicationNotification(
    input: SendJoinApplicationNotificationInput,
  ): Promise<void> {
    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": this.serverToken,
      },
      body: JSON.stringify({
        From: this.fromEmail,
        To: input.toEmail,
        Subject: `New join application from ${input.fullName}`,
        TextBody: formatJoinApplicationNotificationText(input),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Postmark send failed (${response.status}): ${body}`);
    }
  }
}

import type { EmailProvider, SendMagicLinkInput } from "./provider";

export class SendGridEmailProvider implements EmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string,
  ) {}

  async sendMagicLink(input: SendMagicLinkInput): Promise<void> {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: { email: this.fromEmail },
        personalizations: [{ to: [{ email: input.toEmail }] }],
        subject: "Your Same Day Connect sign-in link",
        content: [
          {
            type: "text/plain",
            value: `Use this secure sign-in link:\n\n${input.signInUrl}\n\nThis link expires in 15 minutes and can only be used once.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`SendGrid send failed (${response.status}): ${body}`);
    }
  }
}

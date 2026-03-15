import type { EmailProvider, SendMagicLinkInput } from "./provider";

export class ConsoleEmailProvider implements EmailProvider {
  async sendMagicLink(input: SendMagicLinkInput): Promise<void> {
    console.info(
      `[magic-link] to=${input.toEmail} url=${input.signInUrl} (TODO: replace with Postmark/SendGrid provider in production)`,
    );
  }
}

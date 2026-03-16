import type {
  EmailProvider,
  SendJoinApplicationNotificationInput,
  SendMagicLinkInput,
} from "./provider";
import { formatJoinApplicationNotificationText } from "./provider";

export class ConsoleEmailProvider implements EmailProvider {
  async sendMagicLink(input: SendMagicLinkInput): Promise<void> {
    console.info(
      `[magic-link] to=${input.toEmail} url=${input.signInUrl} (TODO: replace with Postmark/SendGrid provider in production)`,
    );
  }

  async sendJoinApplicationNotification(
    input: SendJoinApplicationNotificationInput,
  ): Promise<void> {
    console.info(
      `[join-application] to=${input.toEmail}\n${formatJoinApplicationNotificationText(input)}`,
    );
  }
}

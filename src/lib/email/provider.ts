export interface SendMagicLinkInput {
  toEmail: string;
  signInUrl: string;
}

export interface SendJoinApplicationNotificationInput {
  toEmail: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  areasCovered: string;
  vanType: "SMALL" | "MEDIUM" | "LARGE";
  insuranceConfirmed: boolean;
  message?: string | null;
  createdAt: string;
}

export function formatJoinApplicationNotificationText(
  input: SendJoinApplicationNotificationInput,
): string {
  return [
    "A new join application has been submitted via Same Day Connect.",
    "",
    `Full name: ${input.fullName}`,
    `Business name: ${input.businessName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Areas covered: ${input.areasCovered}`,
    `Van type: ${input.vanType}`,
    `Insurance confirmed: ${input.insuranceConfirmed ? "Yes" : "No"}`,
    `Submitted at: ${input.createdAt}`,
    "",
    "Message:",
    input.message?.trim() ? input.message.trim() : "No message provided.",
  ].join("\n");
}

export interface EmailProvider {
  sendMagicLink(input: SendMagicLinkInput): Promise<void>;
  sendJoinApplicationNotification(
    input: SendJoinApplicationNotificationInput,
  ): Promise<void>;
}

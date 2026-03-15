export interface SendMagicLinkInput {
  toEmail: string;
  signInUrl: string;
}

export interface EmailProvider {
  sendMagicLink(input: SendMagicLinkInput): Promise<void>;
}

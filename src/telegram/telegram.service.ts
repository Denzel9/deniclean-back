import { Injectable } from '@nestjs/common';

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

@Injectable()
export class TelegramService {
  private readonly apiBaseUrl: string;
  private readonly chatId: string | undefined;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.apiBaseUrl = token ? `https://api.telegram.org/bot${token}` : '';
  }

  async notifyOrderCreated(text: string, photoUrls: string[]): Promise<void> {
    this.ensureConfigured();

    await this.sendMessage(text);

    if (photoUrls.length === 0) {
      return;
    }

    if (photoUrls.length === 1) {
      await this.sendPhoto(photoUrls[0]);
      return;
    }

    const maxMediaGroupSize = 10;
    for (let i = 0; i < photoUrls.length; i += maxMediaGroupSize) {
      const chunk = photoUrls.slice(i, i + maxMediaGroupSize);
      await this.sendMediaGroup(chunk);
    }
  }

  private ensureConfigured(): void {
    if (!this.apiBaseUrl || !this.chatId) {
      throw new Error(
        'Telegram is not configured: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required',
      );
    }
  }

  private async sendMessage(text: string): Promise<void> {
    await this.post('sendMessage', {
      chat_id: this.chatId,
      text,
      parse_mode: 'MarkdownV2',
    });
  }

  private async sendPhoto(photoUrl: string): Promise<void> {
    await this.post('sendPhoto', {
      chat_id: this.chatId,
      photo: photoUrl,
    });
  }

  private async sendMediaGroup(photoUrls: string[]): Promise<void> {
    const media = photoUrls.map((url) => ({
      type: 'photo',
      media: url,
    }));

    await this.post('sendMediaGroup', {
      chat_id: this.chatId,
      media,
    });
  }

  private async post(
    method: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Telegram API ${method} failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as TelegramResponse<unknown>;
    if (!data.ok) {
      throw new Error(
        `Telegram API ${method} failed: ${data.description ?? 'unknown error'}`,
      );
    }
  }
}

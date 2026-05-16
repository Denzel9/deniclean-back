import { MeasurementType, Order, OrderItem } from '@prisma/client';

type OrderWithItems = Order & { items: OrderItem[] };

const markdownV2ReservedChars = /([_*\[\]()~`>#+\-=|{}.!\\])/g;

function escapeMarkdownV2(text?: string | null): string {
  if (!text) {
    return '';
  }

  return text.replace(markdownV2ReservedChars, '\\$1');
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatMeasurement(item: OrderItem): string {
  if (
    item.measurementType === MeasurementType.SQUARE_METERS &&
    item.squareMeters
  ) {
    return `${toNumber(item.squareMeters)} м²`;
  }

  if (
    item.measurementType === MeasurementType.DIMENSIONS &&
    item.lengthMeters &&
    item.widthMeters
  ) {
    return `${toNumber(item.lengthMeters)} x ${toNumber(item.widthMeters)} м`;
  }

  return '';
}

export function buildOrderTelegramMessage(order: OrderWithItems): string {
  const cartItemsText = order.items
    .map((item, index) => {
      const itemTotal = item.price * item.quantity;
      const measurement = formatMeasurement(item);
      const itemTitle = measurement
        ? `${escapeMarkdownV2(item.name)} ${escapeMarkdownV2(measurement)}`
        : escapeMarkdownV2(item.name);

      return [
        `*${index + 1}\\. ${itemTitle}*`,
        `└─ Кол\\-во: ${item.quantity}`,
        `└─ Базовая цена: ${item.price}₽`,
        `└─ *Итого по позиции: ${itemTotal}₽*`,
      ].join('\n');
    })
    .join('\n\n');

  const formattedTotal = new Intl.NumberFormat('ru-RU').format(
    order.total ?? 0,
  );

  return `
*Новая заявка\\!*
  
*Клиент*
└─ *Имя:* ${escapeMarkdownV2(order.customerName) || 'Не указано'}
└─ *Откуда:* Корзина
└─ *Телефон:* ${escapeMarkdownV2(order.customerPhone)}
└─ *Адрес:* ${escapeMarkdownV2(order.customerAddress)}
  
*Заказ*
${cartItemsText || 'Корзина пуста'}
  
*Стоимость*
└─ *Общая сумма:* ${formattedTotal}₽
└─ *Количество позиций:* ${order.items.length}
  
*Дата и время*
_${escapeMarkdownV2(
    new Date(order.createdAt).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  )}_
  `.trim();
}

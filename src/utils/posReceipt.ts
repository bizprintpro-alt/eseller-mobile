import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface ReceiptData {
  orderId: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  vatAmount: number;
  total: number;
  paymentMethod: 'cash' | 'qpay' | 'card' | string;
  cashReceived?: number;
  change?: number;
  shopName?: string;
}

const METHOD_LABEL: Record<string, string> = {
  cash: 'Бэлэн мөнгө',
  qpay: 'QPay',
  card: 'Карт',
};

function buildHtml(data: ReceiptData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:4px 0">${escapeHtml(item.name)}</td>
          <td style="text-align:center">${item.qty}</td>
          <td style="text-align:right">${item.price.toLocaleString()}₮</td>
          <td style="text-align:right">${(item.qty * item.price).toLocaleString()}₮</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: monospace; font-size: 12px; max-width: 320px; margin: 0 auto; padding: 16px; }
  h2 { text-align: center; font-size: 16px; margin: 0 0 4px; }
  .center { text-align: center; }
  .divider { border-top: 1px dashed #000; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 10px; border-bottom: 1px solid #000; padding: 4px 0; }
  .total { font-size: 14px; font-weight: bold; }
  .footer { text-align: center; margin-top: 16px; font-size: 10px; }
</style>
</head>
<body>
  <h2>${escapeHtml(data.shopName ?? 'eSeller POS')}</h2>
  <p class="center" style="font-size:10px">${new Date().toLocaleString('mn-MN')}</p>
  <p class="center" style="font-size:10px">#${data.orderId.slice(-8).toUpperCase()}</p>
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Бараа</th>
        <th>Тоо</th>
        <th style="text-align:right">Үнэ</th>
        <th style="text-align:right">Дүн</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="divider"></div>
  <table>
    <tr>
      <td>Дүн:</td>
      <td style="text-align:right">${data.subtotal.toLocaleString()}₮</td>
    </tr>
    ${
      data.vatAmount > 0
        ? `<tr>
            <td>НӨАТ (10%):</td>
            <td style="text-align:right">${data.vatAmount.toLocaleString()}₮</td>
          </tr>`
        : ''
    }
    <tr class="total">
      <td>Нийт:</td>
      <td style="text-align:right">${data.total.toLocaleString()}₮</td>
    </tr>
    ${
      data.paymentMethod === 'cash'
        ? `<tr>
            <td>Авсан:</td>
            <td style="text-align:right">${(data.cashReceived ?? 0).toLocaleString()}₮</td>
          </tr>
          <tr>
            <td>Хариулт:</td>
            <td style="text-align:right">${(data.change ?? 0).toLocaleString()}₮</td>
          </tr>`
        : ''
    }
  </table>
  <div class="divider"></div>
  <p class="center">${METHOD_LABEL[data.paymentMethod] ?? data.paymentMethod}</p>
  <p class="footer">Баярлалаа! eseller.mn</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render the receipt HTML to a PDF and offer the user a Share sheet
 * (falling back to native print dialog).
 */
export async function printReceipt(data: ReceiptData): Promise<void> {
  const html = buildHtml(data);
  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Баримт хуваалцах',
        UTI: 'com.adobe.pdf',
      });
    } else {
      await Print.printAsync({ uri });
    }
  } catch (e) {
    console.error('[Receipt]', e instanceof Error ? e.message : e);
    throw e;
  }
}

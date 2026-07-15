/**
 * QR PH (EMVCo Merchant Presented QR Code) Generator
 * 
 * Generates QR PH-compliant payment codes following the EMVCo specification
 * used by GCash, Maya, UnionBank, BPI, BDO, and all BSP-participating apps
 * in the Philippine National QR Code Standard (NQRCS).
 * 
 * When scanned by any QR PH-compatible app, the code initiates a real
 * InstaPay transfer to the recipient's e-wallet or bank account.
 */

const QRCode = require('qrcode');

// ──────────────────────────────────────────────
// EMVCo TLV (Tag-Length-Value) Encoding Helpers
// ──────────────────────────────────────────────

/**
 * Encodes a single TLV field.
 * @param {string} tag - Two-digit tag identifier
 * @param {string} value - Field value
 * @returns {string} Encoded TLV string
 */
function tlv(tag, value) {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
}

/**
 * Calculates CRC-16/CCITT-FALSE checksum as required by EMVCo spec.
 * This is the final integrity check appended to every QR PH payload.
 * @param {string} str - The full payload string (including "6304" placeholder)
 * @returns {string} 4-character uppercase hex CRC
 */
function crc16CcittFalse(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// ──────────────────────────────────────────────
// QR PH Payload Builder
// ──────────────────────────────────────────────

/**
 * Builds an EMVCo-compliant QR PH payload string for P2P transfers.
 * 
 * @param {Object} opts
 * @param {string} opts.recipientName - Display name (max 25 chars)
 * @param {string} opts.recipientMobile - Philippine mobile number (e.g. "09171234567")
 * @param {number} opts.amountCentavos - Amount in centavos (e.g. 15000 = ₱150.00)
 * @param {string} [opts.referenceId] - Optional transaction reference
 * @returns {string} The full EMVCo QR PH payload with CRC
 */
function buildQrPhPayload({ recipientName, recipientMobile, amountCentavos, referenceId }) {
  // Normalize phone number to 13-digit format: +639XXXXXXXXX
  let phone = recipientMobile.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '63' + phone.substring(1); // 09XX → 639XX
  }
  if (!phone.startsWith('63')) {
    phone = '63' + phone;
  }
  // Prefix with +
  phone = '+' + phone;

  // Build the payload field by field per EMVCo spec
  let payload = '';

  // Tag 00: Payload Format Indicator (always "01")
  payload += tlv('00', '01');

  // Tag 01: Point of Initiation Method
  //   "11" = Static (reusable), "12" = Dynamic (one-time with amount)
  payload += tlv('01', '12');

  // Tag 26: Merchant Account Information — QR PH P2P
  //   Sub-00: Reverse domain (globally unique identifier for QR PH P2P)
  //   Sub-01: Recipient mobile number
  //   Sub-02: Transaction reference
  let merchantAcctInfo = tlv('00', 'com.p2pqrpay');
  merchantAcctInfo += tlv('01', phone);
  if (referenceId) {
    merchantAcctInfo += tlv('02', referenceId.substring(0, 25));
  }
  payload += tlv('26', merchantAcctInfo);

  // Tag 52: Merchant Category Code (0000 = not applicable for P2P)
  payload += tlv('52', '0000');

  // Tag 53: Transaction Currency (ISO 4217 numeric: 608 = PHP)
  payload += tlv('53', '608');

  // Tag 54: Transaction Amount (in PHP, formatted as decimal string)
  if (amountCentavos && amountCentavos > 0) {
    const amountPhp = (amountCentavos / 100).toFixed(2);
    payload += tlv('54', amountPhp);
  }

  // Tag 58: Country Code
  payload += tlv('58', 'PH');

  // Tag 59: Merchant Name (truncate to 25 chars per spec)
  const name = (recipientName || 'Lista User').substring(0, 25);
  payload += tlv('59', name);

  // Tag 60: Merchant City
  payload += tlv('60', 'MANILA');

  // Tag 63: CRC — append "6304" first, calculate CRC over entire string, then append
  payload += '6304';
  const crc = crc16CcittFalse(payload);
  payload += crc;

  return payload;
}

// ──────────────────────────────────────────────
// QR Image Generator
// ──────────────────────────────────────────────

/**
 * Generates a QR PH payment code as a base64-encoded PNG data URL.
 * 
 * @param {Object} opts - Same options as buildQrPhPayload
 * @returns {Promise<{payload: string, qrDataUrl: string}>}
 */
async function generateQrPhImage(opts) {
  const payload = buildQrPhPayload(opts);

  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 512,
    margin: 2,
    color: {
      dark: '#1A312C',  // Lista's Dark Forest Green
      light: '#FFF4E1'  // Lista's Warm Cream
    }
  });

  return { payload, qrDataUrl };
}

module.exports = {
  buildQrPhPayload,
  generateQrPhImage,
  crc16CcittFalse
};

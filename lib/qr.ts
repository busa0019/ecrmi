import QRCode from "qrcode";

export async function generateQR(url: string) {
  return await QRCode.toDataURL(url);
}
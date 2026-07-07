import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpay: Razorpay;

export function initRazorpay() {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
}

export async function createRazorpayOrder(
  amountINR: number,
  receipt: string,
): Promise<{ id: string; amount: number; currency: string }> {
  if (!razorpay) initRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(amountINR * 100), // paise
    currency: 'INR',
    receipt,
  });

  return {
    id: order.id,
    amount: order.amount as number,
    currency: order.currency,
  };
}

export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');

  return expectedSignature === params.razorpaySignature;
}

// lib/payment-config.ts
export const PAYMENT_ACCOUNTS = {
  jazzcash: {
    name: "JazzCash",
    accountTitle: "Your Business Name",
    accountNumber: "03001234567",
    logo: "/images/jazzcash-logo.png",
    instructions: [
      "Open JazzCash App or dial *786#",
      "Select 'Send Money'",
      "Enter the account number shown above",
      "Enter the exact amount",
      "Complete the transaction",
      "Take a screenshot of the confirmation",
      "Upload the screenshot below",
    ],
    proofRequired: true,
    expiryHours: 24,
  },
  easypaisa: {
    name: "EasyPaisa",
    accountTitle: "Your Business Name",
    accountNumber: "03011234567",
    logo: "/images/easypaisa-logo.png",
    instructions: [
      "Open EasyPaisa App or dial *786#",
      "Select 'Send Money'",
      "Enter the account number shown above",
      "Enter the exact amount",
      "Complete the transaction",
      "Take a screenshot of the confirmation",
      "Upload the screenshot below",
    ],
    proofRequired: true,
    expiryHours: 24,
  },
  cod: {
    name: "Cash on Delivery",
    logo: "/images/cod-icon.png",
    instructions: [
      "Pay in cash when your order is delivered",
      "Please keep exact change ready",
      "You will receive an SMS before delivery",
    ],
    proofRequired: false,
    additionalFee: 50, // PKR 50 COD fee
  },
};

export const ORDER_STATUSES = {
  PENDING: "Order placed, awaiting payment confirmation",
  PAID: "Payment confirmed, preparing order",
  PROCESSING: "Order is being prepared",
  SHIPPED: "Order has been shipped",
  DELIVERED: "Order delivered successfully",
  CANCELLED: "Order has been cancelled",
  REFUNDED: "Order has been refunded",
};

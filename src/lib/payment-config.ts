// lib/payment-config.ts

export interface PaymentAccountBase {
  name: string;
  logo: string;
  instructions: string[];
  proofRequired: boolean;
}

export interface MobileWalletAccount extends PaymentAccountBase {
  accountTitle: string;
  accountNumber: string;
  expiryHours: number;
  proofRequired: true;
}

export interface CodAccount extends PaymentAccountBase {
  additionalFee: number;
  proofRequired: false;
}

export type PaymentAccount = MobileWalletAccount | CodAccount;

export type PaymentMethodKey = "jazzcash" | "easypaisa" | "cod";

export const PAYMENT_ACCOUNTS: Record<PaymentMethodKey, PaymentAccount> = {
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
    additionalFee: 50,
  },
};

export const ORDER_STATUSES: Record<string, string> = {
  PENDING: "Order placed, awaiting payment confirmation",
  PAID: "Payment confirmed, preparing order",
  PROCESSING: "Order is being prepared",
  SHIPPED: "Order has been shipped",
  DELIVERED: "Order delivered successfully",
  CANCELLED: "Order has been cancelled",
  REFUNDED: "Order has been refunded",
};

// Type guard to check if account is a mobile wallet
export function isMobileWalletAccount(
  account: PaymentAccount
): account is MobileWalletAccount {
  return account.proofRequired === true;
}

// Type guard to check if account is COD
export function isCodAccount(account: PaymentAccount): account is CodAccount {
  return account.proofRequired === false;
}

// Get account by payment method
export function getPaymentAccount(
  method: string | null
): PaymentAccount | null {
  if (!method) return null;
  const key = method.toLowerCase() as PaymentMethodKey;
  return PAYMENT_ACCOUNTS[key] || null;
}

// Get mobile wallet accounts only (for payment proof pages)
export function getMobileWalletAccounts(): Record<string, MobileWalletAccount> {
  const wallets: Record<string, MobileWalletAccount> = {};

  Object.entries(PAYMENT_ACCOUNTS).forEach(([key, account]) => {
    if (isMobileWalletAccount(account)) {
      wallets[key] = account;
    }
  });

  return wallets;
}

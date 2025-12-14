import { FAQ, FAQCategory } from "@/types/faq";
import {
  CreditCard,
  HelpCircle,
  Package,
  RotateCcw,
  Shield,
  Truck,
} from "lucide-react";

export const categories: FAQCategory[] = [
  {
    id: "all",
    name: "All Questions",
    icon: HelpCircle,
    description: "Browse all frequently asked questions",
  },
  {
    id: "orders",
    name: "Orders",
    icon: Package,
    description: "Questions about placing and managing orders",
  },
  {
    id: "shipping",
    name: "Shipping",
    icon: Truck,
    description: "Delivery times, costs, and tracking",
  },
  {
    id: "returns",
    name: "Returns",
    icon: RotateCcw,
    description: "Return policy and procedures",
  },
  {
    id: "payments",
    name: "Payments",
    icon: CreditCard,
    description: "Payment methods and billing",
  },
  {
    id: "account",
    name: "Account",
    icon: Shield,
    description: "Account settings and security",
  },
];

export const faqs: FAQ[] = [
  // Orders
  {
    id: 1,
    question: "How do I place an order?",
    answer:
      "To place an order, simply browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping information and payment details. Once your order is confirmed, you'll receive an email confirmation with your order number.",
    category: "orders",
    helpful: 156,
    notHelpful: 12,
  },
  {
    id: 2,
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "You can modify or cancel your order within 1 hour of placing it. After this window, our fulfillment process begins and changes cannot be made. Contact our customer service team immediately if you need to make changes. For order modifications, please email support@example.com with your order number.",
    category: "orders",
    helpful: 89,
    notHelpful: 8,
  },
  {
    id: 3,
    question: "How can I check my order status?",
    answer:
      "You can check your order status by logging into your account and visiting the 'My Orders' section. Alternatively, use our Order Tracking page with your order number and email address. You'll also receive email updates at each stage of your order's journey.",
    category: "orders",
    helpful: 234,
    notHelpful: 15,
  },
  {
    id: 4,
    question: "What should I do if I receive a damaged or wrong item?",
    answer:
      "If you receive a damaged or incorrect item, please contact us within 48 hours of delivery. Take photos of the damaged item and packaging, then email them to support@example.com along with your order number. We'll arrange for a replacement or refund promptly.",
    category: "orders",
    helpful: 178,
    notHelpful: 5,
  },
  // Shipping
  {
    id: 5,
    question: "What are the shipping options and costs?",
    answer:
      "We offer Standard Shipping (5-7 business days, $5.99), Express Shipping (2-3 business days, $12.99), and Next-Day Delivery ($24.99). Orders over $50 qualify for free standard shipping. Shipping costs are calculated at checkout based on your location and selected method.",
    category: "shipping",
    helpful: 312,
    notHelpful: 18,
  },
  {
    id: 6,
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. Import duties and taxes may apply and are the responsibility of the recipient. Check our shipping page for a complete list of countries we ship to.",
    category: "shipping",
    helpful: 145,
    notHelpful: 22,
  },
  {
    id: 7,
    question: "How can I track my shipment?",
    answer:
      "Once your order ships, you'll receive an email with a tracking number and link. You can also track your order on our Order Tracking page or through your account. Tracking information typically updates within 24 hours of shipment.",
    category: "shipping",
    helpful: 267,
    notHelpful: 9,
  },
  {
    id: 8,
    question: "What happens if my package is lost or delayed?",
    answer:
      "If your package appears lost or is significantly delayed, please contact us. We'll investigate with the carrier and either locate your package or issue a replacement/refund. For delayed packages, we recommend waiting 3 business days past the expected delivery date before contacting us.",
    category: "shipping",
    helpful: 98,
    notHelpful: 7,
  },
  // Returns
  {
    id: 9,
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of delivery for most items in their original condition with tags attached. Items must be unworn, unwashed, and in original packaging. Some items like personalized products, intimates, and sale items may have different return policies.",
    category: "returns",
    helpful: 423,
    notHelpful: 31,
  },
  {
    id: 10,
    question: "How do I initiate a return?",
    answer:
      "To start a return, log into your account, go to 'My Orders,' select the item you wish to return, and click 'Return Item.' You'll receive a prepaid shipping label via email. Pack the item securely and drop it off at the designated carrier location.",
    category: "returns",
    helpful: 356,
    notHelpful: 19,
  },
  {
    id: 11,
    question: "How long does it take to process a refund?",
    answer:
      "Once we receive your return, inspection takes 2-3 business days. After approval, refunds are processed within 5-7 business days. The refund will appear on your original payment method. Credit card refunds may take an additional 3-5 days to reflect on your statement.",
    category: "returns",
    helpful: 289,
    notHelpful: 24,
  },
  {
    id: 12,
    question: "Can I exchange an item instead of returning it?",
    answer:
      "Yes! We offer free exchanges for different sizes or colors of the same item. During the return process, select 'Exchange' instead of 'Return' and choose your preferred replacement. We'll ship the new item as soon as we receive your return.",
    category: "returns",
    helpful: 167,
    notHelpful: 11,
  },
  // Payments
  {
    id: 13,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. For orders over $50, we also offer installment payment options through Klarna and Afterpay.",
    category: "payments",
    helpful: 234,
    notHelpful: 8,
  },
  {
    id: 14,
    question: "Is my payment information secure?",
    answer:
      "Absolutely. We use industry-standard SSL encryption to protect your payment information. We are PCI-DSS compliant and never store your complete credit card details on our servers. All transactions are processed through secure, trusted payment gateways.",
    category: "payments",
    helpful: 189,
    notHelpful: 3,
  },
  {
    id: 15,
    question: "Why was my payment declined?",
    answer:
      "Payments may be declined due to insufficient funds, incorrect card details, expired cards, or bank security measures. Please verify your information and try again. If the issue persists, contact your bank or try a different payment method.",
    category: "payments",
    helpful: 145,
    notHelpful: 12,
  },
  {
    id: 16,
    question: "Do you offer gift cards?",
    answer:
      "Yes! We offer digital gift cards in denominations of $25, $50, $100, and $200. Gift cards are delivered via email and never expire. They can be used for any purchase on our website and combined with other payment methods.",
    category: "payments",
    helpful: 78,
    notHelpful: 4,
  },
  // Account
  {
    id: 17,
    question: "How do I create an account?",
    answer:
      "Click 'Sign Up' at the top of our website and enter your email address and create a password. You can also sign up using your Google or Facebook account for quick access. An account lets you track orders, save addresses, and enjoy faster checkout.",
    category: "account",
    helpful: 156,
    notHelpful: 6,
  },
  {
    id: 18,
    question: "How do I reset my password?",
    answer:
      "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link within minutes. Click the link and create a new password. For security, reset links expire after 24 hours.",
    category: "account",
    helpful: 234,
    notHelpful: 9,
  },
  {
    id: 19,
    question: "How can I update my account information?",
    answer:
      "Log into your account and navigate to 'Account Settings.' From there, you can update your email, password, shipping addresses, and payment methods. Don't forget to save your changes before leaving the page.",
    category: "account",
    helpful: 123,
    notHelpful: 5,
  },
  {
    id: 20,
    question: "How do I delete my account?",
    answer:
      "To delete your account, please contact our customer service team at support@example.com with your request. Note that account deletion is permanent and you'll lose access to order history, saved addresses, and any store credit or rewards points.",
    category: "account",
    helpful: 67,
    notHelpful: 14,
  },
];

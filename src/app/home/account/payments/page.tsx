"use client";

import React from "react";
import { CreditCard, Plus, Shield, Info, Wallet, Banknote } from "lucide-react";
import Link from "next/link";

export default function PaymentsPage() {
  // For now, this is a placeholder since we're using COD primarily
  // Can be expanded for saved cards, bank accounts, etc.

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Payment Methods</h1>
        <p className="text-stone-600 mt-1">Manage your payment options</p>
      </div>

      {/* Payment Options Info */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#DDA200]" />
            Available Payment Methods
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Cash on Delivery */}
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="p-3 bg-green-100 rounded-lg">
              <Banknote className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Cash on Delivery</h3>
              <p className="text-sm text-green-700 mt-1">
                Pay with cash when your order is delivered. Available for all
                orders within Pakistan.
              </p>
            </div>
            <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Available
            </span>
          </div>

          {/* Credit/Debit Card */}
          <div className="flex items-start gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="p-3 bg-stone-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-stone-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">
                Credit/Debit Card
              </h3>
              <p className="text-sm text-stone-600 mt-1">
                Pay securely with Visa, Mastercard, or other major cards. Cards
                are processed securely at checkout.
              </p>
            </div>
            <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              At Checkout
            </span>
          </div>

          {/* Bank Transfer */}
          <div className="flex items-start gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="p-3 bg-stone-100 rounded-lg">
              <Wallet className="w-6 h-6 text-stone-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">Bank Transfer</h3>
              <p className="text-sm text-stone-600 mt-1">
                Pay directly to our bank account. Order will be processed after
                payment confirmation.
              </p>
            </div>
            <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
              On Request
            </span>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-[#FFF9E6] rounded-xl p-4 border border-[#f3e4b7]">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#DDA200] mt-0.5" />
          <div>
            <h3 className="font-semibold text-stone-800">Secure Payments</h3>
            <p className="text-sm text-stone-600 mt-1">
              All card transactions are secured with SSL encryption. We never
              store your full card details on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Future: Saved Cards Section */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="font-semibold text-stone-800">Saved Cards</h3>
        <p className="text-stone-600 mt-2 max-w-sm mx-auto">
          Save your cards for faster checkout. This feature will be available
          soon.
        </p>
        <button
          disabled
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 
            bg-stone-200 text-stone-500 font-semibold rounded-xl cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Card (Coming Soon)
        </button>
      </div>

      {/* Help Link */}
      <div className="text-center">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-[#DDA200] hover:underline"
        >
          <Info className="w-4 h-4" />
          Need help with payments?
        </Link>
      </div>
    </div>
  );
}

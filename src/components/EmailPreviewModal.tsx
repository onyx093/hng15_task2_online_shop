'use client';

import React from 'react';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import { Order } from '@/types';

interface EmailPreviewModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailPreviewModal({ order, isOpen, onClose }: EmailPreviewModalProps) {
  if (!isOpen) return null;

  const htmlContent = order.email_preview_html || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Mailgun Order Confirmation Email
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {order.mailgun_status === 'sent' ? 'Delivered via Mailgun' : 'Generated & Formatted'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Sent to: <span className="font-medium text-zinc-700 dark:text-zinc-300">{order.customer_email}</span>
                {order.mailgun_message_id && ` • ID: ${order.mailgun_message_id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata Bar */}
        <div className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <strong>Subject:</strong> Order Confirmed #{order.order_number} - AURA Home & Living
          </div>
          <div className="text-zinc-500">
            Rendered Responsive HTML Template
          </div>
        </div>

        {/* Email Preview Frame */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950 flex justify-center">
          <div className="w-full max-w-[620px] bg-white rounded-lg shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <iframe
              srcDoc={htmlContent}
              title="Order Confirmation Email Preview"
              className="w-full h-[520px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">
            Mailgun REST API template with dynamic itemization, tax, and shipping calculation.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition"
          >
            Done Previewing
          </button>
        </div>
      </div>
    </div>
  );
}

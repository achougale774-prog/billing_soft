'use client';

import { Invoice } from '@/types';
import { formatCurrency, formatDate, numberToWords } from '@/utils/helpers';
import { useStore } from '@/hooks/useStore';

interface InvoicePrintProps {
  invoice: Invoice;
}

export function InvoicePrint({ invoice }: InvoicePrintProps) {
  const { settings } = useStore();

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print-only">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{settings.companyName}</h1>
            <p className="text-sm text-gray-600 mt-1">{settings.companyAddress}</p>
            <p className="text-sm text-gray-600">Phone: {settings.companyPhone}</p>
            <p className="text-sm text-gray-600">Email: {settings.companyEmail}</p>
            {settings.companyGst && (
              <p className="text-sm text-gray-600">GSTIN: {settings.companyGst}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">TAX INVOICE</h2>
            <p className="text-lg font-semibold text-primary-600 mt-1">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To:</h3>
          <p className="font-bold text-lg text-gray-900">{invoice.customerName}</p>
          <p className="text-sm text-gray-600 mt-1">{invoice.customerAddress}</p>
          <p className="text-sm text-gray-600">Phone: {invoice.customerPhone}</p>
          <p className="text-sm text-gray-600">Email: {invoice.customerEmail}</p>
          {invoice.customerGst && (
            <p className="text-sm text-gray-600">GSTIN: {invoice.customerGst}</p>
          )}
        </div>
        <div className="text-right">
          <div className="space-y-2">
            <div className="flex justify-end gap-4">
              <span className="text-sm text-gray-500">Invoice Date:</span>
              <span className="text-sm font-medium">{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-end gap-4">
              <span className="text-sm text-gray-500">Due Date:</span>
              <span className="text-sm font-medium">{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-end gap-4">
              <span className="text-sm text-gray-500">Status:</span>
              <span className="text-sm font-bold uppercase text-primary-600">{invoice.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6 border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">#</th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Description</th>
            <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Qty</th>
            <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Rate</th>
            <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Disc%</th>
            <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">GST%</th>
            <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm">
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.quantity}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.discount}%</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.gstRate}%</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium">{formatCurrency(item.finalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-80">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-600">Sub Total:</span>
            <span className="font-medium">{formatCurrency(invoice.subTotal)}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-600">Total GST:</span>
            <span className="font-medium">{formatCurrency(invoice.totalGst)}</span>
          </div>
          {invoice.roundOff !== 0 && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-600">Round Off:</span>
              <span className="font-medium">{formatCurrency(invoice.roundOff)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-gray-900 mt-2">
            <span className="font-bold text-lg">Grand Total:</span>
            <span className="font-bold text-lg text-primary-600">{formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 italic">
            {numberToWords(invoice.grandTotal)}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {invoice.payments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Payments Received:</h3>
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Method</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Transaction ID</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map(payment => (
                <tr key={payment.id}>
                  <td className="border border-gray-300 px-3 py-2">{formatDate(payment.date)}</td>
                  <td className="border border-gray-300 px-3 py-2 capitalize">{payment.method.replace('_', ' ')}</td>
                  <td className="border border-gray-300 px-3 py-2">{payment.transactionId || '-'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-2">
            <div className="text-right">
              <p className="text-sm">Paid: <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span></p>
              <p className="text-sm">Balance Due: <span className="font-bold text-red-600">{formatCurrency(invoice.balanceDue)}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Terms & Conditions:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.terms}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">Thank you for your business!</p>
        <p className="text-xs text-gray-400 mt-1">This is a computer generated invoice and does not require signature.</p>
      </div>
    </div>
  );
}

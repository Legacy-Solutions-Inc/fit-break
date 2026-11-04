"use client";

import { createContext, useContext, useEffect, useRef, useState, useTransition } from "react";

import { submitPaymentAction } from "@/app/(fitbreak)/(site)/member/payments/actions";
import { PACKAGES, PAYMENT_DETAILS, type ClassPackage } from "@/services/fitbreak/catalog";

import { contact } from "../links";
import { useSourceToast } from "./use-toast";

// payments.html "Purchase Now" → payment-method modal (verbatim), then the
// checkout step. The source sent members to /checkout.html (not part of the
// captured site); here the same GCash/BPI instructions (pricing.html "How to
// Pay") and the proof-of-payment upload live in a second modal.

type PackageId = ClassPackage["id"];
type Method = "gcash" | "bpi";

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,application/pdf";

interface PaymentsContextValue {
  select: (packageId: PackageId) => void;
}

const PaymentsContext = createContext<PaymentsContextValue | null>(null);

function CloseIcon() {
  return (
    <svg
      className="h-6 w-6 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      className="h-6 w-6 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function Backdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

function MethodModal({
  onChoose,
  onClose,
}: {
  onChoose: (method: Method) => void;
  onClose: () => void;
}) {
  return (
    <Backdrop onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-method-title"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-brand-50 to-brand-50 p-6">
          <h2 id="fb-method-title" className="text-2xl font-bold text-gray-900">
            Choose Payment Method
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 transition-colors hover:bg-white/50"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <button
            type="button"
            onClick={() => onChoose("gcash")}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-brand-500 hover:bg-brand-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">GCash</p>
              <p className="text-sm text-gray-600">Scan QR code &amp; upload proof of payment</p>
            </div>
            <ChevronRight />
          </button>

          <button
            type="button"
            onClick={() => onChoose("bpi")}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-brand-500 hover:bg-brand-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-sm font-bold text-red-600">BPI</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">BPI Bank Transfer</p>
              <p className="text-sm text-gray-600">Transfer via BPI app &amp; upload proof</p>
            </div>
            <ChevronRight />
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            All payments are secure and encrypted
          </p>
        </div>
      </div>
    </Backdrop>
  );
}

function CheckoutModal({
  pkg,
  method,
  onBack,
  onClose,
  onSubmitted,
}: {
  pkg: ClassPackage;
  method: Method;
  onBack: () => void;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const bpi = PAYMENT_DETAILS.bpi;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = fileRef.current?.files?.[0];
    if (!file) return setError("Please upload your proof of payment.");
    if (file.size > MAX_PROOF_BYTES) return setError("File is too large. Maximum size is 5 MB.");
    const data = new FormData(form);
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitPaymentAction({ ok: false }, data);
        if (result.ok) onSubmitted();
        else setError(result.error ?? "Failed to submit payment. Please try again.");
      } catch {
        setError("Upload failed. Please try again with a smaller file.");
      }
    });
  }

  const close = () => {
    if (!pending) onClose();
  };

  return (
    <Backdrop onClose={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-checkout-title"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-brand-50 to-brand-50 p-6">
          <h2 id="fb-checkout-title" className="text-2xl font-bold text-gray-900">
            {method === "gcash" ? "Pay via GCash" : "BPI Bank Transfer"}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full p-2 transition-colors hover:bg-white/50"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <input type="hidden" name="packageId" value={pkg.id} />
          <input type="hidden" name="method" value={method} />

          <div className="flex items-center justify-between rounded-xl bg-brand-50 p-4">
            <div>
              <p className="font-semibold text-gray-900">{pkg.name}</p>
              <p className="text-sm text-gray-600">
                {pkg.credits} Class Credit{pkg.credits !== 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-2xl font-bold text-brand-500">
              ₱{pkg.pricePhp.toLocaleString("en-US")}
            </p>
          </div>

          {method === "gcash" ? (
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-bold text-brand-500">1.</span> Send payment to our GCash
                number
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-brand-500">2.</span> Take a screenshot of your
                payment confirmation
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-brand-500">3.</span> Upload proof of payment in your
                account
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-brand-500">4.</span> Credits will be added after
                verification
              </li>
              <li className="pt-1 text-xs text-gray-500">
                Need our GCash number? Call or text {contact.phoneDisplay}.
              </li>
            </ol>
          ) : (
            <div>
              <div className="mb-3 rounded-lg bg-gray-50 p-4">
                <p className="mb-1 text-sm text-gray-600">Account Number:</p>
                <p className="text-lg font-bold text-gray-900">{bpi.accountNumber}</p>
                <p className="mt-2 text-sm text-gray-600">Account Name:</p>
                <p className="font-semibold text-gray-900">{bpi.accountName}</p>
              </div>
              <p className="text-xs text-gray-500">
                Upload your deposit slip or transaction confirmation as proof of payment.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="fb-reference" className="mb-1 block text-sm font-medium text-gray-700">
              Reference Number
            </label>
            <input
              id="fb-reference"
              name="referenceNumber"
              required
              minLength={4}
              maxLength={40}
              autoComplete="off"
              placeholder={method === "gcash" ? "e.g. 1234 567 890123" : "e.g. BPI transaction no."}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-brand-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="fb-proof" className="mb-1 block text-sm font-medium text-gray-700">
              Proof of Payment
            </label>
            <input
              id="fb-proof"
              ref={fileRef}
              name="proof"
              type="file"
              required
              accept={ACCEPT}
              aria-describedby="fb-proof-help"
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-600 hover:file:bg-brand-100"
            />
            <p id="fb-proof-help" className="mt-1 text-xs text-gray-500">
              Screenshot or PDF (JPG, PNG, WebP, GIF, HEIC or PDF), max 5 MB.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={pending}
              className="flex-1 rounded-xl bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition-all hover:bg-gray-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-600"
            >
              {pending ? "Submitting..." : "Submit Payment"}
            </button>
          </div>
        </form>
      </div>
    </Backdrop>
  );
}

export function PaymentsFlow({
  initialPackage,
  children,
}: {
  /** From `?package=<id>`: opens the payment-method step for that package. */
  initialPackage?: PackageId;
  children: React.ReactNode;
}) {
  const [packageId, setPackageId] = useState<PackageId | null>(initialPackage ?? null);
  const [method, setMethod] = useState<Method | null>(null);
  const { show, node: toastNode } = useSourceToast("pill");
  const pkg = PACKAGES.find((p) => p.id === packageId);

  const closeAll = () => {
    setPackageId(null);
    setMethod(null);
  };

  return (
    <PaymentsContext.Provider value={{ select: setPackageId }}>
      {children}
      {pkg && !method && <MethodModal onChoose={setMethod} onClose={closeAll} />}
      {pkg && method && (
        <CheckoutModal
          pkg={pkg}
          method={method}
          onBack={() => setMethod(null)}
          onClose={closeAll}
          onSubmitted={() => {
            closeAll();
            show("Payment submitted! Credits will be added after verification.");
          }}
        />
      )}
      {toastNode}
    </PaymentsContext.Provider>
  );
}

/** A package card's "Purchase Now" button (payments.html selectPackage). */
export function PurchaseButton({
  packageId,
  className,
}: {
  packageId: PackageId;
  className: string;
}) {
  const ctx = useContext(PaymentsContext);
  return (
    <button type="button" className={className} onClick={() => ctx?.select(packageId)}>
      Purchase Now
    </button>
  );
}

/** payments.js downloadInvoice: a printable invoice for a verified payment. */
export function InvoiceButton({
  paymentId,
  packageName,
  amount,
  date,
  credits,
}: {
  paymentId: string;
  packageName: string;
  amount: number;
  date: string;
  credits: number;
}) {
  function open() {
    const win = window.open("", "_blank");
    if (!win) return;
    const doc = win.document;
    doc.title = `FitBreak Invoice - ${paymentId}`;
    const style = doc.createElement("style");
    style.textContent = `body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:40px;background:#f5f5f5}.invoice{max-width:600px;margin:0 auto;background:#fff;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,.1)}.header{display:flex;justify-content:space-between;align-items:start;margin-bottom:40px;border-bottom:3px solid #D71E49;padding-bottom:20px}.logo{font-size:28px;font-weight:bold;color:#D71E49}.logo-sub{font-size:12px;color:#666}.invoice-title{text-align:right}.invoice-title h1{margin:0;color:#333;font-size:24px}.invoice-title p{margin:5px 0 0;color:#666;font-size:14px}.details{display:flex;justify-content:space-between;margin-bottom:30px}.details h3{margin:0 0 10px;color:#333;font-size:14px;text-transform:uppercase}.details p{margin:3px 0;color:#666;font-size:14px}table{width:100%;border-collapse:collapse;margin-bottom:30px}th{text-align:left;padding:12px;background:#f8f8f8;color:#333;font-size:14px;border-bottom:2px solid #ddd}td{padding:12px;border-bottom:1px solid #eee;color:#333}.amount{text-align:right}.total-row{display:flex;justify-content:flex-end;gap:40px;padding:8px 0}.grand{font-size:18px;font-weight:bold;color:#D71E49;border-top:2px solid #D71E49;padding-top:15px;margin-top:10px}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#999;font-size:12px}@media print{body{background:#fff;padding:0}.invoice{box-shadow:none}}`;
    doc.head.appendChild(style);
    const el = (tag: string, attrs: { class?: string } = {}, text?: string) => {
      const node = doc.createElement(tag);
      if (attrs.class) node.className = attrs.class;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const peso = `₱${amount.toLocaleString("en-US")}`;
    const invoice = el("div", { class: "invoice" });
    const header = el("div", { class: "header" });
    const brand = el("div");
    brand.append(
      el("div", { class: "logo" }, "FitBreak"),
      el("div", { class: "logo-sub" }, "Women-Only Fitness Studio"),
    );
    const title = el("div", { class: "invoice-title" });
    title.append(
      el("h1", {}, "INVOICE"),
      el("p", {}, `#${paymentId.slice(0, 8).toUpperCase()}`),
      el("p", {}, date),
    );
    header.append(brand, title);
    const details = el("div", { class: "details" });
    const from = el("div");
    from.append(
      el("h3", {}, "From"),
      el("p", {}, "FitBreak Calapan"),
      el("p", {}, "2nd Floor Roxas Drive, Brgy Ilaya"),
      el("p", {}, "Calapan City, Oriental Mindoro"),
      el("p", {}, contact.email),
    );
    const paid = el("div");
    paid.append(el("h3", {}, "Payment Date"), el("p", {}, date), el("p", {}, "Status: PAID"));
    details.append(from, paid);
    const table = el("table");
    const headRow = el("tr");
    headRow.append(
      el("th", {}, "Description"),
      el("th", {}, "Credits"),
      el("th", { class: "amount" }, "Amount"),
    );
    const row = el("tr");
    row.append(
      el("td", {}, packageName),
      el("td", {}, `${credits} classes`),
      el("td", { class: "amount" }, peso),
    );
    table.append(headRow, row);
    const sub = el("div", { class: "total-row" });
    sub.append(el("span", {}, "Subtotal:"), el("span", {}, peso));
    const grand = el("div", { class: "total-row grand" });
    grand.append(el("span", {}, "Total Paid:"), el("span", {}, peso));
    const footer = el("div", { class: "footer" });
    footer.append(
      el("p", {}, "Thank you for choosing FitBreak!"),
      el("p", {}, `For questions, contact us at ${contact.email}`),
    );
    invoice.append(header, details, table, sub, grand, footer);
    doc.body.appendChild(invoice);
    win.print();
  }

  return (
    <button
      type="button"
      onClick={open}
      title="Download Invoice"
      aria-label="Download Invoice"
      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-500"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </button>
  );
}

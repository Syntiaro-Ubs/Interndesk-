import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Modal } from "../common/Modal.js";
import { api } from "../../../../../api.js";

export function ResumePaymentModal({ isOpen, onClose, draftId, userInfo, onDownload, onUnlocked }) {
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(null);
  const [price, setPrice] = useState(99);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const popupRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setPhone(userInfo?.phone || "");
    setError("");
    setIsChecking(true);
    Promise.all([api.config(), api.resumeDownloadEntitlement(draftId)])
      .then(([config, entitlement]) => {
        setPaymentEnabled(Boolean(config.payuEnabled));
        setPrice(Number(config.resumeDownloadPriceInr) || 99);
        setIsUnlocked(Boolean(entitlement.paid));
        if (entitlement.paid) onUnlocked?.();
      })
      .catch(() => {
        setPaymentEnabled(false);
        setError("Could not check the current payment status. Please try again.");
      })
      .finally(() => setIsChecking(false));
  }, [isOpen, draftId, userInfo?.phone, onUnlocked]);

  useEffect(() => {
    const handlePaymentMessage = async (event) => {
      if (!popupRef.current || event.source !== popupRef.current) return;
      if (!event.data || event.data.draftId !== draftId) return;
      popupRef.current = null;
      if (event.data.type === "PAYU_PAYMENT_FAILED") {
        setIsStarting(false);
        setError("Payment was cancelled or did not complete. You have not been charged by InternDesk.");
        return;
      }
      if (event.data.type === "PAYU_PAYMENT_PENDING") {
        setIsStarting(false);
        setError("PayU has not confirmed the payment yet. Check again shortly before retrying.");
        return;
      }
      if (event.data.type !== "PAYU_PAYMENT_SUCCESS") return;
      try {
        const entitlement = await api.resumeDownloadEntitlement(draftId);
        if (!entitlement.paid) throw new Error("Payment confirmation is still being processed.");
        setIsUnlocked(true);
        onUnlocked?.();
        setError("");
      } catch (paymentError) {
        setError(paymentError.message || "Payment confirmation is still being processed.");
      } finally {
        setIsStarting(false);
      }
    };
    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, [draftId, onUnlocked]);

  const startPayment = async () => {
    if (isStarting) return;
    const popupName = `resumePayment${Date.now()}`;
    const popup = window.open("about:blank", popupName, "popup,width=520,height=760");
    if (!popup) {
      setError("Allow pop-ups for InternDesk to open PayU checkout.");
      return;
    }
    popupRef.current = popup;
    setIsStarting(true);
    setError("");
    try {
      const checkout = await api.createResumeDownloadPayment({ draftId, phone });
      if (checkout.alreadyPaid) {
        popup.close();
        popupRef.current = null;
        setIsUnlocked(true);
        onUnlocked?.();
        setIsStarting(false);
        return;
      }
      const form = document.createElement("form");
      form.method = "POST";
      form.action = checkout.actionUrl;
      form.target = popupName;
      for (const [name, value] of Object.entries(checkout.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value ?? "");
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      form.remove();
    } catch (startError) {
      popup.close();
      popupRef.current = null;
      setIsStarting(false);
      setError(startError.message || "Could not start PayU checkout. Please try again.");
    }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title="Download your resume" subtitle={`One-time ₹${price} payment per resume`} maxWidth="sm">
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs text-slate-500">Payment for</p><p className="mt-1 text-sm font-semibold text-slate-900">ATS resume PDF download</p></div>
          <span className="text-lg font-bold text-slate-900">₹{price}.00</span>
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">Pay once to unlock PDF downloads for this resume on your account.</p>
      </div>

      {!isUnlocked && <label className="block text-xs font-semibold text-slate-700">Phone number for PayU checkout
        <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" placeholder="10-digit phone number" className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      </label>}

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      {!paymentEnabled && !isUnlocked && !isChecking && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">PayU is not configured for this server yet. You can continue once the merchant credentials are added.</p>}
      <p className="flex items-start gap-2 text-[11px] text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Payment is processed by PayU. InternDesk unlocks the PDF only after the server verifies the payment.</p>

      <button type="button" onClick={isUnlocked ? onDownload : startPayment} disabled={isChecking || isStarting || (!isUnlocked && !paymentEnabled)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
        {isChecking ? <><Loader2 className="h-4 w-4 animate-spin" />Checking payment…</> : isStarting ? <><Loader2 className="h-4 w-4 animate-spin" />Opening PayU…</> : isUnlocked ? <><CheckCircle2 className="h-4 w-4" />Download resume PDF</> : <>Pay ₹{price} and unlock PDF<ExternalLink className="h-4 w-4" /><ArrowRight className="h-4 w-4" /></>}
      </button>
      {!isUnlocked && <p className="text-center text-[11px] text-slate-400">If checkout opens in another tab, return here after PayU confirms payment.</p>}
    </div>
  </Modal>;
}

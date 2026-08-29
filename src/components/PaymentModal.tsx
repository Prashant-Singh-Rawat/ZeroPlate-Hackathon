import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transactionId: string) => void;
  planName?: string;
  amount?: number;
  ngoName?: string;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  planName = 'Priority Rescue Plan',
  amount = 199,
  ngoName = 'Hope Foundation',
}) => {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'qr' | 'gpay' | 'phonepe' | 'paytm'>('qr');

  // UPI fields
  const [upiId, setUpiId] = useState('');
  const [qrConfirmed, setQrConfirmed] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Netbanking fields
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [netBankingUserId, setNetBankingUserId] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formErrorBanner, setFormErrorBanner] = useState<string | null>(null);

  // Flow states: 'checkout' | 'processing' | 'success'
  const [paymentState, setPaymentState] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [txnId, setTxnId] = useState('');
  const [copiedTxn, setCopiedTxn] = useState(false);

  if (!isOpen) return null;

  // Clear specific error on input
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (formErrorBanner) setFormErrorBanner(null);
  };

  // Demo autofill helpers
  const handleFillTestCard = () => {
    setCardNumber('4532 8921 4098 7654');
    setCardExpiry('12/28');
    setCardCvv('888');
    setCardName(ngoName || 'Hope Foundation');
    setErrors({});
    setFormErrorBanner(null);
  };

  const handleFillTestUpi = () => {
    setUpiId('hope.rescue@okhdfcbank');
    clearError('upiId');
  };

  const handleFillTestNetBanking = () => {
    setNetBankingUserId('NGO_HDFC_98412');
    clearError('netBankingUserId');
  };

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    clearError('cardNumber');
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
    clearError('cardExpiry');
  };

  // Validate required details
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (method === 'card') {
      const cleanNumber = cardNumber.replace(/\s+/g, '');
      if (!cleanNumber) {
        errs.cardNumber = 'Card number is required.';
      } else if (cleanNumber.length < 15) {
        errs.cardNumber = 'Please enter a valid 16-digit card number.';
      }

      if (!cardExpiry.trim()) {
        errs.cardExpiry = 'Expiry is required (MM/YY).';
      } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        errs.cardExpiry = 'Invalid format (use MM/YY).';
      }

      if (!cardCvv.trim()) {
        errs.cardCvv = 'CVV is required.';
      } else if (cardCvv.trim().length < 3) {
        errs.cardCvv = 'CVV must be 3 or 4 digits.';
      }

      if (!cardName.trim()) {
        errs.cardName = 'Cardholder name is required.';
      }
    } else if (method === 'upi') {
      if (selectedUpiApp === 'qr') {
        if (!qrConfirmed) {
          errs.qrConfirmed = 'Please confirm that you have scanned the QR and authorized payment on your UPI app.';
        }
      } else {
        if (!upiId.trim()) {
          errs.upiId = `Please enter your ${
            selectedUpiApp === 'gpay'
              ? 'Google Pay UPI ID or Mobile Number'
              : selectedUpiApp === 'phonepe'
              ? 'PhonePe UPI ID or Mobile Number'
              : selectedUpiApp === 'paytm'
              ? 'Paytm UPI ID or Mobile Number'
              : 'UPI ID'
          }.`;
        } else if (!upiId.includes('@') && !/^\d{10}$/.test(upiId.trim())) {
          errs.upiId = 'Enter a valid UPI ID (e.g. name@bank) or 10-digit mobile number.';
        }
      }
    } else if (method === 'netbanking') {
      if (!netBankingUserId.trim()) {
        errs.netBankingUserId = 'Customer ID or NetBanking Username is required.';
      }
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setFormErrorBanner('Please enter the required payment details before completing payment.');
      return false;
    }

    setFormErrorBanner(null);
    return true;
  };

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setPaymentState('processing');

    setTimeout(() => {
      const generatedTxn = `TXN_ZP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      setTxnId(generatedTxn);
      setPaymentState('success');

      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F97316', '#10B981', '#F59E0B', '#3B82F6'],
      });

      onPaymentSuccess(generatedTxn);
    }, 1600);
  };

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(txnId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handleModalClose = () => {
    if (paymentState === 'processing') return;
    setPaymentState('checkout');
    setErrors({});
    setFormErrorBanner(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-200 dark:border-slate-700 shadow-2xl w-full max-w-xl overflow-hidden relative transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-orange-950 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-white rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">ZeroPlate Secure Checkout</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  256-Bit Encrypted
                </span>
              </div>
              <p className="text-xs text-orange-200/80 mt-0.5">
                Billed to: <strong className="text-white">{ngoName}</strong>
              </p>
            </div>
          </div>

          {paymentState !== 'processing' && (
            <button
              onClick={handleModalClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* PROCESSING STATE */}
        {paymentState === 'processing' && (
          <div className="p-10 text-center space-y-5">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900/40 animate-ping opacity-30" />
              <div className="w-20 h-20 rounded-full border-4 border-orange-500 border-t-transparent animate-spin flex items-center justify-center">
                <Lock className="w-8 h-8 text-orange-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-gray-900 dark:text-white">Authorizing ₹{amount}.00 Payment</h4>
              <p className="text-xs text-gray-500 dark:text-slate-300 font-medium">
                Validating payment details with bank / UPI gateway. Please do not refresh or close this window...
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying authorization token...</span>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {paymentState === 'success' && (
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-300 dark:border-emerald-700 uppercase tracking-wide">
                Payment Confirmed
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                Priority Rescue Activated! 🎉
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300 max-w-sm mx-auto">
                Thank you! Your NGO now receives the +6 Match Priority Boost, extended 50km radius, and instant food rescue notifications.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-gray-50 dark:bg-slate-900/80 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Plan</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{planName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Amount Paid</span>
                <span className="font-extrabold text-orange-600 dark:text-orange-400 text-sm">₹{amount}.00</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Status</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Active (30 Days)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Transaction ID</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 dark:text-white">
                  <span className="truncate max-w-[170px]">{txnId}</span>
                  <button
                    onClick={handleCopyTxn}
                    className="p-1 hover:bg-orange-100 dark:hover:bg-slate-700 rounded text-orange-500 cursor-pointer"
                    title="Copy Transaction ID"
                  >
                    {copiedTxn ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleModalClose}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Back to Rescue Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CHECKOUT STATE */}
        {paymentState === 'checkout' && (
          <form onSubmit={handlePayNow}>
            {/* Amount Banner */}
            <div className="bg-amber-50/80 dark:bg-slate-900/90 px-6 py-4 border-b border-amber-900/5 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="font-black text-gray-900 dark:text-white text-sm">{planName}</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">30-day Priority Matching & Unlimited Listings</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{amount}.00</div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  All taxes included
                </span>
              </div>
            </div>

            {/* Validation Banner if errors exist */}
            {formErrorBanner && (
              <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{formErrorBanner}</span>
              </div>
            )}

            {/* Method Tabs */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('upi');
                    setErrors({});
                    setFormErrorBanner(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    method === 'upi'
                      ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border border-orange-200 dark:border-slate-700'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-orange-500" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('card');
                    setErrors({});
                    setFormErrorBanner(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    method === 'card'
                      ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border border-orange-200 dark:border-slate-700'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('netbanking');
                    setErrors({});
                    setFormErrorBanner(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    method === 'netbanking'
                      ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border border-orange-200 dark:border-slate-700'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* METHOD 1: UPI & QR */}
              {method === 'upi' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUpiApp('qr');
                        setErrors({});
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedUpiApp === 'qr'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 font-extrabold shadow-sm'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUpiApp('gpay');
                        setErrors({});
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedUpiApp === 'gpay'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 font-extrabold shadow-sm'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60'
                      }`}
                    >
                      Google Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUpiApp('phonepe');
                        setErrors({});
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedUpiApp === 'phonepe'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 font-extrabold shadow-sm'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60'
                      }`}
                    >
                      PhonePe
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUpiApp('paytm');
                        setErrors({});
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedUpiApp === 'paytm'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 font-extrabold shadow-sm'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60'
                      }`}
                    >
                      Paytm
                    </button>
                  </div>

                  {selectedUpiApp === 'qr' ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-orange-50/50 dark:bg-slate-900/60 rounded-2xl border border-orange-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        {/* Stylized QR Matrix */}
                        <div className="w-28 h-28 bg-white p-2 rounded-xl border border-orange-300 shadow-sm flex items-center justify-center shrink-0">
                          <div className="w-full h-full bg-[radial-gradient(#1e293b_3px,transparent_3px)] [background-size:10px_10px] relative flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                            <span className="p-1 bg-orange-500 text-white rounded text-[9px] font-black shadow-sm">
                              UPI QR
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <span className="font-extrabold text-gray-900 dark:text-white">Instant Payment QR Code</span>
                          <p className="text-gray-600 dark:text-slate-300 text-[11px]">
                            Scan with Google Pay, PhonePe, Paytm, or BHIM. Amount ₹{amount}.00 is pre-configured.
                          </p>
                          <p className="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-bold">
                            UPI ID: zeroplate.rescue@okhdfcbank
                          </p>
                        </div>
                      </div>

                      {/* Required confirmation checkbox */}
                      <div
                        onClick={() => {
                          setQrConfirmed(!qrConfirmed);
                          clearError('qrConfirmed');
                        }}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          qrConfirmed
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                            : errors.qrConfirmed
                            ? 'border-red-500 bg-red-50/30 dark:bg-red-950/40'
                            : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/40 hover:bg-gray-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={qrConfirmed}
                          onChange={(e) => {
                            setQrConfirmed(e.target.checked);
                            clearError('qrConfirmed');
                          }}
                          className="mt-0.5 w-4 h-4 text-orange-500 rounded border-gray-300 dark:border-slate-600 focus:ring-orange-500 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-gray-900 dark:text-white">
                            I have scanned the QR code & authorized the ₹{amount} payment *
                          </span>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400">
                            Check this box after completing the transfer on your mobile UPI app.
                          </p>
                        </div>
                      </div>
                      {errors.qrConfirmed && (
                        <p className="text-[11px] text-red-500 font-semibold">{errors.qrConfirmed}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase">
                          Enter {selectedUpiApp.toUpperCase()} UPI ID or Mobile Number *
                        </label>
                        <button
                          type="button"
                          onClick={handleFillTestUpi}
                          className="text-[11px] font-bold text-orange-500 hover:underline cursor-pointer"
                        >
                          Fill Demo UPI
                        </button>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            clearError('upiId');
                          }}
                          placeholder={
                            selectedUpiApp === 'gpay'
                              ? 'e.g. 9876543210 or yourname@okhdfcbank'
                              : selectedUpiApp === 'phonepe'
                              ? 'e.g. 9876543210 or yourname@ybl'
                              : 'e.g. 9876543210 or yourname@paytm'
                          }
                          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none ${
                            errors.upiId ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-orange-500'
                          }`}
                        />
                        {errors.upiId && (
                          <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.upiId}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 2: CREDIT / DEBIT CARDS */}
              {method === 'card' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase">
                      Card Details (Required) *
                    </label>
                    <button
                      type="button"
                      onClick={handleFillTestCard}
                      className="text-[11px] font-bold text-orange-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fill Test Card</span>
                    </button>
                  </div>

                  {/* Card Number */}
                  <div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="Card Number (e.g. 4532 8921 4098 7654) *"
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none font-mono ${
                        errors.cardNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-orange-500'
                      }`}
                    />
                    {errors.cardNumber && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.cardNumber}</p>
                    )}
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY *"
                        maxLength={5}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none text-center ${
                          errors.cardExpiry ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-orange-500'
                        }`}
                      />
                      {errors.cardExpiry && (
                        <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.cardExpiry}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => {
                          setCardCvv(e.target.value.replace(/\D/g, ''));
                          clearError('cardCvv');
                        }}
                        placeholder="CVV *"
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none text-center ${
                          errors.cardCvv ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-orange-500'
                        }`}
                      />
                      {errors.cardCvv && (
                        <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.cardCvv}</p>
                      )}
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => {
                        setCardName(e.target.value);
                        clearError('cardName');
                      }}
                      placeholder="Cardholder Name *"
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none ${
                        errors.cardName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-orange-500'
                      }`}
                    />
                    {errors.cardName && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.cardName}</p>
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 3: NET BANKING */}
              {method === 'netbanking' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase mb-2">
                      Select Your Bank *
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(
                        (bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                              selectedBank === bank
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 ring-2 ring-orange-500/20'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-200'
                            }`}
                          >
                            {bank}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase">
                        NetBanking Customer ID / Username *
                      </label>
                      <button
                        type="button"
                        onClick={handleFillTestNetBanking}
                        className="text-[11px] font-bold text-orange-500 hover:underline cursor-pointer"
                      >
                        Fill Demo ID
                      </button>
                    </div>
                    <input
                      type="text"
                      value={netBankingUserId}
                      onChange={(e) => {
                        setNetBankingUserId(e.target.value);
                        clearError('netBankingUserId');
                      }}
                      placeholder="e.g. CUST_8941032"
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none ${
                        errors.netBankingUserId ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-orange-500'
                      }`}
                    />
                    {errors.netBankingUserId && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.netBankingUserId}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Trust Badge */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>256-Bit Bank Level Encryption</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                  <span>ZeroPlate Non-Profit Partner Support</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Complete Payment of ₹{amount}.00</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, Smartphone, ExternalLink, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const liveUrl = 'https://zero-plate-hackathon.vercel.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(liveUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6 sm:p-7 space-y-5 text-center animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white">Scan with Phone</h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">Open ZeroPlate instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-orange-200 dark:border-orange-500/30 shadow-inner flex flex-col items-center justify-center space-y-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="ZeroPlate Mobile QR Code"
              className="w-56 h-56 rounded-xl object-contain shadow-sm"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-gray-400">
              Generating QR Code...
            </div>
          )}
          <span className="text-[11px] font-bold text-gray-700">Point phone camera to open</span>
        </div>

        {/* Link Copy & Open */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 text-xs">
            <span className="font-mono text-gray-600 dark:text-slate-300 truncate max-w-[200px]">
              zero-plate-hackathon.vercel.app
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer ml-2 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Website Directly</span>
          </a>
        </div>
      </div>
    </div>
  );
};

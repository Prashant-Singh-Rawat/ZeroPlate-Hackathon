import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Booking, Message } from '../types';
import { Send, Utensils } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user, role]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings?userId=${user?.id || 'donor_spicevilla'}&role=${role}`);
      if (res.ok) {
        const data: Booking[] = await res.json();
        setBookings(data);
        if (data.length > 0) {
          setSelectedBooking(data[0]);
          fetchMessages(data[0].id);
        }
      }
    } catch (e) {
      console.warn('Fetch bookings error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/messages/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.warn('Fetch messages error', e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedBooking) return;

    const payload = {
      bookingId: selectedBooking.id,
      senderId: user?.id || 'user_demo',
      senderName: user?.name || 'User',
      message: inputText.trim(),
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setInputText('');
        fetchMessages(selectedBooking.id);
      }
    } catch (e) {
      console.warn('Send message error', e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-brand-text dark:text-slate-100">{t('messages')}</h1>
        <p className="text-xs font-medium text-brand-muted dark:text-slate-400 mt-1">
          Direct booking-scoped messaging between Food Donors and NGO pickup teams.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-amber-900/5 dark:border-slate-800 shadow-warm-lg overflow-hidden flex flex-col md:flex-row h-[600px] transition-colors">
        {/* Left Sidebar: Threads grouped by booking */}
        <div className="w-full md:w-80 border-r border-gray-100 dark:border-slate-800 flex flex-col bg-brand-cream/30 dark:bg-slate-900/40">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-muted dark:text-slate-400">
              Active Booking Threads
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
            {bookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-brand-muted dark:text-slate-400">No active bookings yet.</div>
            ) : (
              bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBooking(b);
                    fetchMessages(b.id);
                  }}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                    selectedBooking?.id === b.id
                      ? 'bg-brand-light dark:bg-orange-950/40 border-l-4 border-brand-orange'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="p-2 bg-orange-100 dark:bg-orange-950/60 text-brand-orange dark:text-orange-400 rounded-xl shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-brand-text dark:text-slate-100 truncate">{b.foodName}</h4>
                    <p className="text-[11px] font-semibold text-brand-orange dark:text-orange-400 mt-0.5">
                      {b.mealCount} Meals • {role === 'donor' ? b.ngoName : b.donorName}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Chat Interface */}
        {selectedBooking ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-[#1E293B]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-brand-cream/40 dark:bg-slate-900/20">
              <div>
                <h3 className="font-extrabold text-sm text-brand-text dark:text-slate-100">{selectedBooking.foodName}</h3>
                <p className="text-xs text-brand-muted dark:text-slate-400">
                  Partner: <strong className="text-brand-text dark:text-slate-200">{role === 'donor' ? selectedBooking.ngoName : selectedBooking.donorName}</strong> • Pickup: {selectedBooking.pickupLocation}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                {selectedBooking.status}
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-[#0B1120]/60">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-brand-muted dark:text-slate-400">
                  No messages yet. Send a message to coordinate pickup timing.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id || m.senderName === user?.name;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 px-1">
                        {m.senderName}
                      </span>
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs font-medium ${
                          isMe
                            ? 'bg-brand-orange text-white rounded-br-none shadow-warm-sm'
                            : 'bg-white dark:bg-slate-800 text-brand-text dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your pickup coordination message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-brand-text dark:text-slate-100 focus:outline-none focus:border-brand-orange"
              />
              <button
                type="submit"
                className="p-2.5 bg-brand-orange hover:bg-brand-deep text-white rounded-xl shadow-warm-sm transition-all active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-brand-muted dark:text-slate-400 text-xs">
            Select a booking thread to open messaging.
          </div>
        )}
      </div>
    </div>
  );
};

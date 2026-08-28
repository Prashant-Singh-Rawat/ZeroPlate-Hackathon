import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking, Message } from '../types';
import { MessageSquare, Send, Building, Utensils, CheckCircle2 } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user, role } = useAuth();
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-text">Booking Communications</h1>
        <p className="text-xs font-medium text-brand-muted mt-1">
          Direct booking-scoped messaging between Food Donors and NGO pickup teams.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-amber-900/5 shadow-warm-lg overflow-hidden flex flex-col md:flex-row h-[600px]">
        {/* Left Sidebar: Threads grouped by booking (§12) */}
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-brand-cream/30">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-muted">
              Active Booking Threads
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-brand-muted">No active bookings yet.</div>
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
                      ? 'bg-brand-light border-l-4 border-brand-orange'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-2 bg-orange-100 text-brand-orange rounded-xl shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-brand-text truncate">{b.foodName}</h4>
                    <p className="text-[11px] font-semibold text-brand-orange mt-0.5">
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
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-cream/40">
              <div>
                <h3 className="font-extrabold text-sm text-brand-text">{selectedBooking.foodName}</h3>
                <p className="text-xs text-brand-muted">
                  Partner: <strong className="text-brand-text">{role === 'donor' ? selectedBooking.ngoName : selectedBooking.donorName}</strong> • Pickup: {selectedBooking.pickupLocation}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                {selectedBooking.status}
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-brand-muted">
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
                      <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">
                        {m.senderName}
                      </span>
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs font-medium ${
                          isMe
                            ? 'bg-brand-orange text-white rounded-br-none shadow-warm-sm'
                            : 'bg-white text-brand-text border border-gray-200 rounded-bl-none shadow-sm'
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
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your pickup coordination message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
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
          <div className="flex-1 flex items-center justify-center p-8 text-center text-brand-muted text-xs">
            Select a booking thread to open messaging.
          </div>
        )}
      </div>
    </div>
  );
};

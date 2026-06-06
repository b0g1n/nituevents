/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Mail, User, Phone, MessageSquare, Check, ThumbsUp, AlertCircle } from 'lucide-react';
import { ContactLead } from '../types';
import { TRANSLATIONS, Language } from '../translations';

interface ContactFormProps {
  onAddLead: (lead: ContactLead) => void;
  whatsappNumber: string;
  lang: Language;
}

export default function ContactForm({ onAddLead, whatsappNumber, lang }: ContactFormProps) {
  const t = (key: keyof typeof TRANSLATIONS['ro']) => TRANSLATIONS[lang][key] || TRANSLATIONS['ro'][key];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [serviceType, setServiceType] = useState<'foto' | 'video' | 'decor' | 'oglinda' | 'pachet_complet' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basics validation
    if (!name.trim()) return setError(t('form_err_name'));
    if (!phone.trim()) return setError(t('form_err_phone'));
    if (!message.trim()) return setError(t('form_err_msg'));

    setLoading(true);

    setTimeout(() => {
      const newLead: ContactLead = {
        id: 'lead-' + Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        eventDate: eventDate || undefined,
        message: message.trim(),
        serviceType,
        createdAt: new Date().toISOString(),
        status: 'nou'
      };

      try {
        onAddLead(newLead);
        setSuccess(true);
        // Clear forms
        setName('');
        setPhone('');
        setEmail('');
        setEventDate('');
        setServiceType('general');
        setMessage('');
      } catch (err) {
        setError(t('form_err_generic'));
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  const handleWhatsAppDirect = () => {
    const defaultText = encodeURIComponent(
      lang === 'ro' 
        ? `Bună ziua! Doresc o solicitare de programare/ofertă pentru echipa Nițu Events.`
        : `Hello! I would like to request an offer/booking from the Nițu Events team.`
    );
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${defaultText}`, '_blank');
  };

  return (
    <div id="contact-form-component" className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-10 shadow-sm text-left">
      <div id="contact-header-text" className="mb-8">
        <h3 id="form-title" className="font-serif text-2xl font-bold text-neutral-900 mb-2">
          {t('form_title')}
        </h3>
        <p id="form-desc" className="font-sans text-neutral-500 text-xs sm:text-sm font-light leading-relaxed">
          {t('form_desc')}
        </p>
      </div>

      {success ? (
        <div id="form-success-alert" className="py-12 px-6 bg-[#f4fbf7] border border-emerald-100 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 bg-[#e0f4ea] text-emerald-700 flex items-center justify-center rounded-full mx-auto shadow-sm animate-bounce">
            <ThumbsUp className="h-6 w-6" />
          </div>
          <h4 className="font-serif text-xl font-bold text-neutral-900">
            {t('form_success_title')}
          </h4>
          <p className="font-sans text-neutral-600 text-sm font-light max-w-md mx-auto leading-relaxed">
            {t('form_success_desc')}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              id="success-new-msg-btn"
              onClick={() => setSuccess(false)}
              className="px-6 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              {t('form_success_btn_new')}
            </button>
            <button
              id="success-whatsapp-chat"
              onClick={handleWhatsAppDirect}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              {t('form_success_btn_wa')}
            </button>
          </div>
        </div>
      ) : (
        <form id="lead-form-element" onSubmit={handleSubmit} className="space-y-5 font-sans">
          {error && (
            <div id="form-error-banner" className="flex items-center space-x-2.5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div id="inputs-row-1" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nume Complet */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="client-name" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                {t('form_name')} <span className="text-emerald-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="client-name"
                  type="text"
                  required
                  placeholder={t('form_name_placeholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-650 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
            </div>

            {/* Număr Telefon */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="client-phone" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                {t('form_phone')} <span className="text-emerald-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  id="client-phone"
                  type="tel"
                  required
                  placeholder={t('form_phone_placeholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-650 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
            </div>
          </div>

          <div id="inputs-row-2" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Adresă Email */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="client-email" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                {t('form_email')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="client-email"
                  type="email"
                  placeholder={t('form_email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-650 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
            </div>

            {/* Data Evenimentului */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="client-event-date" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                {t('form_date')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  id="client-event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-neutral-50 text-neutral-950 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-650 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Servicii Dorite */}
          <div id="service-select-wrapper" className="space-y-1.5 flex flex-col">
            <label htmlFor="client-service-type" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              {t('form_service')}
            </label>
            <select
              id="client-service-type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as any)}
              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg p-2.5 text-sm focus:border-emerald-650 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-colors"
            >
              <option value="general">{t('form_service_general')}</option>
              <option value="foto">{t('form_service_foto')}</option>
              <option value="video">{t('form_service_video')}</option>
              <option value="decor">{t('form_service_decor')}</option>
              <option value="oglinda">{t('form_service_oglinda')}</option>
              <option value="pachet_complet">{t('form_service_full')}</option>
            </select>
          </div>

          {/* Detalii suplimentare Message */}
          <div id="message-text-wrapper" className="space-y-1.5 flex flex-col">
            <label htmlFor="client-message" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              {t('form_message')} <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-neutral-400">
                <MessageSquare className="h-4 w-4" />
              </span>
              <textarea
                id="client-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('form_message_placeholder')}
                className="w-full bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-650 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            id="lead-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{t('form_submitting')}</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>{t('form_submit')}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

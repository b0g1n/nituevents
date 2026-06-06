/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle, Facebook, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppConfig } from '../types';
import { TRANSLATIONS, Language } from '../translations';

interface NavbarProps {
  config: AppConfig;
  lang: Language;
  onSetLang: (lang: Language) => void;
  activePage: string;
  onNavigate: (sectionId: string) => void;
}

export default function Navbar({
  config,
  lang,
  onSetLang,
  activePage,
  onNavigate
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = (key: keyof typeof TRANSLATIONS['ro']) => TRANSLATIONS[lang][key] || TRANSLATIONS['ro'][key];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'acasa', label: t('nav_acasa') },
    { id: 'despre', label: t('nav_despre') },
    { id: 'foto', label: t('nav_foto') },
    { id: 'video', label: t('nav_video') },
    { id: 'decor', label: t('nav_decor') },
    { id: 'oglinda', label: t('nav_oglinda') },
    { id: 'contact', label: t('nav_contact') }
  ];

  const handleLinkClick = (id: string) => {
    setIsOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header
        id="navbar-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || activePage !== 'acasa'
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100 py-3'
            : 'bg-white/90 shadow-sm border-b border-neutral-100 py-4'
        }`}
      >
        <div id="navbar-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Brand */}
          <button
            id="brand-logo-btn"
            onClick={() => handleLinkClick('acasa')}
            className="flex flex-col text-left group cursor-pointer"
          >
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-neutral-900 group-hover:text-emerald-700 transition-colors">
              Nițu Events
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                id={`nav-link-${link.id}`}
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`font-sans text-xs uppercase tracking-widest transition-all hover:text-emerald-600 relative py-2 ${
                  activePage === link.id
                    ? 'text-emerald-600 font-bold'
                    : 'text-neutral-600'
                }`}
              >
                {link.label}
                {activePage === link.id && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Call actions & Socials & Translations */}
          <div id="header-actions" className="hidden lg:flex items-center space-x-3">
            {/* Translation switch buttons */}
            <div id="translation-switches" className="flex items-center space-x-1.5 bg-neutral-100 border border-neutral-200 p-1 rounded-full mr-1.5 select-none">
              <button
                id="btn-lang-ro"
                onClick={() => onSetLang('ro')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  lang === 'ro'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-neutral-500 hover:text-emerald-700'
                }`}
                title="Română"
              >
                RO
              </button>
              <button
                id="btn-lang-en"
                onClick={() => onSetLang('en')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-neutral-500 hover:text-emerald-700'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Call Button */}
            <a
              id="header-call-btn"
              href={`tel:${config.phoneNumber}`}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-widest rounded-full shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
              title={t('nav_call')}
            >
              <Phone className="h-4 w-4" />
              <span>{t('nav_call')}</span>
            </a>

            <a
              id="fb-header-icon"
              href={config.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-neutral-500 hover:text-emerald-600 hover:bg-neutral-100 rounded-full transition-all"
              title="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile Menu Action */}
          <div id="mobile-menu-container" className="flex items-center space-x-3 lg:hidden">
            {/* Direct Language Switcher in Mobile Mode */}
            <div id="mobile-lang-switch" className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-[10px] font-bold">
              <button
                id="mob-lang-ro"
                onClick={() => onSetLang('ro')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${lang === 'ro' ? 'bg-emerald-600 text-white' : 'text-neutral-500'}`}
              >
                RO
              </button>
              <button
                id="mob-lang-en"
                onClick={() => onSetLang('en')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${lang === 'en' ? 'bg-emerald-600 text-white' : 'text-neutral-500'}`}
              >
                EN
              </button>
            </div>

            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-neutral-600 hover:text-emerald-600 bg-neutral-100 rounded-lg border border-neutral-200 transition-color"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Slide-out Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu-drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-[60px] z-40 lg:hidden bg-white border-b border-neutral-200 shadow-2xl py-6 px-4 animate-fadeIn"
          >
            <div id="mobile-links-wrapper" className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <button
                  id={`mobile-link-${link.id}`}
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`font-sans text-sm uppercase tracking-widest text-left py-2.5 px-4 rounded-lg transition-all ${
                    activePage === link.id
                      ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600 font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div id="mobile-contact-bar" className="border-t border-neutral-100 pt-4 flex flex-wrap gap-2 justify-center">
                <a
                  id="mobile-call-btn"
                  href={`tel:${config.phoneNumber}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <Phone className="h-4 w-4" />
                  <span>{t('nav_call')}</span>
                </a>
                <a
                  id="mobile-fb-btn"
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-all"
                >
                  <Facebook className="h-3.5 w-3.5 text-blue-600" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

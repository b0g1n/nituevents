/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Calendar, ArrowDown } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';

interface HeroProps {
  onNavigate: (sectionId: string) => void;
  lang: Language;
  slideshowImages?: string[];
}

export default function Hero({ onNavigate, lang, slideshowImages }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = (key: keyof typeof TRANSLATIONS['ro']) => TRANSLATIONS[lang][key] || TRANSLATIONS['ro'][key];

  const defaultImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920'
  ];
  
  const activeImages = slideshowImages && slideshowImages.length > 0 ? slideshowImages : defaultImages;

  const HERO_SLIDES = activeImages.map((img, idx) => {
    const titleKeys: (keyof typeof TRANSLATIONS['ro'])[] = ['hero_title_1', 'hero_title_2', 'hero_title_3'];
    const subKeys: (keyof typeof TRANSLATIONS['ro'])[] = ['hero_sub_1', 'hero_sub_2', 'hero_sub_3'];
    return {
      image: img,
      title: t(titleKeys[idx % titleKeys.length]),
      subtitle: t(subKeys[idx % subKeys.length])
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  return (
    <section id="hero-section" className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Slideshow with Image Overlays */}
      <div id="slideshow-container" className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            id={`slide-bg-${currentSlide}`}
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide]?.image})` }}
          />
        </AnimatePresence>
        {/* Artistic radial gradients for maximum readability & dramatic effect */}
        <div id="hero-overlay-dark" className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-neutral-950/40 z-1" />
        <div id="hero-overlay-radial" className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0a0a0a_95%)] z-1" />
      </div>

      {/* Hero Centralized Content */}
      <div id="hero-content" className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-12 text-center flex flex-col items-center">
        {/* Floating pill indicators for Nițu Events */}
        <motion.div
          id="hero-floating-pills"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6"
        >
          {['FOTO', 'VIDEO', 'DECOR NUNTĂ', 'OGLINDA MAGICĂ'].map((tag, idx) => (
            <span
              id={`hero-tag-${idx}`}
              key={tag}
              className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-4 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Dynamic Typography Slides */}
        <div id="hero-slide-text" className="min-h-[180px] sm:min-h-[140px] md:min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              id={`slide-text-wrapper-${currentSlide}`}
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <h1 id="hero-main-title" className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-4 sm:mb-6">
                {HERO_SLIDES[currentSlide]?.title}
              </h1>
              <p id="hero-subtext" className="font-sans text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-light">
                {HERO_SLIDES[currentSlide]?.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action button calls */}
        <motion.div
          id="hero-call-to-actions"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto"
        >
          <button
            id="hero-cta-booking"
            onClick={() => onNavigate('contact')}
            className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold uppercase tracking-widest rounded-full shadow-lg hover:shadow-emerald-500/20 shadow-emerald-500/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span>{t('hero_cta')}</span>
          </button>
          
          <button
            id="hero-cta-portfolio"
            onClick={() => onNavigate('foto')}
            className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white hover:border-emerald-500 text-sm font-semibold uppercase tracking-widest rounded-full transition-all cursor-pointer"
          >
            <span>{t('hero_portfolio_cta')}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>

      {/* Bullet Dot Indicators */}
      <div id="slide-indicators" className="absolute bottom-24 left-0 right-0 z-10 flex justify-center space-x-2.5">
        {HERO_SLIDES.map((_, idx) => (
          <button
            id={`indicator-dot-${idx}`}
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
              currentSlide === idx ? 'w-8 bg-emerald-500' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Scroll Down Hint Anchor */}
      <div id="scroll-hint-wrapper" className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center select-none animate-bounce">
        <button
          id="scroll-hint-btn"
          onClick={() => onNavigate('despre')}
          className="text-neutral-400 hover:text-emerald-400 transition-colors flex flex-col items-center"
        >
          <span className="text-[10px] uppercase font-sans tracking-[0.2em] mb-1">{t('nav_despre')}</span>
          <ArrowDown className="h-3 w-3" />
        </button>
      </div>
    </section>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Heart, Image as ImageIcon, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { TRANSLATIONS, Language } from '../translations';

interface DespreProps {
  onLearnMore: () => void;
  lang: Language;
}

export default function Despre({ onLearnMore, lang }: DespreProps) {
  const t = (key: keyof typeof TRANSLATIONS['ro']) => TRANSLATIONS[lang][key] || TRANSLATIONS['ro'][key];

  return (
    <section id="despre-section" className="py-24 bg-white text-neutral-900 relative overflow-hidden">
      {/* Decorative premium light accents */}
      <div id="despre-light-decor" className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none" />
      <div id="despre-light-decor-2" className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-emerald-50/20 rounded-full blur-3xl pointer-events-none" />

      <div id="despre-container" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Story Layout Centered */}
        <div id="despre-text-col" className="flex flex-col justify-center items-center text-center max-w-3xl mx-auto">
          <span id="despre-section-tag" className="text-emerald-600 text-xs uppercase tracking-[0.2em] font-semibold mb-3 block">
            {t('despre_tag')}
          </span>
          <h2 id="despre-main-title" className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            {t('despre_title')}
          </h2>
          
          <div id="despre-paragraphs" className="space-y-6 text-neutral-700 text-sm sm:text-base leading-relaxed font-light text-left w-full">
            <p id="despre-p1" className="font-sans">
              {t('despre_p1')}
            </p>
            
            <p id="despre-p2" className="font-sans">
               {t('despre_p2')}
            </p>
            
            <div id="despre-serif-quote" className="bg-emerald-50/50 border-l-4 border-emerald-500 p-6 rounded-r-2xl my-8 text-left w-full">
              <p className="font-serif italic text-base sm:text-lg text-emerald-800 leading-relaxed">
                {t('despre_quote')}
              </p>
            </div>
          </div>

          {/* Premium Equipment Highlights */}
          <div id="despre-features-list" className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 mb-10 w-full text-left">
            <div id="despre-feat-1" className="flex items-start space-x-3.5 p-4 rounded-xl border border-neutral-100 bg-emerald-50/10">
              <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-950">
                  {t('despre_feat1_title')}
                </h4>
                <p className="text-xs text-neutral-500 leading-normal mt-1 font-light">
                  {t('despre_feat1_desc')}
                </p>
              </div>
            </div>

            <div id="despre-feat-2" className="flex items-start space-x-3.5 p-4 rounded-xl border border-neutral-100 bg-emerald-50/10">
              <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-950">
                  {t('despre_feat2_title')}
                </h4>
                <p className="text-xs text-neutral-500 leading-normal mt-1 font-light">
                  {t('despre_feat2_desc')}
                </p>
              </div>
            </div>
          </div>

          <button
            id="despre-cta-portfolio"
            onClick={onLearnMore}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-sans tracking-widest font-bold uppercase flex items-center group cursor-pointer"
          >
            <span>{t('despre_cta_portfolio')}</span>
            <span className="ml-2 transform group-hover:translate-x-1.5 transition-transform">→</span>
          </button>
        </div>

      </div>
    </section>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';

interface LightboxProps {
  item: MediaItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  whatsappNumber: string;
}

export default function Lightbox({ item, onClose, onPrev, onNext, whatsappNumber }: LightboxProps) {
  // Listen to keyboard shortcuts
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose, onPrev, onNext]);

  if (!item) return null;

  // Prefilled WhatsApp message
  const prefilledText = encodeURIComponent(
    `Bună ziua! Am văzut această imagine superbă în portofoliul dvs. ("${item.title}") și aș dori să aflu mai multe detalii despre servicii asemănătoare.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${prefilledText}`;

  return (
    <AnimatePresence>
      <motion.div
        id="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md text-white select-none"
      >
        {/* Top bar control menu */}
        <div id="lightbox-topbar" className="w-full flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent relative z-10">
          <div id="lightbox-brand-label" className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-sans tracking-widest text-amber-400 font-bold">
              Nițu Events Portofoliu
            </span>
            <span className="text-xs text-neutral-400 truncate max-w-[200px] sm:max-w-xs font-light">
              {item.title}
            </span>
          </div>
          
          <div id="lightbox-actions" className="flex items-center space-x-3">
            <a
              id="lightbox-wa-inquire"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold tracking-wider uppercase transition-all"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cere preț</span>
            </a>
            
            <button
              id="lightbox-close-btn"
              onClick={onClose}
              className="p-2 bg-neutral-800/40 hover:bg-neutral-800 text-white rounded-full border border-white/5 transition-all text-xl cursor-pointer"
              title="Închide (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Central Display Area with Image/Video & Navigation arrows */}
        <div id="lightbox-display" className="flex-1 flex items-center justify-between relative px-2 sm:px-4 md:px-12">
          {/* Previous Arrow */}
          <button
            id="lightbox-prev-btn"
            onClick={onPrev}
            className="p-3 bg-neutral-900/40 hover:bg-neutral-800 text-white hover:text-amber-300 rounded-full border border-white/5 transition-all absolute left-2 md:left-6 z-10 cursor-pointer"
            title="Precedentul (Săgeată Stânga)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Media Core Content */}
          <div id="lightbox-media-wrapper" className="w-full h-full flex items-center justify-center p-4 max-h-[72vh] md:max-h-[80vh]">
            <AnimatePresence mode="wait">
              <motion.div
                id={`lightbox-content-animate-${item.id}`}
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative max-w-full max-h-full flex items-center justify-center"
              >
                {item.type === 'photo' ? (
                  <img
                    id={`lightbox-img-${item.id}`}
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[70vh] md:max-h-[76vh] object-contain rounded shadow-2xl select-text"
                  />
                ) : (
                  <div className="relative aspect-video max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl bg-black rounded shadow-2xl overflow-hidden self-center border border-white/5">
                    {/* HTML5 video player for mp4 previews */}
                    <video
                      id={`lightbox-video-player-${item.id}`}
                      src={item.url}
                      controls
                      autoPlay
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Arrow */}
          <button
            id="lightbox-next-btn"
            onClick={onNext}
            className="p-3 bg-neutral-900/40 hover:bg-neutral-800 text-white hover:text-amber-300 rounded-full border border-white/5 transition-all absolute right-2 md:right-6 z-10 cursor-pointer"
            title="Următorul (Săgeată Dreapta)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Footer info box containing metadata description & tags */}
        <div id="lightbox-footer" className="w-full bg-gradient-to-t from-black to-black/80 border-t border-white/5 p-4 sm:p-6 md:px-12 relative z-10 text-left">
          <div id="lightbox-footer-content" className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div id="lightbox-meta" className="space-y-1">
              <span className="px-2 py-0.5 bg-amber-500/10 text-[9px] uppercase tracking-widest text-amber-400 rounded-full border border-amber-500/20 mr-2 inline-block font-sans">
                {item.category === 'foto' ? 'Galerie Foto' :
                 item.category === 'video' ? 'Galerie Video' :
                 item.category === 'decor' ? 'Decor Nuntă' : 'Oglindă Magică'}
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white mb-1">
                {item.title}
              </h3>
              {item.description && (
                <p className="font-sans text-xs text-neutral-300 font-light leading-relaxed max-w-xl">
                  {item.description}
                </p>
              )}
            </div>

            {/* Tags indicator */}
            {item.tags && item.tags.length > 0 && (
              <div id="lightbox-tags-wrapper" className="flex flex-wrap gap-1 sm:self-center">
                {item.tags.map((tag) => (
                  <span
                    id={`lightbox-tag-${tag}`}
                    key={tag}
                    className="text-[10px] text-neutral-400 bg-neutral-800/60 px-2 py-1 rounded border border-white/5 font-sans"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

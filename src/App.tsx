/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Facebook,
  Camera,
  Video,
  Sparkles,
  Heart,
  ChevronRight,
  MapPin,
  Mail,
  Calendar,
  Lock,
  Eye,
  CheckCircle,
  Clock,
  ArrowRight,
  Folder,
  Image as ImageIcon,
  FolderClosed,
  ChevronUp,
  User,
  Star,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Type definitions & Seed Data Methods
import { Album, MediaItem, ContactLead, AppConfig } from './types';
import {
  initializeAppData,
  getStoredData,
  setStoredData,
  DEFAULT_CONFIG
} from './data';

// Custom Sub-components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Despre from './components/Despre';
import Lightbox from './components/Lightbox';
import ContactForm from './components/ContactForm';
import AdminPanel from './components/AdminPanel';
import { TRANSLATIONS, Language } from './translations';

export default function App() {
  const [lang, setLang] = useState<Language>('ro');

  // Database states
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);

  // Page Routing & UI States
  const [activePage, setActivePage] = useState('acasa');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Gallery Filters
  const [activeAlbumId, setActiveAlbumId] = useState<string>('all');

  // Lightbox Media Control
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  // Scroll to Top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  // WhatsApp chatbot state
  const [waWelcomeMsgVisible, setWaWelcomeMsgVisible] = useState(false);

  // Translation function helper
  const t = (key: keyof typeof TRANSLATIONS['ro']) => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS['ro'][key];
  };

  // 1. Initialize data on load
  useEffect(() => {
    initializeAppData();
    
    // Read cached stores
    setConfig(getStoredData('nitu_events_config', DEFAULT_CONFIG));
    setAlbums(getStoredData('nitu_events_albums', []));
    setMediaItems(getStoredData('nitu_events_media', []));
    setLeads(getStoredData('nitu_events_leads', []));

    // Read stored language choice
    const storedLang = localStorage.getItem('nitu_events_lang') as Language;
    if (storedLang === 'ro' || storedLang === 'en') {
      setLang(storedLang);
    }

    // Restore login session if applicable
    const isLogged = sessionStorage.getItem('nitu_events_admin_active') === 'true';
    if (isLogged) {
      setIsAdminLoggedIn(true);
    }

    // Trigger floating WhatsApp bubble alert after delay
    const waTimer = setTimeout(() => {
      setWaWelcomeMsgVisible(true);
    }, 7000);

    const handleScrollVisibility = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScrollVisibility);

    // Discrete URL Admin check (?admin=true)
    const handleUrlQueryCheck = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.has('admin')) {
        const isLogged = sessionStorage.getItem('nitu_events_admin_active') === 'true';
        if (isLogged) {
          setIsAdminPanelOpen(true);
        } else {
          setIsAuthModalOpen(true);
        }
        // Clean target query param to protect identity but keep logic
        const url = new URL(window.location.href);
        url.searchParams.delete('admin');
        window.history.replaceState({}, '', url.toString());
      }
    };
    
    // Initial and periodic hash or search check
    handleUrlQueryCheck();
    window.addEventListener('popstate', handleUrlQueryCheck);

    return () => {
      clearTimeout(waTimer);
      window.removeEventListener('scroll', handleScrollVisibility);
      window.removeEventListener('popstate', handleUrlQueryCheck);
    };
  }, []);

  // Sync scroll detection to top
  const handleNavigateToPage = (pageId: string) => {
    setActivePage(pageId);
    setActiveAlbumId('all'); // Reset choice
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Admin Security Verification Callbacks
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authPassword === config.adminPasswordHash) {
      setIsAdminLoggedIn(true);
      setIsAuthModalOpen(false);
      setIsAdminPanelOpen(true);
      setAuthPassword('');
      sessionStorage.setItem('nitu_events_admin_active', 'true');
    } else {
      setAuthError(
        lang === 'ro' 
          ? 'Parolă incorectă. Încercați din nou.' 
          : 'Incorrect password. Please try again.'
      );
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminPanelOpen(false);
    sessionStorage.removeItem('nitu_events_admin_active');
    alert(
      lang === 'ro' 
        ? 'Ieșire din panoul administrativ realizată.' 
        : 'Logged out from Admin successfully.'
    );
  };

  // Language persist state change handler
  const handleSetLanguage = (selected: Language) => {
    setLang(selected);
    localStorage.setItem('nitu_events_lang', selected);
  };

  // 3. Database mutation callbacks passed to Admin component
  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setStoredData('nitu_events_config', newConfig);
  };

  const addAlbum = (album: Album) => {
    const list = [album, ...albums];
    setAlbums(list);
    setStoredData('nitu_events_albums', list);
  };

  const deleteAlbum = (albumId: string) => {
    const list = albums.filter((a) => a.id !== albumId);
    setAlbums(list);
    setStoredData('nitu_events_albums', list);

    // Unlink media items from deleted album back to category general
    const updatedMedia = mediaItems.map((m) => {
      if (m.albumId === albumId) {
        return { ...m, albumId: 'general' };
      }
      return m;
    });
    setMediaItems(updatedMedia);
    setStoredData('nitu_events_media', updatedMedia);
  };

  const addMediaItem = (item: MediaItem) => {
    const list = [item, ...mediaItems];
    setMediaItems(list);
    setStoredData('nitu_events_media', list);
  };

  const deleteMediaItem = (itemId: string) => {
    const list = mediaItems.filter((m) => m.id !== itemId);
    setMediaItems(list);
    setStoredData('nitu_events_media', list);
  };

  const addLead = (lead: ContactLead) => {
    const list = [lead, ...leads];
    setLeads(list);
    setStoredData('nitu_events_leads', list);
  };

  const updateLeadStatus = (leadId: string, status: 'nou' | 'contactat' | 'arhivati') => {
    const list = leads.map((l) => (l.id === leadId ? { ...l, status } : l));
    setLeads(list);
    setStoredData('nitu_events_leads', list);
  };

  const deleteLead = (leadId: string) => {
    const list = leads.filter((l) => l.id !== leadId);
    setLeads(list);
    setStoredData('nitu_events_leads', list);
  };

  // Evaluation for specific active categories on their corresponding views
  const getPageCategory = (): 'foto' | 'video' | 'decor' | 'oglinda' | null => {
    if (activePage === 'foto') return 'foto';
    if (activePage === 'video') return 'video';
    if (activePage === 'decor') return 'decor';
    if (activePage === 'oglinda') return 'oglinda';
    return null;
  };

  const activeCategory = getPageCategory();
  
  // Grid filters evaluation
  const filteredCategoryItems = activeCategory 
    ? mediaItems.filter((item) => item.category === activeCategory)
    : [];
  
  const finalFilteredItems = filteredCategoryItems.filter((item) => {
    if (activeAlbumId === 'all') return true;
    return item.albumId === activeAlbumId;
  });

  const activeCategoryAlbums = activeCategory 
    ? albums.filter((a) => a.category === activeCategory)
    : [];

  // Lightbox navigation helper
  const handleLightboxPrev = () => {
    if (!lightboxItem) return;
    const idx = finalFilteredItems.findIndex((m) => m.id === lightboxItem.id);
    if (idx > 0) {
      setLightboxItem(finalFilteredItems[idx - 1]);
    } else {
      setLightboxItem(finalFilteredItems[finalFilteredItems.length - 1]); // Wrap
    }
  };

  const handleLightboxNext = () => {
    if (!lightboxItem) return;
    const idx = finalFilteredItems.findIndex((m) => m.id === lightboxItem.id);
    if (idx < finalFilteredItems.length - 1) {
      setLightboxItem(finalFilteredItems[idx + 1]);
    } else {
      setLightboxItem(finalFilteredItems[0]); // Wrap
    }
  };

  // Dynamic translated Testimonials block
  const getTestimonials = () => [
    {
      name: 'Sebastian & Ioana',
      event: lang === 'ro' ? 'Nuntă Craiova - August 2025' : 'Wedding Craiova - August 2025',
      text: lang === 'ro' 
        ? 'Echipa Nițu Events ne-a depășit complet așteptările! Albumul foto este o adevărată operă de artă, filmările cinematice ne-au făcut să plângem din nou de fericire, iar Oglinda Magică a fost atracția principală a serii. Seriozitate maximă!'
        : 'The Nițu Events team completely exceeded our expectations! Our wedding photo album is a masterpiece, the cinematic films brought us to tears of happiness, and the Magic Mirror booth stole the show. High integrity!',
      rating: 5
    },
    {
      name: 'Radu & Elena',
      event: lang === 'ro' ? 'Nuntă București - Septembrie 2025' : 'Wedding Bucharest - September 2025',
      text: lang === 'ro' 
        ? 'Aranjamentele florale și decorul prezidiului au transformat complet salonul într-un decor de basm! Finuț, elegant și extrem de rafinat. De asemenea, fotograful a fost genial, reușind să ne destindă chiar și în momentele cele mai tensionate.'
        : 'The floral design and the presidential setup transformed the ballroom into a fairytale backdrop! Elegant, crisp, and extremely refined. The photographer was also brilliant, putting us at absolute ease during frantic moments.',
      rating: 5
    },
    {
      name: 'Alina Popescu',
      event: lang === 'ro' ? 'Botez Andrei - Octombrie 2025' : 'Christening Andrei - October 2025',
      text: lang === 'ro' 
        ? 'Recomand cu tot dragul! Am închiriat Oglinda Magică pentru botezul băiețelului nostru. Printurile sunt clare și pe hârtie magnetică, iar asistentul a fost extrem de răbdător și amuzant cu copiii. Toți invitații au plecat acasă cu zâmbetul pe buze!'
        : 'I warmly recommend their team! We hired the Magic Mirror booth for our baby boy’s christening. The magnetic prints are super sharp, and the assistant was incredibly patient and humorous. Every guest left with a giant smile!',
      rating: 5
    }
  ];

  return (
    <div id="application-root" className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white antialiased">
      
      {/* 1. Navbar Navigation */}
      <Navbar
        config={config}
        lang={lang}
        onSetLang={handleSetLanguage}
        activePage={activePage}
        onNavigate={handleNavigateToPage}
      />

      {/* Main Multi-page Body Container */}
      <main id="multipage-wrapper" className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* PAGE A: ACASĂ (HOME) */}
          {activePage === 'acasa' && (
            <motion.div
              id="page-acasa"
              key="page-acasa"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <Hero onNavigate={handleNavigateToPage} lang={lang} slideshowImages={config.slideshowImages} />
              
              {/* Home Quick Intro Highlights */}
              <section id="home-intro-highlights" className="py-24 bg-[#f4fbf7]/60 border-t border-b border-emerald-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.25em] mb-3 block">
                      NIȚU EVENTS
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 animate-fadeIn">
                      {lang === 'ro' ? 'Servicii Premium Pentru Evenimente De Vis' : 'Bespoke Premium Services For Fairytale Events'}
                    </h2>
                    <p className="font-sans text-neutral-600 text-sm sm:text-base font-light leading-relaxed">
                      {lang === 'ro' 
                        ? 'Fiecare detaliu al petrecerii tale este pus în valoare de experții noștri. Descoperă paginile dedicate diferitelor noastre divizii de servicii:'
                        : 'Every fine detail of your ballroom celebration is enhanced by our team. Explore our dedicated service modules and specialties:'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature Card 1 */}
                    <div 
                      onClick={() => handleNavigateToPage('foto')}
                      className="p-8 bg-white shadow-sm border border-neutral-100 hover:border-emerald-500/20 hover:shadow-md hover:-translate-y-0.5 rounded-2xl transition-all cursor-pointer group text-left"
                    >
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 w-fit mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Camera className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-neutral-900 mb-3 group-hover:text-emerald-700 transition-colors">
                        {t('nav_foto')} & {t('nav_video')}
                      </h3>
                      <p className="font-sans text-neutral-600 text-xs sm:text-sm font-light leading-relaxed mb-6">
                        {lang === 'ro'
                          ? 'Mărturia vizuală a iubirii voastre. Capturăm amintiri pe peliculă de cinema și fotografii de colecție.'
                          : 'Visual testimonies of your love story. We capture collections of timeless, high-fidelity fine art frames.'}
                      </p>
                      <span className="text-xs text-emerald-600 group-hover:text-emerald-700 font-bold uppercase tracking-wider flex items-center">
                        <span>{lang === 'ro' ? 'Vezi Galerie' : 'View Gallery'}</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>

                    {/* Feature Card 2 */}
                    <div 
                      onClick={() => handleNavigateToPage('decor')}
                      className="p-8 bg-white shadow-sm border border-neutral-100 hover:border-emerald-500/20 hover:shadow-md hover:-translate-y-0.5 rounded-2xl transition-all cursor-pointer group text-left"
                    >
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 w-fit mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Heart className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-neutral-900 mb-3 group-hover:text-emerald-700 transition-colors">
                        {t('nav_decor')}
                      </h3>
                      <p className="font-sans text-neutral-600 text-xs sm:text-sm font-light leading-relaxed mb-6">
                        {lang === 'ro'
                          ? 'Design floral rafinat, panouri fotowall unice și scenografii prezidentiale care transpun visele în realitate.'
                          : 'Botanical centerpieces, photowalls, and stage installations crafted to frame your ballroom elegantly.'}
                      </p>
                      <span className="text-xs text-emerald-600 group-hover:text-emerald-700 font-bold uppercase tracking-wider flex items-center">
                        <span>{lang === 'ro' ? 'Explorează Decoruri' : 'Explore Decors'}</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>

                    {/* Feature Card 3 */}
                    <div 
                      onClick={() => handleNavigateToPage('oglinda')}
                      className="p-8 bg-white shadow-sm border border-neutral-100 hover:border-emerald-500/20 hover:shadow-md hover:-translate-y-0.5 rounded-2xl transition-all cursor-pointer group text-left"
                    >
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 w-fit mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-neutral-900 mb-3 group-hover:text-emerald-700 transition-colors">
                        {t('nav_oglinda')}
                      </h3>
                      <p className="font-sans text-neutral-600 text-xs sm:text-sm font-light leading-relaxed mb-6">
                        {lang === 'ro'
                          ? 'Multe zâmbete, amintiri imprimate pe loc și distracție garantată. Accesorii vesele și carismatice pentru toți invitații.'
                          : 'High-quality prints delivered on the spot, complete props array, customized frames, and guaranteed entertainment for all guests.'}
                      </p>
                      <span className="text-xs text-emerald-600 group-hover:text-emerald-700 font-bold uppercase tracking-wider flex items-center">
                        <span>{lang === 'ro' ? 'Detalii Oglindă' : 'Mirror Details'}</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* PAGE B: DESPRE NOI (ABOUT) */}
          {activePage === 'despre' && (
            <motion.div
              id="page-despre"
              key="page-despre"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="pt-24 min-h-screen"
            >
              <Despre onLearnMore={() => handleNavigateToPage('foto')} lang={lang} />
            </motion.div>
          )}

          {/* PAGE C: PHOTO GALLERY */}
          {activePage === 'foto' && (
            <motion.div
              id="page-foto"
              key="page-foto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="pt-28 pb-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div id="portfolio-header" className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.25em] mb-3 block">
                    {t('port_tab_foto')}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 animate-fadeIn">
                    {t('port_title')}
                  </h2>
                  <p className="font-sans text-neutral-600 text-sm leading-relaxed max-w-xl mx-auto font-light">
                    {lang === 'ro' 
                      ? 'Admiră galeriile foto de nuntă realizate în ultimul sezon. Capturăm zâmbete veridice și cadre de vis.'
                      : 'Behold our wedding gallery selection documented during the past wedding seasons. Elegant & crisp frames.'}
                  </p>
                </div>

                {/* Sub-filtering: Folder / Album navigator Chips */}
                {activeCategoryAlbums.length > 0 && (
                  <div id="folder-chips-container" className="mb-10 text-center animate-fadeIn">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block mb-3 animate-pulse">
                      {t('port_folders_title')}
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        id="album-filter-all"
                        onClick={() => setActiveAlbumId('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                          activeAlbumId === 'all'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950'
                        }`}
                      >
                        <FolderClosed className="h-3.5 w-3.5" />
                        <span>{t('port_all_folders')} ({filteredCategoryItems.length})</span>
                      </button>

                      {activeCategoryAlbums.map((alb) => (
                        <button
                          id={`album-filter-trigger-${alb.id}`}
                          key={alb.id}
                          onClick={() => setActiveAlbumId(alb.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                            activeAlbumId === alb.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                              : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950'
                          }`}
                        >
                          <Folder className="h-3.5 w-3.5" />
                          <span>{alb.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Render Grid items */}
                {finalFilteredItems.length === 0 ? (
                  <div id="empty-gallery-grid" className="py-20 text-center border border-neutral-200 bg-neutral-50 rounded-2xl max-w-2xl mx-auto">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-35 text-emerald-600" />
                    <p className="font-serif text-lg text-neutral-700">{t('port_empty')}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t('port_empty_sub')}</p>
                  </div>
                ) : (
                  <div id="gallery-mesh-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {finalFilteredItems.map((item) => (
                      <motion.div
                        id={`media-card-${item.id}`}
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setLightboxItem(item)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm select-none aspect-[4/3] sm:aspect-square"
                      >
                        <img
                          id={`card-img-${item.id}`}
                          src={item.url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div id={`card-overlay-${item.id}`} className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-5">
                          <div className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-emerald-600 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PAGE D: VIDEO GALLERY */}
          {activePage === 'video' && (
            <motion.div
              id="page-video"
              key="page-video"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="pt-28 pb-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div id="video-header" className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.25em] mb-3 block">
                    {t('port_tab_video')}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 animate-fadeIn">
                    {lang === 'ro' ? 'Filme de Nuntă Cinematice' : 'Cinematic Wedding Films'}
                  </h2>
                  <p className="font-sans text-neutral-600 text-sm leading-relaxed max-w-xl mx-auto font-light">
                    {lang === 'ro' 
                      ? 'Vizualizează fragmente de dragoste montate cinematic. Fiecare teaser redă ritmul unic al celebrării voastre.'
                      : 'Review visual excerpts of love structured with pure cinematic pacing. Every teaser captures details beautifully.'}
                  </p>
                </div>

                {/* Sub-filtering: Folder / Album navigator Chips */}
                {activeCategoryAlbums.length > 0 && (
                  <div id="folder-chips-container" className="mb-10 text-center animate-fadeIn">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block mb-3">
                      {t('port_folders_title')}
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        id="album-filter-all"
                        onClick={() => setActiveAlbumId('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                          activeAlbumId === 'all'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950'
                        }`}
                      >
                        <FolderClosed className="h-3.5 w-3.5" />
                        <span>{t('port_all_folders')} ({filteredCategoryItems.length})</span>
                      </button>

                      {activeCategoryAlbums.map((alb) => (
                        <button
                          id={`album-filter-trigger-${alb.id}`}
                          key={alb.id}
                          onClick={() => setActiveAlbumId(alb.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                            activeAlbumId === alb.id
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                              : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950'
                          }`}
                        >
                          <Folder className="h-3.5 w-3.5" />
                          <span>{alb.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Render Grid items */}
                {finalFilteredItems.length === 0 ? (
                  <div id="empty-gallery-grid-video" className="py-20 text-center border border-neutral-200 bg-neutral-50 rounded-2xl max-w-2xl mx-auto">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-35 text-emerald-600 animate-pulse" />
                    <p className="font-serif text-lg text-neutral-700">{t('port_empty')}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t('port_empty_sub')}</p>
                  </div>
                ) : (
                  <div id="gallery-mesh-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {finalFilteredItems.map((item) => (
                      <motion.div
                        id={`media-card-${item.id}`}
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setLightboxItem(item)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm select-none aspect-[4/3] sm:aspect-square"
                      >
                        <div className="w-full h-full relative overflow-hidden bg-neutral-100">
                          <img
                            id={`card-video-thumb-${item.id}`}
                            src={item.url || "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800"}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-14 h-14 bg-emerald-600/90 group-hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                              <Video className="h-5 w-5 fill-white" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PAGE E: DECOR & ACCESSORIES */}
          {activePage === 'decor' && (
            <motion.div
              id="page-decor"
              key="page-decor"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="pt-28 pb-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Intro Content block */}
                <div id="decor-intro-block" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
                  <div id="decor-visual-col" className="col-span-1 lg:col-span-12 xl:col-span-5 relative">
                    <div id="decor-image-mockup" className="relative max-w-sm mx-auto aspect-[3/4] bg-[#f4fbf7] border border-emerald-500/10 rounded-2xl overflow-hidden shadow-md">
                      <img
                        id="decor-preview-img-flowers"
                        src={config.decorMainImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'}
                        alt="Decor Prezidiu premium"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover brightness-95 filter hover:brightness-100 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  </div>

                  <div id="decor-text-col" className="col-span-1 lg:col-span-12 xl:col-span-7 text-left space-y-6">
                    <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mb-2 block">
                      {t('decor_tag')}
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                      {t('decor_title')}
                    </h2>
                    <p className="font-sans text-neutral-600 text-sm sm:text-base font-light leading-relaxed">
                      {t('decor_desc')}
                    </p>
                  </div>
                </div>

                {/* Sub-filtering: Folder / Album navigator Chips */}
                {activeCategoryAlbums.length > 0 && (
                  <div id="folder-chips-container" className="mb-10 text-center animate-fadeIn">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block mb-3">
                      {t('port_folders_title')}
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        id="album-filter-all"
                        onClick={() => setActiveAlbumId('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                          activeAlbumId === 'all'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950'
                        }`}
                      >
                        <FolderClosed className="h-3.5 w-3.5" />
                        <span>{t('port_all_folders')} ({filteredCategoryItems.length})</span>
                      </button>

                      {activeCategoryAlbums.map((alb) => (
                        <button
                          id={`album-filter-trigger-${alb.id}`}
                          key={alb.id}
                          onClick={() => setActiveAlbumId(alb.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                            activeAlbumId === alb.id
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                              : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950'
                          }`}
                        >
                          <Folder className="h-3.5 w-3.5" />
                          <span>{alb.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid Portfolio representation */}
                {finalFilteredItems.length === 0 ? (
                  <div id="empty-gallery-grid-decor" className="py-20 text-center border border-neutral-200 bg-neutral-50 rounded-2xl max-w-2xl mx-auto">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-35 text-emerald-600" />
                    <p className="font-serif text-lg text-neutral-700">{t('port_empty')}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t('port_empty_sub')}</p>
                  </div>
                ) : (
                  <div id="gallery-mesh-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {finalFilteredItems.map((item) => (
                      <motion.div
                        id={`media-card-${item.id}`}
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setLightboxItem(item)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm select-none aspect-[4/3] sm:aspect-square"
                      >
                        <img
                          id={`card-img-${item.id}`}
                          src={item.url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div id={`card-overlay-${item.id}`} className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-5">
                          <div className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-emerald-600 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PAGE F: OGLINDA MAGICĂ */}
          {activePage === 'oglinda' && (
            <motion.div
              id="page-oglinda"
              key="page-oglinda"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="pt-28 pb-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Intro details block */}
                <div id="oglinda-intro-block" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
                  <div id="oglinda-text-col" className="col-span-1 lg:col-span-12 xl:col-span-7 text-left space-y-6">
                    <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mb-2 block">
                      {t('oglinda_tag')}
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight animate-fadeIn">
                      {t('oglinda_title')}
                    </h2>
                    <p className="font-sans text-neutral-600 text-sm sm:text-base font-light leading-relaxed">
                      {t('oglinda_desc')}
                    </p>
                  </div>

                  <div id="oglinda-visual-col" className="col-span-1 lg:col-span-12 xl:col-span-5 relative">
                    <div id="oglinda-image-mockup" className="relative max-w-sm mx-auto aspect-[3/4] bg-[#f4fbf7] border border-emerald-500/10 rounded-2xl overflow-hidden shadow-md">
                      <img
                        id="oglinda-preview-img-photobooth"
                        src={config.oglindaMainImage || 'https://images.unsplash.com/photo-1522158673370-3c2763db2d0a?auto=format&fit=crop&q=80&w=800'}
                        alt="Oglinda Magică în acțiune"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover brightness-95 filter contrast-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Sub-filtering: Folder / Album navigator Chips */}
                {activeCategoryAlbums.length > 0 && (
                  <div id="folder-chips-container" className="mb-10 text-center animate-fadeIn">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block mb-3">
                      {t('port_folders_title')}
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        id="album-filter-all"
                        onClick={() => setActiveAlbumId('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                          activeAlbumId === 'all'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950'
                        }`}
                      >
                        <FolderClosed className="h-3.5 w-3.5" />
                        <span>{t('port_all_folders')} ({filteredCategoryItems.length})</span>
                      </button>

                      {activeCategoryAlbums.map((alb) => (
                        <button
                          id={`album-filter-trigger-${alb.id}`}
                          key={alb.id}
                          onClick={() => setActiveAlbumId(alb.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                            activeAlbumId === alb.id
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                              : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950'
                          }`}
                        >
                          <Folder className="h-3.5 w-3.5" />
                          <span>{alb.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Grid items */}
                {finalFilteredItems.length === 0 ? (
                  <div id="empty-gallery-grid-mirror" className="py-20 text-center border border-neutral-200 bg-neutral-50 rounded-2xl max-w-2xl mx-auto">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-35 text-emerald-600 animate-pulse" />
                    <p className="font-serif text-lg text-neutral-700">{t('port_empty')}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t('port_empty_sub')}</p>
                  </div>
                ) : (
                  <div id="gallery-mesh-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {finalFilteredItems.map((item) => (
                      <motion.div
                        id={`media-card-${item.id}`}
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setLightboxItem(item)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm select-none aspect-[4/3] sm:aspect-square"
                      >
                        <img
                          id={`card-img-${item.id}`}
                          src={item.url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div id={`card-overlay-${item.id}`} className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-5">
                          <div className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-emerald-600 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PAGE G: CONTACT */}
          {activePage === 'contact' && (
            <motion.div
              id="page-contact"
              key="page-contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="pt-28 pb-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div id="contact-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
                  
                  {/* Left column info */}
                  <div id="contact-text-col" className="col-span-1 lg:col-span-5 text-left space-y-8">
                    <div>
                      <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mb-2 block">
                        {t('contact_tag')}
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 animate-fadeIn">
                        {t('contact_title')}
                      </h2>
                      <p className="font-sans text-neutral-600 text-sm font-light leading-relaxed">
                        {t('contact_desc')}
                      </p>
                    </div>

                    <div id="contact-details-cards" className="space-y-4 font-sans text-sm font-light">
                      {/* Phone Card */}
                      <a
                        id="contact-phone-box"
                        href={`tel:${config.phoneNumber}`}
                        className="p-4 bg-[#f4fbf7] hover:bg-[#eef9f2] border border-emerald-100 rounded-xl transition-all flex items-start space-x-4 block shadow-xs"
                      >
                        <div className="p-3 bg-[#e0f4ea] rounded-xl text-emerald-700 shrink-0 mt-0.5">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <strong className="text-neutral-900 text-xs uppercase tracking-wider block font-bold mb-0.5">{t('contact_phone_title')}</strong>
                          <span className="text-emerald-700 text-sm block font-semibold hover:text-emerald-800">{config.phoneNumberDisplay}</span>
                        </div>
                      </a>

                      {/* WhatsApp Card */}
                      <a
                        id="contact-wa-box"
                        href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-[#f4fbf7] hover:bg-[#eef9f2] border border-emerald-100 rounded-xl transition-all flex items-start space-x-4 block shadow-xs"
                      >
                        <div className="p-3 bg-[#e0f4ea] rounded-xl text-emerald-700 shrink-0 mt-0.5">
                          <MessageCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <strong className="text-emerald-700 text-xs uppercase tracking-wider block font-bold mb-0.5">{t('contact_wa_title')}</strong>
                          <span className="text-emerald-800 text-sm block font-semibold hover:text-emerald-900">{config.phoneNumberDisplay}</span>
                        </div>
                      </a>

                      {/* Facebook profile link */}
                      <a
                        id="contact-fb-box"
                        href={config.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-[#f4fbf7] hover:bg-[#eef9f2] border border-emerald-100 rounded-xl transition-all flex items-start space-x-4 block shadow-xs"
                      >
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0 mt-0.5">
                          <Facebook className="h-5 w-5" />
                        </div>
                        <div>
                          <strong className="text-[#1877f2] text-xs uppercase tracking-wider block font-bold mb-0.5">{t('contact_fb_title')}</strong>
                          <span className="text-neutral-700 text-sm block font-semibold hover:text-blue-600">Nițu Events</span>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Form */}
                  <div id="contact-form-col" className="col-span-1 lg:col-span-7">
                    <ContactForm onAddLead={addLead} whatsappNumber={config.whatsappNumber} lang={lang} />
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 9. Elegant Website Footer (All links corrected to separate page routes) */}
      <footer id="website-footer" className="bg-[#f4fbf7] border-t border-emerald-100 text-neutral-600 font-sans text-xs py-12">
        <div id="footer-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div id="footer-branding-block" className="text-center md:text-left">
            <span className="font-serif text-xl font-bold tracking-wider text-emerald-800 block mb-1">
              Nițu Events
            </span>
            <p className="text-[10px] text-neutral-500 max-w-sm">
              {t('foot_desc')}
            </p>
          </div>

          <div id="footer-copyright-links" className="flex flex-col items-center md:items-end space-y-2">
            <p className="text-[10px] text-neutral-500">
              &copy; {new Date().getFullYear()} Nițu Events. {t('foot_rights')}
            </p>
            <div className="flex items-center space-x-4">
              <button
                id="footer-navigate-acasa"
                onClick={() => handleNavigateToPage('acasa')}
                className="hover:text-emerald-600 text-neutral-600 font-bold uppercase text-[9px] tracking-wider cursor-pointer"
              >
                {t('nav_acasa')}
              </button>
              <button
                id="footer-navigate-despre"
                onClick={() => handleNavigateToPage('despre')}
                className="hover:text-emerald-600 text-neutral-600 font-bold uppercase text-[9px] tracking-wider cursor-pointer"
              >
                {t('nav_despre')}
              </button>
              <button
                id="footer-navigate-contact"
                onClick={() => handleNavigateToPage('contact')}
                className="hover:text-emerald-600 text-neutral-600 font-bold uppercase text-[9px] tracking-wider cursor-pointer"
              >
                {t('nav_contact')}
              </button>
            </div>
            <p className="text-[9px] text-neutral-500 font-serif">
              {t('foot_quote')}
            </p>
          </div>
        </div>
      </footer>

      {/* 11. Modal: Discrete Password security portal overlay for admin signin */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            id="auth-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              id="auth-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-neutral-900 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <button
                id="auth-close-overlay"
                onClick={() => {
                  setAuthPassword('');
                  setAuthError('');
                  setIsAuthModalOpen(false);
                }}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white">Autentificare Administrator</h3>
                <p className="text-[10px] text-neutral-400 leading-normal uppercase tracking-widest font-sans">Introduceți parola Nițu Events</p>
                <p className="text-[10px] text-neutral-500 italic">Parolă implicită testare: <strong className="text-neutral-300">admin123</strong></p>
              </div>

              <form id="auth-modal-form" onSubmit={handleAdminLoginSubmit} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 rounded-lg text-xs font-sans">
                    {authError}
                  </div>
                )}

                <div className="flex flex-col space-y-1">
                  <label htmlFor="auth-pass-input" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Parolă Securitate</label>
                  <input
                    id="auth-pass-input"
                    type="password"
                    required
                    autoFocus
                    placeholder="Parolă de acces..."
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-sm focus:border-amber-400 focus:outline-none w-full"
                  />
                </div>

                <button
                  id="auth-submit-pass"
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-sans font-bold uppercase tracking-widest text-xs rounded-lg transition-all cursor-pointer"
                >
                  Conectare
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 12. Dynamic Overlay Panel: The Master Panel Board dashboard */}
      {isAdminPanelOpen && (
        <AdminPanel
          config={config}
          albums={albums}
          mediaItems={mediaItems}
          leads={leads}
          onUpdateConfig={updateConfig}
          onAddAlbum={addAlbum}
          onDeleteAlbum={deleteAlbum}
          onAddMediaItem={addMediaItem}
          onDeleteMediaItem={deleteMediaItem}
          onUpdateLeadStatus={updateLeadStatus}
          onDeleteLead={deleteLead}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}

      {/* 13. Lightbox immersive player */}
      <Lightbox
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
        whatsappNumber={config.whatsappNumber}
      />

      {/* 14. Scroll to top float btn */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="scroll-to-top-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-40 p-3 bg-neutral-900 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-full border border-white/10 transition-all shadow-2xl cursor-pointer"
            title="Apasă pentru Top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}

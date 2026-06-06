/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Lock,
  LayoutDashboard,
  Users,
  FolderOpen,
  Upload,
  Key,
  Trash2,
  CheckCircle,
  Plus,
  RefreshCw,
  Image,
  Video,
  X,
  FileText,
  Eye,
  Check,
  Package,
  Calendar,
  Layers
} from 'lucide-react';
import { Album, MediaItem, ContactLead, AppConfig } from '../types';
import { resetToDefaults } from '../data';

interface AdminPanelProps {
  config: AppConfig;
  albums: Album[];
  mediaItems: MediaItem[];
  leads: ContactLead[];
  onUpdateConfig: (newConfig: AppConfig) => void;
  onAddAlbum: (album: Album) => void;
  onDeleteAlbum: (id: string) => void;
  onAddMediaItem: (item: MediaItem) => void;
  onDeleteMediaItem: (id: string) => void;
  onUpdateLeadStatus: (leadId: string, status: 'nou' | 'contactat' | 'arhivati') => void;
  onDeleteLead: (leadId: string) => void;
  onClose: () => void;
}

export default function AdminPanel({
  config,
  albums,
  mediaItems,
  leads,
  onUpdateConfig,
  onAddAlbum,
  onDeleteAlbum,
  onAddMediaItem,
  onDeleteMediaItem,
  onUpdateLeadStatus,
  onDeleteLead,
  onClose
}: AdminPanelProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'leads' | 'albums' | 'add-media' | 'all-media' | 'settings'>('leads');

  // New Album state
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumCategory, setNewAlbumCategory] = useState<'foto' | 'video' | 'decor' | 'oglinda'>('foto');
  const [newAlbumCover, setNewAlbumCover] = useState('');
  const [albumCoverUpload, setAlbumCoverUpload] = useState<string | null>(null);

  // New Media state
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaCategory, setMediaCategory] = useState<'foto' | 'video' | 'decor' | 'oglinda'>('foto');
  const [mediaAlbumId, setMediaAlbumId] = useState('general');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFileBase64, setMediaFileBase64] = useState<string | null>(null);
  const [mediaDescription, setMediaDescription] = useState('');
  const [mediaTags, setMediaTags] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Slideshow images state inside forms
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideFileBase64, setNewSlideFileBase64] = useState<string | null>(null);

  // Section representative images state
  const [decorImgUrl, setDecorImgUrl] = useState(config.decorMainImage || '');
  const [decorFileBase64, setDecorFileBase64] = useState<string | null>(null);
  const decorFileInputRef = useRef<HTMLInputElement>(null);

  const [oglindaImgUrl, setOglindaImgUrl] = useState(config.oglindaMainImage || '');
  const [oglindaFileBase64, setOglindaFileBase64] = useState<string | null>(null);
  const oglindaFileInputRef = useRef<HTMLInputElement>(null);

  // Feedback states
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Dropzone references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumCoverInputRef = useRef<HTMLInputElement>(null);
  const slideFileInputRef = useRef<HTMLInputElement>(null);

  // Helper file uploader base64 reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'media' | 'album' | 'slide' | 'decorMain' | 'oglindaMain') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === 'media') {
        setMediaFileBase64(base64String);
        // Set type automatically
        if (file.type.startsWith('video/')) {
          setMediaType('video');
        } else {
          setMediaType('photo');
        }
      } else if (target === 'album') {
        setAlbumCoverUpload(base64String);
      } else if (target === 'slide') {
        setNewSlideFileBase64(base64String);
      } else if (target === 'decorMain') {
        setDecorFileBase64(base64String);
      } else if (target === 'oglindaMain') {
        setOglindaFileBase64(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  // Create custom Folder/Album
  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!newAlbumName.trim()) {
      return setActionError('Introduceți un nume pentru album/folder.');
    }

    const coverToUse = albumCoverUpload || newAlbumCover.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800';

    const newAlbum: Album = {
      id: 'album-' + Date.now(),
      name: newAlbumName.trim(),
      category: newAlbumCategory,
      coverUrl: coverToUse,
      createdAt: new Date().toISOString()
    };

    onAddAlbum(newAlbum);
    setActionSuccess(`Albumul "${newAlbum.name}" a fost creat cu succes!`);
    setNewAlbumName('');
    setNewAlbumCover('');
    setAlbumCoverUpload(null);
    if (albumCoverInputRef.current) albumCoverInputRef.current.value = '';
  };

  // Upload new Media Item
  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    const finalUrl = mediaFileBase64 || mediaUrl.trim();
    if (!finalUrl) {
      return setActionError('Adăugați o imagine/video (încărcați un fișier de pe dispozitiv sau introduceți un link HTTPS).');
    }

    if (!mediaTitle.trim()) {
      return setActionError('Introduceți cel puțin un titlu scurt pentru identificare.');
    }

    const tagsArray = mediaTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newItem: MediaItem = {
      id: 'media-' + Date.now(),
      albumId: mediaAlbumId || 'general',
      title: mediaTitle.trim(),
      category: mediaCategory,
      url: finalUrl,
      type: mediaType,
      description: mediaDescription.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      createdAt: new Date().toISOString()
    };

    onAddMediaItem(newItem);
    setActionSuccess(`Fișierul "${newItem.title}" a fost adăugat în galerie.`);
    
    // Clear
    setMediaTitle('');
    setMediaUrl('');
    setMediaFileBase64(null);
    setMediaDescription('');
    setMediaTags('');
    setMediaAlbumId('general');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle password modification
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (currentPassword !== config.adminPasswordHash) {
      return setPasswordError('Parola curentă este incorectă.');
    }

    if (!newPassword || newPassword.length < 4) {
      return setPasswordError('Noua parolă trebuie să conțină minim 4 caractere.');
    }

    if (newPassword !== confirmPassword) {
      return setPasswordError('Parolele noi nu se potrivesc.');
    }

    const updatedConfig: AppConfig = {
      ...config,
      adminPasswordHash: newPassword
    };

    onUpdateConfig(updatedConfig);
    setPasswordSuccess('Parola de administrare a fost schimbată cu succes!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Filter albums relative to selected category in upload form
  const filteredAlbumsInForm = albums.filter((a) => a.category === mediaCategory);

  return (
    <div id="admin-dashboard-panel" className="fixed inset-0 z-50 bg-neutral-950 flex flex-col overflow-hidden text-neutral-100 font-sans border border-white/5">
      
      {/* Top action header bar */}
      <header id="admin-header" className="px-6 py-4.5 bg-neutral-900 border-b border-white/5 flex items-center justify-between">
        <div id="admin-header-title" className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500 text-neutral-950 rounded-lg">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider">Panou Administrare Portofoliu</h2>
            <p className="text-[10px] text-neutral-400">Nițu Events – Gestionează leads, foldere, și fotografii în timp real</p>
          </div>
        </div>

        <button
          id="admin-close-panel-btn"
          onClick={onClose}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1 border border-white/5 cursor-pointer"
        >
          <X className="h-4 w-4" />
          <span>Ieși la site</span>
        </button>
      </header>

      <div id="admin-body-layout" className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Drawer style Menu Layout tab navigation */}
        <nav id="admin-sidebar" className="w-full md:w-64 bg-neutral-900/60 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0 select-none">
          
          {/* Leads tab selector */}
          <button
            id="tab-btn-leads"
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span className="flex-1">Cereri Oferte</span>
            {leads.filter((l) => l.status === 'nou').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold px-1.5 animate-pulse">
                {leads.filter((l) => l.status === 'nou').length}
              </span>
            )}
          </button>

          {/* Albums/folders tab selector */}
          <button
            id="tab-btn-albums"
            onClick={() => setActiveTab('albums')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'albums'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span>Albume / Foldere</span>
          </button>

          {/* Add media tab selector */}
          <button
            id="tab-btn-add-media"
            onClick={() => setActiveTab('add-media')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'add-media'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span>Adaugă Media</span>
          </button>

          {/* View portfolio list tab selector */}
          <button
            id="tab-btn-all-media"
            onClick={() => setActiveTab('all-media')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'all-media'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4 shrink-0" />
            <span>Toate Mediile</span>
          </button>

          {/* Configuration & pass tab selector */}
          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Key className="h-4 w-4 shrink-0" />
            <span>Parolă & Setări</span>
          </button>
        </nav>

        {/* Core display panels relative to active state */}
        <main id="admin-main-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Action global feedback logs */}
          {actionSuccess && (
            <div id="admin-global-success-log" className="flex items-center justify-between p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs sm:text-sm">
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-emerald-200">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {actionError && (
            <div id="admin-global-error-log" className="flex items-center justify-between p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-xs sm:text-sm">
              <div className="flex items-center space-x-2.5">
                <Lock className="h-4.5 w-4.5 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-200">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 1. CERERI LEADS VIEW */}
          {activeTab === 'leads' && (
            <div id="panel-leads" className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Cereri de Ofertă Clienți</h3>
                  <p className="text-xs text-neutral-400">Total: {leads.length} solicitări înregistrate prin formularul online</p>
                </div>
              </div>

              {leads.length === 0 ? (
                <div id="no-leads" className="py-16 text-center text-neutral-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-serif text-base">Nicio solicitare momentan.</p>
                  <p className="text-xs">Formularul de pe site va trimite datele direct în acest istoric.</p>
                </div>
              ) : (
                <div id="leads-wrapper" className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      id={`lead-card-${lead.id}`}
                      key={lead.id}
                      className={`p-5 sm:p-6 bg-neutral-900 rounded-xl border transition-colors ${
                        lead.status === 'nou' ? 'border-amber-500/30 bg-neutral-900/90' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div id="lead-card-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5">
                            <h4 className="text-base font-bold text-white">{lead.name}</h4>
                            <span
                              className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                lead.status === 'nou'
                                  ? 'bg-amber-400 text-black animate-pulse'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {lead.status === 'nou' ? 'Solicitare Nouă' : 'Contactat'}
                            </span>
                          </div>
                          
                          <div id="lead-details-row" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                            <span className="flex items-center space-x-1">
                              <span>Tel:</span>
                              <a href={`tel:${lead.phone}`} className="text-amber-300 hover:underline">{lead.phone}</a>
                            </span>
                            {lead.email && (
                              <span className="flex items-center space-x-1">
                                <span>Email:</span>
                                <a href={`mailto:${lead.email}`} className="text-amber-300 hover:underline">{lead.email}</a>
                              </span>
                            )}
                            {lead.eventDate && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-amber-500" />
                                <span>Dată Eveniment: <strong className="text-neutral-200">{lead.eventDate}</strong></span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges for service type */}
                        <div id="lead-service-badge" className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] text-amber-300 uppercase tracking-widest font-semibold flex items-center space-x-1">
                          <Package className="h-3 w-3" />
                          <span>
                            {lead.serviceType === 'foto' ? 'Galerie Foto' :
                             lead.serviceType === 'video' ? 'Galerie Video' :
                             lead.serviceType === 'decor' ? 'Decor Nuntă' :
                             lead.serviceType === 'oglinda' ? 'Oglindă Magică' :
                             lead.serviceType === 'pachet_complet' ? 'Pachet Complet' : 'General'}
                          </span>
                        </div>
                      </div>

                      {/* Lead Inquiry Description Message */}
                      <div id="lead-message-text" className="p-4 bg-neutral-950 rounded-lg text-sm text-neutral-300 font-light leading-relaxed mb-4 whitespace-pre-wrap">
                        {lead.message}
                      </div>

                      {/* Lead Actions Panel */}
                      <div id="lead-actions-row" className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Trimis: {new Date(lead.createdAt).toLocaleString('ro-RO')}
                        </span>

                        <div className="flex items-center space-x-2">
                          {lead.status === 'nou' && (
                            <button
                              id={`lead-mark-btn-${lead.id}`}
                              onClick={() => onUpdateLeadStatus(lead.id, 'contactat')}
                              className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Marchează Contactat</span>
                            </button>
                          )}
                          <button
                            id={`lead-delete-btn-${lead.id}`}
                            onClick={() => {
                              if (confirm('Sigur doriți să ștergeți solicitarea din istoric?')) {
                                onDeleteLead(lead.id);
                              }
                            }}
                            className="p-1.5 bg-red-950/20 hover:bg-red-900 border border-red-500/10 hover:border-red-500/40 text-red-400 hover:text-white rounded-lg transition-all cursor-pointer"
                            title="Șterge solicitare"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. GESTIONEAZĂ ALBUME / FOLDERE VIEW */}
          {activeTab === 'albums' && (
            <div id="panel-albums" className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Organizează Folder-e / Albume</h3>
                  <p className="text-xs text-neutral-400">Total: {albums.length} foldere active pe site</p>
                </div>
              </div>

              {/* Form to create custom Folders */}
              <form id="album-create-form" onSubmit={handleCreateAlbum} className="p-5 sm:p-6 bg-neutral-900 rounded-xl space-y-4 border border-white/5">
                <h4 className="text-xs sm:text-sm uppercase tracking-wider font-bold text-amber-400 mb-2 flex items-center space-x-1">
                  <Plus className="h-4 w-4" />
                  <span>Creează un Album/Folder nou</span>
                </h4>

                <div id="album-form-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name or Title */}
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="new-album-name" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Nume Folder</label>
                    <input
                      id="new-album-name"
                      type="text"
                      placeholder="Ex: Nuntă Alina & Robert"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Mapped Categories */}
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="new-album-cat" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Categorie Principală</label>
                    <select
                      id="new-album-cat"
                      value={newAlbumCategory}
                      onChange={(e) => setNewAlbumCategory(e.target.value as any)}
                      className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2 text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="foto">Galerie Foto</option>
                      <option value="video">Galerie Video</option>
                      <option value="decor">Decor / Accesorii Nuntă</option>
                      <option value="oglinda">Oglinda Magică (Cabină Foto)</option>
                    </select>
                  </div>
                </div>

                {/* Cover file/url selector */}
                <div id="album-cover-selector" className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Opțiunea A: Încarcă Poză Copertă</label>
                    <div className="flex items-center space-x-2">
                      <button
                        id="album-cover-upload-trigger"
                        type="button"
                        onClick={() => albumCoverInputRef.current?.click()}
                        className="px-4 py-2.5 bg-neutral-950/60 hover:bg-neutral-800 border border-white/10 text-neutral-300 rounded-lg text-xs font-semibold cursor-pointer flex items-center space-x-1.5"
                      >
                        <Upload className="h-3.5 w-3.5 text-amber-400" />
                        <span>Alege din PC</span>
                      </button>
                      <input
                        ref={albumCoverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'album')}
                        className="hidden"
                      />
                      {albumCoverUpload && (
                        <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">Copertă selectată!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label htmlFor="new-album-cover-url" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Opțiunea B: Introduceți Link Poză Copertă (HTTPS)</label>
                    <input
                      id="new-album-cover-url"
                      type="url"
                      disabled={!!albumCoverUpload}
                      placeholder="https://images.unsplash.com/..."
                      value={newAlbumCover}
                      onChange={(e) => setNewAlbumCover(e.target.value)}
                      className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2 text-xs focus:border-amber-400 focus:outline-none disabled:opacity-40"
                    />
                  </div>
                </div>

                <button
                  id="album-submit-btn"
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest text-xs rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Creează Folder nou</span>
                </button>
              </form>

              {/* Display existing Folders with removal option */}
              <div id="existing-folders-list" className="space-y-3 pt-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-2">Foldere Existente</h4>
                
                <div id="folders-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {albums.map((album) => (
                    <div id={`album-card-element-${album.id}`} key={album.id} className="bg-neutral-900 border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img
                          id={`album-cover-preview-${album.id}`}
                          src={album.coverUrl}
                          alt={album.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider">
                            {album.category === 'foto' ? 'Galerie Foto' :
                             album.category === 'video' ? 'Galerie Video' :
                             album.category === 'decor' ? 'Decor Nuntă' : 'Oglinda Magică'}
                          </span>
                          <strong className="text-white text-sm block truncate pr-2">{album.name}</strong>
                          <span className="text-[9px] text-neutral-400 block">
                            {mediaItems.filter((m) => m.albumId === album.id).length} fișiere media
                          </span>
                        </div>
                      </div>

                      <button
                        id={`delete-album-btn-${album.id}`}
                        onClick={() => {
                          if (confirm(`Sunteți sigur că ștergeți albumul "${album.name}"? Atenție: Această operațiune nu va șterge imaginile în sine, ci le va transfera în categoria generală.`)) {
                            onDeleteAlbum(album.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0 cursor-pointer"
                        title="Șterge album"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. ADĂUGĂ IMAGINI & FIȘIERE PE SITE VIEW */}
          {activeTab === 'add-media' && (
            <div id="panel-add-media" className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Încarcă Poză sau Video</h3>
                  <p className="text-xs text-neutral-400">Adaugă elemente noi direct în galeriile selectate</p>
                </div>
              </div>

              <form id="media-upload-form" onSubmit={handleAddMediaSubmit} className="p-5 sm:p-6 bg-neutral-900 rounded-xl space-y-5 border border-white/5">
                
                {/* Visual Category & Album Folder Selector link */}
                <div id="media-mapping-selectors" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="upload-media-cat" className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Categorie Principală</label>
                    <select
                      id="upload-media-cat"
                      value={mediaCategory}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setMediaCategory(val);
                        setMediaAlbumId('general'); // Reset
                        if (val === 'video') setMediaType('video');
                        else setMediaType('photo');
                      }}
                      className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="foto">Galerie Foto</option>
                      <option value="video">Galerie Video</option>
                      <option value="decor">Decor / Accesorii Nuntă</option>
                      <option value="oglinda">Oglinda Magică (Cabină Foto)</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="upload-media-album" className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Aparține de Albumul/Folderul</label>
                    <select
                      id="upload-media-album"
                      value={mediaAlbumId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMediaAlbumId(val);
                        if (val !== 'general') {
                          const targetAlbum = albums.find((a) => a.id === val);
                          if (targetAlbum) {
                            setMediaCategory(targetAlbum.category);
                            if (targetAlbum.category === 'video') {
                              setMediaType('video');
                            } else {
                              setMediaType('photo');
                            }
                          }
                        }
                      }}
                      className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="general">Fără album (General / Direct în categorie)</option>
                      
                      {albums.filter(a => a.category === 'foto').length > 0 && (
                        <optgroup label="Galerie Foto">
                          {albums.filter(a => a.category === 'foto').map((alb) => (
                            <option key={alb.id} value={alb.id}>{alb.name}</option>
                          ))}
                        </optgroup>
                      )}

                      {albums.filter(a => a.category === 'video').length > 0 && (
                        <optgroup label="Galerie Video">
                          {albums.filter(a => a.category === 'video').map((alb) => (
                            <option key={alb.id} value={alb.id}>{alb.name}</option>
                          ))}
                        </optgroup>
                      )}

                      {albums.filter(a => a.category === 'decor').length > 0 && (
                        <optgroup label="Decor / Accesorii Nuntă">
                          {albums.filter(a => a.category === 'decor').map((alb) => (
                            <option key={alb.id} value={alb.id}>{alb.name}</option>
                          ))}
                        </optgroup>
                      )}

                      {albums.filter(a => a.category === 'oglinda').length > 0 && (
                        <optgroup label="Oglinda Magică (Cabină Foto)">
                          {albums.filter(a => a.category === 'oglinda').map((alb) => (
                            <option key={alb.id} value={alb.id}>{alb.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                {/* Choose File type (Photo vs Video) */}
                <div id="media-u-type" className="flex flex-col space-y-1.5">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-widest block">Tipul de Media</span>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center space-x-2 cursor-pointer text-sm font-medium">
                      <input
                        type="radio"
                        name="mediaType"
                        checked={mediaType === 'photo'}
                        onChange={() => setMediaType('photo')}
                        disabled={mediaCategory === 'video'}
                        className="text-amber-500 focus:ring-transparent h-4 w-4"
                      />
                      <span className="flex items-center space-x-1.5 text-neutral-200">
                        <Image className="h-4 w-4 text-amber-400" />
                        <span>Fotografie (JPG, PNG, etc)</span>
                      </span>
                    </label>

                    <label className="inline-flex items-center space-x-2 cursor-pointer text-sm font-medium">
                      <input
                        type="radio"
                        name="mediaType"
                        checked={mediaType === 'video'}
                        onChange={() => setMediaType('video')}
                        disabled={mediaCategory !== 'video' && mediaCategory !== 'foto'} // Restrict to video or photo catalog
                        className="text-amber-500 focus:ring-transparent h-4 w-4"
                      />
                      <span className="flex items-center space-x-1.5 text-neutral-200">
                        <Video className="h-4 w-4 text-amber-400" />
                        <span>Fișier Video (MP4)</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Upload File selection area */}
                <div id="media-u-resource" className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  
                  {/* Option A: Direct Attachment Dropzone */}
                  <div id="resource-dropzone" className="border-2 border-dashed border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-neutral-950/40 hover:border-amber-500/20 transition-all">
                    <p className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">Opțiunea A: Atașează de pe Calculator</p>
                    <button
                      id="media-source-pc-btn"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black hover:border-transparent font-semibold rounded-lg text-xs tracking-wider uppercase transition-all border border-amber-500/20 cursor-pointer"
                    >
                      Căutare fișier
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={mediaType === 'photo' ? 'image/*' : 'video/mp4,video/*'}
                      onChange={(e) => handleFileChange(e, 'media')}
                      className="hidden"
                    />
                    
                    {mediaFileBase64 ? (
                      <div className="mt-3 text-xs text-emerald-400 flex flex-col items-center space-y-1">
                        <span className="flex items-center space-x-1.5">
                          <Check className="h-4 w-4" />
                          <strong>Fișier atașat cu succes (Base64)!</strong>
                        </span>
                        {mediaType === 'photo' ? (
                          <img
                            src={mediaFileBase64}
                            alt="Preview"
                            className="w-16 h-12 object-cover rounded border border-white/10 mt-1 shadow"
                          />
                        ) : (
                          <span className="italic text-[10px] text-neutral-400">Fișier video selectat</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setMediaFileBase64(null)}
                          className="text-[10px] text-red-400 hover:underline pt-0.5"
                        >
                          Elimină fișierul
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-neutral-500 mt-2 leading-normal">
                        Suportă imagini de orice rezoluție, stocate local.
                      </p>
                    )}
                  </div>

                  {/* Option B: Direct URL Input fields */}
                  <div id="resource-url" className="flex flex-col justify-center space-y-2">
                    <p className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">Opțiunea B: Introduceți Adresă Link Extern (HTTPS)</p>
                    <input
                      id="upload-media-input-url"
                      type="url"
                      disabled={!!mediaFileBase64}
                      placeholder="Peste link-ul aici: https://images.unsplash.com/..."
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-xs focus:border-amber-400 focus:outline-none disabled:opacity-40"
                    />
                    <p className="text-[10px] text-neutral-500 leading-normal">
                      Excelent în caz că folosiți servicii cloud (Unsplash, Vimeo, Youtube, Mixkit, sau site-uri asemănătoare).
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="upload-media-title" className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Titlu Element / Fișier <span className="text-amber-400">*</span></label>
                  <input
                    id="upload-media-title"
                    type="text"
                    required
                    placeholder="Ex: Mireasa în lumina naturală a dimineții"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    className="w-full bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Description and tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="upload-media-desc" className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Descriere Detaliată (Opțional)</label>
                    <textarea
                      id="upload-media-desc"
                      rows={2}
                      placeholder="Ex: Scurt rezumat despre momentul fotografierii..."
                      value={mediaDescription}
                      onChange={(e) => setMediaDescription(e.target.value)}
                      className="w-full bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="upload-media-tags" className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Tag-uri / Cuvinte Cheie (Separate prin virgulă)</label>
                    <input
                      id="upload-media-tags"
                      type="text"
                      placeholder="Ex: Mireasă, Portret, Nuntă"
                      value={mediaTags}
                      onChange={(e) => setMediaTags(e.target.value)}
                      className="w-full bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submition final buttons */}
                <button
                  id="media-u-submit-btn"
                  type="submit"
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest text-xs rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adaugă Fișier în Portofoliu</span>
                </button>
              </form>
            </div>
          )}

          {/* 4. TOATE MEDIILE VIEW (Table simple listing for bulk delete or edit) */}
          {activeTab === 'all-media' && (
            <div id="panel-all-media" className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Toate Fișierele Portofoliu</h3>
                  <p className="text-xs text-neutral-400">Total: {mediaItems.length} imagini și clipuri video predestinate vizualizării</p>
                </div>
              </div>

              {mediaItems.length === 0 ? (
                <div id="all-media-empty" className="py-16 text-center text-neutral-500">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-serif text-base">Portofoliul este gol momentan.</p>
                </div>
              ) : (
                <div id="all-media-table-wrapper" className="overflow-x-auto rounded-xl border border-white/5 bg-neutral-900">
                  <table className="w-full text-left text-xs sm:text-sm text-neutral-300">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/5">
                      <tr>
                        <th className="px-5 py-3">Miniatură</th>
                        <th className="px-5 py-3">Informații Titlu</th>
                        <th className="px-5 py-3">Categorie</th>
                        <th className="px-5 py-3">Folder Album</th>
                        <th className="px-5 py-3 text-right">Șterge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {mediaItems.map((item) => {
                        const albObj = albums.find((a) => a.id === item.albumId);
                        return (
                          <tr id={`table-row-media-${item.id}`} key={item.id} className="hover:bg-white/3 bg-neutral-900/40 transition-colors">
                            {/* Preview thumbnail */}
                            <td className="px-5 py-2.5">
                              {item.type === 'photo' ? (
                                <img
                                  src={item.url}
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-10 object-cover rounded border border-white/10 shadow bg-neutral-950"
                                />
                              ) : (
                                <div className="w-12 h-10 rounded border border-white/10 shadow bg-neutral-950 flex items-center justify-center relative overflow-hidden">
                                  <Video className="h-4 w-4 text-amber-400" />
                                </div>
                              )}
                            </td>

                            {/* Informational columns */}
                            <td className="px-5 py-2.5 font-medium text-white max-w-xs truncate">
                              <div>{item.title}</div>
                              {item.description && (
                                <span className="text-[10px] text-neutral-400 truncate block font-light">{item.description}</span>
                              )}
                            </td>

                            <td className="px-5 py-2.5 text-neutral-400 capitalize">
                              <span className="px-2 py-0.5 bg-neutral-950 text-[9px] uppercase tracking-wider font-bold rounded-full text-amber-300/80">
                                {item.category === 'foto' ? 'Galerie Foto' :
                                 item.category === 'video' ? 'Galerie Video' :
                                 item.category === 'decor' ? 'Decor Nuntă' : 'Oglindă Magică'}
                              </span>
                            </td>

                            <td className="px-5 py-2.5 text-neutral-400 italic">
                              {albObj ? albObj.name : 'Direct în Categorie'}
                            </td>

                            <td className="px-5 py-2.5 text-right">
                              <button
                                id={`bulk-delete-${item.id}`}
                                onClick={() => {
                                  if (confirm(`Sunteți sigur că ștergeți imaginea "${item.title}" din portofoliu?`)) {
                                    onDeleteMediaItem(item.id);
                                  }
                                }}
                                className="p-1 px-2.5 bg-red-950/20 hover:bg-red-900 border border-red-500/15 text-red-400 hover:text-white rounded transition-all cursor-pointer"
                                title="Șterge fișier"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. ADMIN SETTINGS (Change password config and restore seed data) */}
          {activeTab === 'settings' && (
            <div id="panel-settings" className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Parolă & Setări Aplicare</h3>
                  <p className="text-xs text-neutral-400">Modificați acreditările sau resetați baza de date locală</p>
                </div>
              </div>

              {/* Password update form element */}
              <form id="password-change-form" onSubmit={handlePasswordChangeSubmit} className="p-5 sm:p-6 bg-neutral-900 rounded-xl space-y-4 border border-white/5 max-w-xl">
                <h4 className="text-xs sm:text-sm uppercase tracking-wider font-bold text-amber-400 flex items-center space-x-1">
                  <Key className="h-4.5 w-4.5" />
                  <span>Mascare & Schimbare Parolă Admin</span>
                </h4>

                {passwordSuccess && <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs">{passwordSuccess}</div>}
                {passwordError && <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 rounded-lg text-xs">{passwordError}</div>}

                <div className="flex flex-col space-y-1">
                  <label htmlFor="curr-pass" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Parolă Curentă</label>
                  <input
                    id="curr-pass"
                    type="password"
                    required
                    placeholder="Ex: admin123"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="new-pass" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Noua Parolă (minim 4 caractere)</label>
                    <input
                      id="new-pass"
                      type="password"
                      required
                      placeholder="Sfeșnic nou!"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label htmlFor="confirm-pass" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Confirmă Noua Parolă</label>
                    <input
                      id="confirm-pass"
                      type="password"
                      required
                      placeholder="Confirmare"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  id="submit-new-pass"
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest text-xs rounded-lg transition-all cursor-pointer"
                >
                  Actualizează Parolă
                </button>
              </form>

              {/* Slideshow pics manager */}
              <div id="slideshow-settings-card" className="p-5 sm:p-6 bg-neutral-900 border border-white/5 rounded-xl space-y-5 max-w-xl">
                <h4 className="text-sm font-bold text-amber-400 flex items-center space-x-1.5">
                  <Image className="h-4.5 w-4.5" />
                  <span>Gestionează Imagini Slideshow (Hero)</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-normal">
                  Adăugați, vizualizați sau ștergeți imaginile de fundal interactive care rulează în slideshow pe prima pagină.
                </p>

                {/* List of current slides */}
                <div id="slideshow-edit-list" className="space-y-3">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Imagini Active ({ (config.slideshowImages || []).length || 3 })</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(config.slideshowImages || [
                      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920',
                      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1920',
                      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920'
                    ]).map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
                        <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              const currentSlides = config.slideshowImages || [
                                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920',
                                'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1920',
                                'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920'
                              ];
                              if (currentSlides.length <= 1) {
                                alert("Trebuie să păstrați cel puțin o imagine în slideshow-ul principal.");
                                return;
                              }
                              if (confirm("Sunteți sigur că doriți să eliminați această imagine din slideshow?")) {
                                onUpdateConfig({
                                  ...config,
                                  slideshowImages: currentSlides.filter((_, i) => i !== idx)
                                });
                                setActionSuccess("Imaginea a fost eliminată din slideshow cu succes!");
                              }
                            }}
                            className="p-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-all cursor-pointer"
                            title="Elimină imaginea"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-neutral-300">#{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form to add a slide */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const finalUrl = newSlideFileBase64 || newSlideUrl.trim();
                    if (!finalUrl) {
                      alert("Introduceți o adresă URL validă sau alegeți o poză locală.");
                      return;
                    }
                    const currentSlides = config.slideshowImages || [
                      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920',
                      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1920',
                      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920'
                    ];
                    onUpdateConfig({
                      ...config,
                      slideshowImages: [...currentSlides, finalUrl]
                    });
                    setNewSlideUrl('');
                    setNewSlideFileBase64(null);
                    if (slideFileInputRef.current) slideFileInputRef.current.value = '';
                    setActionSuccess("Imagine nouă adăugată în Caruselul Slideshow!");
                  }}
                  className="space-y-3.5 pt-2 border-t border-white/5"
                >
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Adaugă imagine nouă în Slideshow</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Opțiunea A: Încarcă poză din calculator</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => slideFileInputRef.current?.click()}
                          className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 border border-white/10 text-neutral-300 rounded-lg text-xs font-semibold cursor-pointer flex items-center space-x-1"
                        >
                          <Upload className="h-3.5 w-3.5 text-amber-400" />
                          <span>Alege fișier</span>
                        </button>
                        <input
                          ref={slideFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'slide')}
                          className="hidden"
                        />
                        {newSlideFileBase64 && (
                          <div className="text-[10px] text-emerald-400 flex items-center space-x-1 max-w-[120px] truncate">
                            <Check className="h-3.5 w-3.5" />
                            <span>Selectat!</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label htmlFor="new-slide-link" className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Opțiunea B: Introdu link imagine (HTTPS)</label>
                      <input
                        id="new-slide-link"
                        type="url"
                        disabled={!!newSlideFileBase64}
                        placeholder="https://images.unsplash.com/..."
                        value={newSlideUrl}
                        onChange={(e) => setNewSlideUrl(e.target.value)}
                        className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2.5 text-xs focus:border-amber-400 focus:outline-none disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest text-xs rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Adaugă în Slideshow</span>
                  </button>
                </form>
              </div>

              {/* Main pictures for Decor & Oglinda */}
              <div id="representative-images-settings-card" className="p-5 sm:p-6 bg-neutral-900 border border-white/5 rounded-xl space-y-6 max-w-xl animate-fadeIn">
                <h4 className="text-sm font-bold text-amber-400 flex items-center space-x-1.5">
                  <Layers className="h-4.5 w-4.5" />
                  <span>Imagini Reprezentative Secțiuni</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-normal">
                  Personalizează imaginile mari de prezentare afișate în secțiunile <strong>Decor &amp; Accesorii</strong> și <strong>Oglinda Magică</strong> de pe site.
                </p>

                {/* Decor section image manager */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const finalUrl = decorFileBase64 || decorImgUrl.trim();
                    if (!finalUrl) {
                      alert("Introduceți o adresă URL validă sau selectați o imagine locală pentru Decor.");
                      return;
                    }
                    onUpdateConfig({
                      ...config,
                      decorMainImage: finalUrl
                    });
                    setDecorFileBase64(null);
                    if (decorFileInputRef.current) decorFileInputRef.current.value = '';
                    setActionSuccess("Imaginea reprezentativă pentru Decor & Accesorii a fost salvată!");
                  }}
                  className="space-y-3.5 pt-3 border-t border-white/5"
                >
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">1. Imagine Decor &amp; Accesorii</span>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-neutral-950">
                      <img 
                        src={decorFileBase64 || decorImgUrl || config.decorMainImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'} 
                        alt="Preview Decor" 
                        className="w-full h-full object-cover animate-pulse-once" 
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">A: Încărcare computer</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => decorFileInputRef.current?.click()}
                            className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-white/10 text-neutral-300 rounded-lg text-[11px] font-semibold cursor-pointer flex items-center space-x-1"
                          >
                            <Upload className="h-3 w-3 text-amber-400" />
                            <span>Alege fișier</span>
                          </button>
                          <input
                            ref={decorFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'decorMain')}
                            className="hidden"
                          />
                          {decorFileBase64 && (
                            <span className="text-[10px] text-emerald-400 font-medium">Selectat!</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label htmlFor="decor-img-url-input" className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">B: Link imagine (HTTPS)</label>
                        <input
                          id="decor-img-url-input"
                          type="url"
                          disabled={!!decorFileBase64}
                          placeholder="https://images.unsplash.com/..."
                          value={decorImgUrl}
                          onChange={(e) => setDecorImgUrl(e.target.value)}
                          className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2 text-xs focus:border-amber-400 focus:outline-none disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest text-[10px] rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Salvează Imagine Decor</span>
                  </button>
                </form>

                {/* Oglinda section image manager */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const finalUrl = oglindaFileBase64 || oglindaImgUrl.trim();
                    if (!finalUrl) {
                      alert("Introduceți o adresă URL validă sau selectați o imagine locală pentru Oglinda Magică.");
                      return;
                    }
                    onUpdateConfig({
                      ...config,
                      oglindaMainImage: finalUrl
                    });
                    setOglindaFileBase64(null);
                    if (oglindaFileInputRef.current) oglindaFileInputRef.current.value = '';
                    setActionSuccess("Imaginea reprezentativă pentru Oglinda Magică a fost salvată!");
                  }}
                  className="space-y-3.5 pt-4 border-t border-white/5"
                >
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">2. Imagine Oglindă Magică</span>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-neutral-950">
                      <img 
                        src={oglindaFileBase64 || oglindaImgUrl || config.oglindaMainImage || 'https://images.unsplash.com/photo-1522158673370-3c2763db2d0a?auto=format&fit=crop&q=80&w=800'} 
                        alt="Preview Oglinda" 
                        className="w-full h-full object-cover animate-pulse-once" 
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">A: Încărcare computer</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => oglindaFileInputRef.current?.click()}
                            className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-white/10 text-neutral-300 rounded-lg text-[11px] font-semibold cursor-pointer flex items-center space-x-1"
                          >
                            <Upload className="h-3 w-3 text-amber-400" />
                            <span>Alege fișier</span>
                          </button>
                          <input
                            ref={oglindaFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'oglindaMain')}
                            className="hidden"
                          />
                          {oglindaFileBase64 && (
                            <span className="text-[10px] text-emerald-400 font-medium">Selectat!</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label htmlFor="oglinda-img-url-input" className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">B: Link imagine (HTTPS)</label>
                        <input
                          id="oglinda-img-url-input"
                          type="url"
                          disabled={!!oglindaFileBase64}
                          placeholder="https://images.unsplash.com/..."
                          value={oglindaImgUrl}
                          onChange={(e) => setOglindaImgUrl(e.target.value)}
                          className="bg-neutral-950 text-white rounded-lg border border-white/10 p-2 text-xs focus:border-amber-400 focus:outline-none disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest text-[10px] rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Salvează Imagine Oglindă</span>
                  </button>
                </form>
              </div>

              {/* Reset seed details block */}
              <div id="factory-reset-section" className="p-5 sm:p-6 bg-red-950/10 border border-red-500/20 rounded-xl space-y-3 max-w-xl">
                <h4 className="text-sm font-bold text-red-400 flex items-center space-x-1">
                  <RefreshCw className="h-4.5 w-4.5" />
                  <span>Resetează Baza de Date la Seed Defaults</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-normal">
                  Apasă pe butonul de mai jos pentru a șterge complet toate modificările (imagini, foldere, leads și parole) și pentru a restabili conținutul inițial de demonstrație configurat pentru portofoliu.
                </p>
                <button
                  id="seed-reset-trigger-btn"
                  onClick={() => {
                    if (confirm('Atenție: Aceasta va șterge toate datele din localStorage și va reseta platforma la inițialele de portofoliu. Continuați?')) {
                      resetToDefaults();
                    }
                  }}
                  className="px-5 py-2 bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Resetează Platforma
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

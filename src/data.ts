/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Album, MediaItem, ContactLead, AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  adminPasswordHash: 'admin123', // Clean changeable admin password
  whatsappNumber: '0755844697',
  phoneNumber: '0755844697',
  phoneNumberDisplay: '0755 844 697',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61581783778040',
  slideshowImages: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920'
  ],
  decorMainImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
  oglindaMainImage: 'https://images.unsplash.com/photo-1522158673370-3c2763db2d0a?auto=format&fit=crop&q=80&w=800'
};

export const INITIAL_ALBUMS: Album[] = [];

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [];

export const INITIAL_LEADS: ContactLead[] = [];

// Helper to get active storage values
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
}

// Global initialization of DB simulated inside localStorage
export function initializeAppData() {
  if (!localStorage.getItem('nitu_events_config')) {
    setStoredData('nitu_events_config', DEFAULT_CONFIG);
  }
  
  let storedAlbums = getStoredData<Album[]>('nitu_events_albums', []);
  if (storedAlbums.some(a => ['nunta-mariana-andrei', 'nunta-radu-elena', 'aranjamente-prezidiu-biserica', 'petreceri-oglinda', 'videoclipuri-cinematice'].includes(a.id))) {
    setStoredData('nitu_events_albums', []);
  } else if (!localStorage.getItem('nitu_events_albums')) {
    setStoredData('nitu_events_albums', INITIAL_ALBUMS);
  }

  let storedMedia = getStoredData<MediaItem[]>('nitu_events_media', []);
  if (storedMedia.some(m => ['photo-1', 'photo-2', 'decor-1', 'mirror-1', 'video-1'].includes(m.id))) {
    setStoredData('nitu_events_media', []);
  } else if (!localStorage.getItem('nitu_events_media')) {
    setStoredData('nitu_events_media', INITIAL_MEDIA_ITEMS);
  }

  let storedLeads = getStoredData<ContactLead[]>('nitu_events_leads', []);
  if (storedLeads.some(l => ['lead-1', 'lead-2'].includes(l.id))) {
    setStoredData('nitu_events_leads', []);
  } else if (!localStorage.getItem('nitu_events_leads')) {
    setStoredData('nitu_events_leads', INITIAL_LEADS);
  }
}

export function resetToDefaults() {
  setStoredData('nitu_events_config', DEFAULT_CONFIG);
  setStoredData('nitu_events_albums', INITIAL_ALBUMS);
  setStoredData('nitu_events_media', INITIAL_MEDIA_ITEMS);
  setStoredData('nitu_events_leads', INITIAL_LEADS);
  // Reload page to apply changes seamlessly
  window.location.reload();
}

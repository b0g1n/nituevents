/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Album {
  id: string;
  name: string;
  category: 'foto' | 'video' | 'decor' | 'oglinda';
  coverUrl: string;
  createdAt: string;
}

export type MediaItemType = 'photo' | 'video';

export interface MediaItem {
  id: string;
  albumId: string; // references Album.id, or 'general'
  title: string;
  category: 'foto' | 'video' | 'decor' | 'oglinda';
  url: string; // External HTTPS URL or Local Base64 Upload
  type: MediaItemType;
  description?: string;
  tags?: string[];
  createdAt: string;
}

export interface ContactLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  eventDate?: string;
  message: string;
  serviceType: 'foto' | 'video' | 'decor' | 'oglinda' | 'pachet_complet' | 'general';
  createdAt: string;
  status: 'nou' | 'contactat' | 'arhivati';
}

export interface AppConfig {
  adminPasswordHash: string; // simplicity: plaintext or dynamic comparison
  whatsappNumber: string;
  phoneNumber: string;
  phoneNumberDisplay: string;
  facebookUrl: string;
  slideshowImages?: string[];
  decorMainImage?: string;
  oglindaMainImage?: string;
}

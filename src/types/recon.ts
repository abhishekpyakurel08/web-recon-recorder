export interface ReconRecord {
  id: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  technologies: string[];
  notes: string;
  timestamp: string;
  screenshot?: string;
  pinned?: boolean;
}

export interface DomainNote {
  domain: string;
  notes: string;
  updatedAt: string;
  pinned: boolean;
}

export interface WebPageMeta {
  url: string;
  domain: string;
  title: string;
  description: string;
  technologies: string[];
  screenshot?: string;
}

export type TabType = 'recon' | 'notepad' | 'history';

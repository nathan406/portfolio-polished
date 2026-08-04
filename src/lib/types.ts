export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  video_url: string;
  timeframe_start: string;
  timeframe_end: string;
  created_at: string;
  technologies?: Technology[];
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  url: string;
  type: 'image' | 'video';
  sort_order: number;
  created_at: string;
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  icon_slug: string;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_slug: string;
  sort_order: number;
  created_at: string;
}

export interface ResumeExperience {
  id: string;
  title: string;
  company: string;
  description: string;
  year_start: string;
  year_end: string;
  sort_order: number;
  created_at: string;
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  description: string;
  year_start: string;
  year_end: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  bio: string;
  subtitle: string;
  profile_image_url: string;
  about_paragraphs: string[];
  stats: StatItem[];
  resume_intro: string;
  resume_pdf_url: string;
}

export interface StatItem {
  value: string;
  label: string;
}

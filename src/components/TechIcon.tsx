'use client';

import { useEffect, useState } from 'react';

interface IconData {
  path: string;
  hex: string;
  title: string;
}

// Pre-defined icon mapping for common technologies (fallback if dynamic import fails)
const FALLBACK_ICONS: Record<string, IconData> = {
  react: { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', hex: '61DAFB', title: 'React' },
  nextdotjs: { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', hex: '000000', title: 'Next.js' },
  typescript: { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', hex: '3178C6', title: 'TypeScript' },
};

export function TechIcon({ slug, className = 'w-5 h-5' }: { slug: string; className?: string }) {
  const [iconData, setIconData] = useState<IconData | null>(FALLBACK_ICONS[slug] || null);

  useEffect(() => {
    if (iconData) return; // Already have fallback

    import(`simple-icons/icons/${slug}`)
      .then((mod) => {
        setIconData(mod.default || mod);
      })
      .catch(() => {
        // Fallback already set
      });
  }, [slug, iconData]);

  if (!iconData) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill={`#${iconData.hex}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{iconData.title}</title>
      <path d={iconData.path} />
    </svg>
  );
}

// Common tech slugs for dropdown selections
export const COMMON_TECH_SLUGS = [
  { value: 'react', label: 'React' },
  { value: 'nextdotjs', label: 'Next.js' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'tailwindcss', label: 'Tailwind CSS' },
  { value: 'html5', label: 'HTML5' },
  { value: 'css3', label: 'CSS3' },
  { value: 'nodedotjs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'git', label: 'Git' },
  { value: 'docker', label: 'Docker' },
  { value: 'figma', label: 'Figma' },
  { value: 'linux', label: 'Linux' },
  { value: 'rust', label: 'Rust' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'vue-dot-js', label: 'Vue.js' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'redis', label: 'Redis' },
  { value: 'amazonwebservices', label: 'AWS' },
  { value: 'vercel', label: 'Vercel' },
  { value: 'neondatabase', label: 'Neon' },
  { value: 'tailwindcss', label: 'Tailwind CSS' },
  { value: 'prisma', label: 'Prisma' },
  { value: 'supabase', label: 'Supabase' },
];

// Social icon slugs
export const COMMON_SOCIAL_SLUGS = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'devdotto', label: 'Dev.to' },
  { value: 'hashnode', label: 'Hashnode' },
  { value: 'medium', label: 'Medium' },
  { value: 'codepen', label: 'CodePen' },
  { value: 'stackoverflow', label: 'Stack Overflow' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'figma', label: 'Figma' },
  { value: 'producthunt', label: 'Product Hunt' },
];

export function SocialIcon({ slug, className = 'w-5 h-5' }: { slug: string; className?: string }) {
  return <TechIcon slug={slug} className={className} />;
}

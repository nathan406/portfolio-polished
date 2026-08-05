'use client';

import { useState, useEffect } from 'react';
import { ChannelBanner } from '@/components/ChannelBanner';
import { ProjectGrid } from '@/components/ProjectGrid';
import type { TabId } from '@/components/ChannelNav';
import type { Project, Technology, Skill, SocialLink } from '@/lib/types';

/* ── Skeleton helpers ── */

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`${className} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DC2626]/[0.04] to-transparent animate-shimmer" />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
          <Shimmer className="aspect-video bg-surface rounded-xl mb-4" />
          <div className="space-y-2.5">
            <Shimmer className="h-4 bg-surface rounded w-[85%]" />
            <Shimmer className="h-3 bg-surface rounded w-[55%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AboutSkeleton() {
  return (
    <div style={{ paddingBottom: '16rem' }}>
      <div style={{ padding: 'clamp(4rem, 6vw, 7rem)' }} className="bg-surface border border-accent-border rounded-2xl">
        <div className="bg-surface-elevated rounded-md" style={{ width: '120px', height: '20px', marginBottom: '4rem' }} />
        <div className="space-y-10">
          <div className="bg-surface-elevated rounded-md" style={{ width: '100%', height: '16px' }} />
          <div className="bg-surface-elevated rounded-md" style={{ width: '92%', height: '16px' }} />
          <div className="bg-surface-elevated rounded-md" style={{ width: '78%', height: '16px' }} />
          <div className="bg-surface-elevated rounded-md" style={{ width: '85%', height: '16px' }} />
          <div className="bg-surface-elevated rounded-md" style={{ width: '65%', height: '16px' }} />
        </div>
      </div>
      <div style={{ marginTop: '12rem' }}>
        <div className="bg-surface-elevated rounded-md" style={{ width: '100px', height: '20px', marginBottom: '5rem' }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="bg-surface rounded-2xl border border-accent-border" style={{ height: '144px' }} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: '12rem' }}>
        <div className="bg-surface-elevated rounded-md" style={{ width: '70px', height: '20px', marginBottom: '5rem' }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="bg-surface rounded-2xl border border-accent-border" style={{ height: '144px' }} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: '12rem' }}>
        <div className="bg-surface-elevated rounded-md" style={{ width: '90px', height: '20px', marginBottom: '5rem' }} />
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '1.5rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-surface border border-accent-border text-center" style={{ padding: '3.5rem' }}>
              <div className="bg-surface-elevated rounded mx-auto" style={{ width: '32px', height: '16px', marginBottom: '2rem' }} />
              <div className="bg-surface-elevated rounded-md mx-auto" style={{ width: '70px', height: '36px', marginBottom: '0.75rem' }} />
              <div className="bg-surface-elevated rounded-md mx-auto" style={{ width: '100px', height: '12px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResumeSkeleton() {
  return (
    <div style={{ paddingBottom: '16rem' }}>
      <div style={{ padding: 'clamp(4rem, 6vw, 7rem)' }} className="bg-surface border border-accent-border rounded-2xl">
        <div className="bg-surface-elevated rounded-md" style={{ width: '110px', height: '20px', marginBottom: '4rem' }} />
        <div className="bg-surface-elevated rounded-md" style={{ width: '100%', maxWidth: '500px', height: '16px', marginBottom: '0.5rem' }} />
        <div className="bg-surface-elevated rounded-md" style={{ width: '85%', maxWidth: '450px', height: '16px', marginBottom: '4rem' }} />
        <div className="bg-surface-elevated rounded-full" style={{ width: '260px', height: '64px' }} />
      </div>
      <div style={{ marginTop: '12rem' }}>
        <div className="bg-surface-elevated rounded-md" style={{ width: '120px', height: '20px', marginBottom: '5rem' }} />
        <div style={{ padding: 'clamp(4rem, 5vw, 5rem)' }} className="rounded-2xl bg-surface border border-accent-border">
          <div className="bg-surface-elevated rounded-md" style={{ width: '300px', height: '20px', marginBottom: '1rem' }} />
          <div className="bg-surface-elevated rounded-md" style={{ width: '200px', height: '16px', marginBottom: '0.75rem' }} />
          <div className="bg-surface-elevated rounded-md" style={{ width: '120px', height: '12px' }} />
        </div>
      </div>
    </div>
  );
}

function ExperienceSkeleton() {
  return (
    <div style={{ paddingBottom: '16rem' }}>
      <div className="bg-surface-elevated rounded-md" style={{ width: '140px', height: '20px', marginBottom: '5rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7rem' }}>
        {[1, 2].map((i) => (
          <div key={i} className="relative" style={{ paddingLeft: '6rem', paddingBottom: '6rem', borderLeft: '1px solid var(--accent-border, #DC262650)' }}>
            <div className="absolute rounded-full bg-surface-elevated" style={{ width: '16px', height: '16px', left: '17px', top: '8px' }} />
            <div className="bg-surface-elevated rounded-md" style={{ width: '100px', height: '12px', marginBottom: '1.25rem' }} />
            <div className="bg-surface-elevated rounded-md" style={{ width: '280px', height: '24px', marginBottom: '0.75rem' }} />
            <div className="bg-surface-elevated rounded-md" style={{ width: '160px', height: '16px', marginBottom: '1.5rem' }} />
            <div className="bg-surface-elevated rounded-md" style={{ width: '100%', maxWidth: '500px', height: '12px', marginBottom: '0.25rem' }} />
            <div className="bg-surface-elevated rounded-md" style={{ width: '80%', maxWidth: '400px', height: '12px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section heading ── */

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4" style={{ marginBottom: '5rem' }}>
      <span className="font-mono-custom text-xs text-accent/70 tracking-wide select-none">
        // ──
      </span>
      <h2 className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary tracking-tight">
        {label}
      </h2>
      <span className="font-mono-custom text-xs text-accent/50 tracking-wide select-none">
        ──
      </span>
    </div>
  );
}

/* ── Tech icon helper ── */

function SimpleIcon({ slug, className = "w-5 h-5" }: { slug?: string; className?: string }) {
  if (!slug) return null;
  // simple-icons exports are dynamic, we use a CDN approach for simplicity
  const iconUrl = `https://cdn.simpleicons.org/${slug.toLowerCase()}/DC2626`;
  const iconUrlFallback = `https://cdn.simpleicons.org/${slug.toLowerCase()}/888`;
  return (
    <img
      src={iconUrl}
      alt={slug}
      className={className}
      onError={(e) => { (e.target as HTMLImageElement).src = iconUrlFallback; }}
      loading="lazy"
    />
  );
}

/* ── Home ── */

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [resumeData, setResumeData] = useState<{ experience: any[]; education: any[] }>({ experience: [], education: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('projects');

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()).catch(() => []),
      fetch('/api/settings').then(r => r.json()).catch(() => null),
      fetch('/api/technologies').then(r => r.json()).catch(() => []),
      fetch('/api/skills').then(r => r.json()).catch(() => []),
      fetch('/api/socials').then(r => r.json()).catch(() => []),
      fetch('/api/resume').then(r => r.json()).catch(() => ({ experience: [], education: [] })),
    ]).then(([projectsData, settingsData, techData, skillsData, socialsData, resumeResp]) => {
      if (Array.isArray(projectsData)) setProjects(projectsData);
      if (settingsData) setSettings(settingsData);
      if (Array.isArray(techData)) setTechnologies(techData);
      if (Array.isArray(skillsData)) setSkills(skillsData);
      if (Array.isArray(socialsData)) setSocials(socialsData);
      if (resumeResp) setResumeData(resumeResp);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <ChannelBanner
        activeTab={activeTab}
        onTabChange={setActiveTab}
        loading={loading}
        subtitle={settings?.subtitle}
        bio={settings?.bio}
        profileImageUrl={settings?.profile_image_url}
      />

      <section
        style={{
          maxWidth: '1240px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingTop: 'clamp(80px, 10vh, 120px)',
          paddingBottom: 'clamp(120px, 16vh, 200px)',
          paddingLeft: '5%',
          paddingRight: '5%',
        }}
      >
        {activeTab === 'projects' && (
          <>{loading ? <GridSkeleton /> : <ProjectGrid projects={projects} />}</>
        )}

        {activeTab === 'about' && (
          <>
            {loading ? <AboutSkeleton /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12rem' }} className="animate-fade-in-up">

                {/* ── About ── */}
                <div style={{ padding: 'clamp(4rem, 6vw, 7rem)' }} className="bg-surface border border-accent-border rounded-2xl hover:border-accent/20 transition-colors duration-500">
                  <SectionHeading label="About" />

                  <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {(settings?.about_paragraphs || []).length > 0 ? (
                      (settings.about_paragraphs as string[]).map((para: string, i: number) => (
                        <p key={i} className={`text-base sm:text-[17px] ${i === 0 ? 'text-text-secondary' : 'text-text-muted'}`} style={{ lineHeight: '2.2' }}>
                          {para}
                        </p>
                      ))
                    ) : (
                      <>
                        <p className="text-text-secondary text-base sm:text-[17px]" style={{ lineHeight: '2.2' }}>
                          I build fullstack applications that are accessible, performant,
                          and a pleasure to use. Every project starts with a clear understanding
                          of the problem and ends with clean, maintainable code.
                        </p>
                        <p className="text-text-muted text-base sm:text-[17px]" style={{ lineHeight: '2.2' }}>
                          I care about details — the way a button feels on hover, how a page
                          loads on a slow connection, whether the colour palette works for
                          someone with colour vision deficiency. These aren't polish; they're
                          fundamentals that separate working software from great software.
                        </p>
                        <p className="text-text-muted text-base sm:text-[17px]" style={{ lineHeight: '2.2' }}>
                          Outside of code I read about distributed systems, contribute to
                          open-source projects, and occasionally write about the engineering
                          decisions that keep me up at night.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Stack ── */}
                <div>
                  <SectionHeading label="Stack" />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
                    {(() => {
                      // Group technologies by category
                      const groups: Record<string, Technology[]> = {};
                      technologies.forEach((tech) => {
                        const cat = tech.category || 'Other';
                        if (!groups[cat]) groups[cat] = [];
                        groups[cat].push(tech);
                      });

                      const entries = Object.entries(groups);

                      if (entries.length > 0) {
                        return entries.map(([category, items]) => (
                          <div key={category}>
                            <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
                              <div className="w-1 bg-accent/60 rounded-full" style={{ height: '1.5rem' }} />
                              <span className="font-mono-custom text-xs text-accent/80 uppercase tracking-[0.15em]">
                                {category}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: '1.5rem' }}>
                              {items.map((tech) => (
                                <div
                                  key={tech.id}
                                  className="group relative flex flex-col items-center justify-center bg-surface border border-accent-border rounded-xl hover:border-accent/40 hover:bg-accent-dim transition-all duration-300 cursor-default overflow-hidden"
                                  style={{ gap: '0.75rem', padding: '1.5rem' }}
                                >
                                  <div className="absolute top-0 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ left: '20%', right: '20%', height: '2px' }} />
                                  <SimpleIcon slug={tech.icon_slug} className="w-8 h-8" />
                                  <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors duration-300 text-center">
                                    {tech.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      }

                      // Fallback hardcoded stack
                      return [
                        {
                          category: 'Frontend',
                          type: 'web',
                          items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML/CSS', 'JavaScript'],
                        },
                        {
                          category: 'Backend',
                          type: 'server',
                          items: ['Node.js', 'Python', 'PostgreSQL', 'REST APIs', 'GraphQL'],
                        },
                        {
                          category: 'Tools',
                          type: 'dev',
                          items: ['Git', 'VS Code', 'Docker', 'Figma', 'Linux'],
                        },
                      ].map((group) => (
                        <div key={group.category}>
                          <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
                            <div className="w-1 bg-accent/60 rounded-full" style={{ height: '1.5rem' }} />
                            <span className="font-mono-custom text-xs text-accent/80 uppercase tracking-[0.15em]">
                              {group.category}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: '1.5rem' }}>
                            {group.items.map((skill) => (
                              <div
                                key={skill}
                                className="group relative flex flex-col items-center justify-center bg-surface border border-accent-border rounded-xl hover:border-accent/40 hover:bg-accent-dim transition-all duration-300 cursor-default overflow-hidden"
                                style={{ gap: '1rem', padding: '1.75rem' }}
                              >
                                <div className="absolute top-0 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ left: '20%', right: '20%', height: '2px' }} />
                                <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors duration-300">
                                  {skill}
                                </span>
                                <span className="text-[10px] text-text-muted/50 group-hover:text-text-muted font-mono-custom transition-colors duration-300">
                                  {group.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* ── Skills ── */}
                <div>
                  <SectionHeading label="Skills" />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
                    {(() => {
                      // Group skills by category
                      const groups: Record<string, Skill[]> = {};
                      skills.forEach((skill) => {
                        const cat = skill.category || 'Other';
                        if (!groups[cat]) groups[cat] = [];
                        groups[cat].push(skill);
                      });

                      const entries = Object.entries(groups);

                      if (entries.length > 0) {
                        return entries.map(([category, items]) => (
                          <div key={category}>
                            <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
                              <div className="w-1 bg-accent/60 rounded-full" style={{ height: '1.5rem' }} />
                              <span className="font-mono-custom text-xs text-accent/80 uppercase tracking-[0.15em]">
                                {category}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: '1.5rem' }}>
                              {items.map((skill) => (
                                <div
                                  key={skill.id}
                                  className="group relative flex flex-col items-center justify-center bg-surface border border-accent-border rounded-xl hover:border-accent/40 hover:bg-accent-dim transition-all duration-300 cursor-default overflow-hidden"
                                  style={{ gap: '0.75rem', padding: '1.5rem' }}
                                >
                                  <div className="absolute top-0 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ left: '20%', right: '20%', height: '2px' }} />
                                  <SimpleIcon slug={skill.icon_slug} className="w-8 h-8" />
                                  <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors duration-300 text-center">
                                    {skill.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      }

                      // Fallback hardcoded skills
                      return [
                        {
                          category: 'Craft',
                          type: 'core',
                          items: ['Problem Solving', 'System Design', 'Clean Code', 'Testing', 'Debugging'],
                        },
                        {
                          category: 'People',
                          type: 'soft',
                          items: ['Communication', 'Team Leadership', 'Mentoring', 'Collaboration', 'Adaptability'],
                        },
                        {
                          category: 'Process',
                          type: 'workflow',
                          items: ['Agile', 'Code Review', 'Documentation', 'Pair Programming'],
                        },
                      ].map((group) => (
                        <div key={group.category}>
                          <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
                            <div className="w-1 bg-accent/60 rounded-full" style={{ height: '1.5rem' }} />
                            <span className="font-mono-custom text-xs text-accent/80 uppercase tracking-[0.15em]">
                              {group.category}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: '1.5rem' }}>
                            {group.items.map((skill) => (
                              <div
                                key={skill}
                                className="group relative flex flex-col items-center justify-center bg-surface border border-accent-border rounded-xl hover:border-accent/40 hover:bg-accent-dim transition-all duration-300 cursor-default overflow-hidden"
                                style={{ gap: '1rem', padding: '1.75rem' }}
                              >
                                <div className="absolute top-0 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ left: '20%', right: '20%', height: '2px' }} />
                                <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors duration-300">
                                  {skill}
                                </span>
                                <span className="text-[10px] text-text-muted/50 group-hover:text-text-muted font-mono-custom transition-colors duration-300">
                                  {group.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* ── Stats ── */}
                <div>
                  <SectionHeading label="Stats" />

                  <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '1.5rem' }}>
                    {(settings?.stats || [
                      { value: '3+', label: 'Years building' },
                      { value: '20+', label: 'Projects shipped' },
                      { value: '10+', label: 'Clients worked with' },
                      { value: '100%', label: 'Commitment to craft' },
                    ]).map((stat: { value: string; label: string }) => (
                      <div
                        key={stat.label}
                        className="group rounded-2xl bg-surface border border-accent-border text-center hover:border-accent/30 hover:bg-accent-dim transition-all duration-300"
                        style={{ padding: '3rem' }}
                      >
                        <span className="font-display text-3xl sm:text-4xl text-accent block font-bold" style={{ marginBottom: '1rem', letterSpacing: '-0.03em' }}>
                          {stat.value}
                        </span>
                        <p className="text-xs text-text-muted uppercase font-medium" style={{ letterSpacing: '0.12em' }}>
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {activeTab === 'experience' && (
          <>
            {loading ? <ExperienceSkeleton /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12rem' }} className="animate-fade-in-up">

                {/* ── Experience ── */}
                <div>
                  <SectionHeading label="Experience" />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7rem' }}>
                    {(resumeData.experience.length > 0 ? resumeData.experience : [
                      {
                        year_start: '2024',
                        year_end: 'Present',
                        title: 'Senior Fullstack Developer',
                        company: 'Tech Corp',
                        description: 'Leading development of enterprise web applications with React and Node.js. Architecting scalable solutions and mentoring junior developers across multiple teams.',
                      },
                      {
                        year_start: '2022',
                        year_end: '2024',
                        title: 'Fullstack Developer',
                        company: 'StartupXYZ',
                        description: 'Built and shipped multiple client-facing features. Improved application performance by 40% through code optimization and modern best practices.',
                      },
                      {
                        year_start: '2021',
                        year_end: '2022',
                        title: 'Junior Developer',
                        company: 'WebAgency',
                        description: 'Developed responsive websites and web applications for diverse clients. Collaborated closely with design to create seamless, intuitive user experiences.',
                      },
                    ]).map((exp: any, index: number) => {
                      const entries = resumeData.experience.length > 0 ? resumeData.experience : [];
                      const isLast = index === (entries.length > 0 ? entries.length - 1 : 2);
                      const yearDisplay = exp.year_start && exp.year_end
                        ? `${exp.year_start} — ${exp.year_end}`
                        : exp.year || '';
                      return (
                        <div key={exp.id || index} className="relative group" style={{ paddingLeft: '6rem', paddingBottom: isLast ? '0' : '6rem' }}>
                          <div
                            className="absolute"
                            style={{
                              left: '19px',
                              top: '22px',
                              width: '1px',
                              bottom: isLast ? undefined : '0',
                              height: isLast ? '100px' : undefined,
                              background: isLast
                                ? 'linear-gradient(to bottom, rgba(220,38,38,0.4), transparent)'
                                : '#DC262650',
                            }}
                          />
                          <div className="absolute rounded-full bg-bg border-2 border-accent/60 group-hover:border-accent group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300" style={{ left: '13px', top: '17px', width: '14px', height: '14px' }} />
                          <div style={{ paddingTop: '0.25rem' }}>
                            <span className="font-mono-custom text-xs text-accent/70 tracking-wide block" style={{ marginBottom: '1.5rem' }}>
                              {yearDisplay}
                            </span>
                            <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary tracking-tight" style={{ marginBottom: '0.75rem' }}>
                              {exp.title}
                            </h3>
                            <p className="text-sm text-text-muted font-medium" style={{ marginBottom: '1.5rem' }}>
                              {exp.company}
                            </p>
                            <p className="text-sm sm:text-[15px] text-text-secondary" style={{ lineHeight: '1.9', maxWidth: '620px' }}>
                              {exp.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                

              </div>
            )}
          </>
        )}

        {activeTab === 'resume' && (
          <>
            {loading ? <ResumeSkeleton /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12rem' }} className="animate-fade-in-up">

                {/* ── Resume ── */}
                <div style={{ padding: 'clamp(4rem, 6vw, 7rem)' }} className="bg-surface border border-accent-border rounded-2xl hover:border-accent/20 transition-colors duration-500">
                  <SectionHeading label="Resume" />

                  <p className="text-text-secondary text-base sm:text-[17px]" style={{ lineHeight: '2.2', maxWidth: '600px', marginBottom: '4rem' }}>
                    {settings?.resume_intro || 'Everything about my experience, education, and technical background in one document. I\'m always open to a conversation about interesting work.'}
                  </p>

                  {settings?.resume_pdf_url ? (
                    <a
                      href={settings.resume_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center bg-gradient-to-r from-accent to-accent-hover text-white text-base font-bold rounded-full transition-all duration-300 active:scale-[0.97] overflow-hidden"
                      style={{ gap: '1rem', padding: '1.25rem 3.5rem', boxShadow: '0 20px 25px -5px rgba(220,38,38,0.25), 0 8px 10px -6px rgba(220,38,38,0.25)' }}
                    >
                      <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                      <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      <span className="relative z-10">Download Resume</span>
                      <span className="relative z-10 text-white/50 text-xs font-medium">PDF</span>
                      <svg className="w-4 h-4 relative z-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ transform: 'translateX(-8px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-4 px-6 py-4 bg-surface-elevated border border-accent-border rounded-xl text-sm text-text-muted">
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      Resume PDF not yet uploaded
                    </div>
                  )}
                </div>

                {/* ── Education ── */}
                <div>
                  <SectionHeading label="Education" />

                  {resumeData.education.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {resumeData.education.map((edu: any) => (
                        <div key={edu.id} style={{ padding: 'clamp(3rem, 4vw, 5rem)' }} className="bg-surface border border-accent-border rounded-2xl hover:border-accent/20 transition-colors duration-500">
                          <div className="flex items-center" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="rounded-xl bg-accent-dim border border-accent/20 flex items-center justify-center flex-shrink-0" style={{ width: '3.5rem', height: '3.5rem' }}>
                              <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary tracking-tight">
                                {edu.degree}
                              </h3>
                              <p className="text-sm sm:text-base text-text-muted" style={{ marginTop: '0.375rem' }}>
                                {edu.school}
                              </p>
                            </div>
                          </div>
                          <p className="font-mono-custom text-xs text-text-muted/60" style={{ marginLeft: '5rem' }}>
                            {edu.year_start && edu.year_end ? `${edu.year_start} — ${edu.year_end}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 'clamp(4rem, 5vw, 5rem)' }} className="bg-surface border border-accent-border rounded-2xl hover:border-accent/20 transition-colors duration-500">
                      <div className="flex items-center" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="rounded-xl bg-accent-dim border border-accent/20 flex items-center justify-center flex-shrink-0" style={{ width: '3.5rem', height: '3.5rem' }}>
                          <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary tracking-tight">
                            B.Sc. Computer Science
                          </h3>
                          <p className="text-sm sm:text-base text-text-muted" style={{ marginTop: '0.375rem' }}>
                            University of Technology
                          </p>
                        </div>
                      </div>
                      <p className="font-mono-custom text-xs text-text-muted/60" style={{ marginLeft: '5rem' }}>
                        2018 — 2022
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

        {activeTab === 'connect' && (
          <div className="animate-fade-in-up">
            <div style={{ padding: 'clamp(4rem, 6vw, 7rem)' }} className="bg-surface border border-accent-border rounded-2xl hover:border-accent/20 transition-colors duration-500">
              <SectionHeading label="Connect" />

              <p className="text-text-secondary text-base sm:text-[17px]" style={{ lineHeight: '2.2', maxWidth: '600px', marginBottom: '4rem' }}>
                I'm always open to new opportunities, collaborations, or just a good conversation. 
                Reach out through any of the platforms below.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ maxWidth: '500px' }}>
                {socials.length > 0 ? (
                  socials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 px-5 py-4 bg-surface-elevated border border-accent-border rounded-xl hover:border-accent/40 hover:bg-accent-dim transition-all duration-300"
                    >
                      <SimpleIcon slug={social.icon_slug} className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                          {social.platform}
                        </p>
                        <p className="text-xs text-text-muted truncate max-w-[200px]">
                          {social.url.replace(/^https?:\/\//, '')}
                        </p>
                      </div>
                      <svg className="w-4 h-4 ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  ))
                ) : (
                  <>
                    <a
                      href="https://github.com/nathan406"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 px-5 py-4 bg-surface-elevated border border-accent-border rounded-xl hover:border-accent/40 hover:bg-accent-dim transition-all duration-300"
                    >
                      <SimpleIcon slug="github" className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">GitHub</p>
                        <p className="text-xs text-text-muted">github.com/nathan406</p>
                      </div>
                      <svg className="w-4 h-4 ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                    <a
                      href="https://linkedin.com/in/nathanmuyoba"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 px-5 py-4 bg-surface-elevated border border-accent-border rounded-xl hover:border-accent/40 hover:bg-accent-dim transition-all duration-300"
                    >
                      <SimpleIcon slug="linkedin" className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">LinkedIn</p>
                        <p className="text-xs text-text-muted">linkedin.com/in/nathanmuyoba</p>
                      </div>
                      <svg className="w-4 h-4 ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

import React from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import { WorkExperience as WorkExperienceType } from '@/lib/data';

interface WorkExperienceProps {
  data: WorkExperienceType[];
}

export default function WorkExperience({ data }: WorkExperienceProps) {
  if (!data || data.length === 0) return null;

  return (
    <section className="py-20 bg-black text-white relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <ScrollReveal width="100%">
          <div className="flex flex-col items-center mb-16">
            <p className="text-sm font-medium text-gray-400 mb-4 tracking-wider uppercase">
              MY JOURNEY
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
                Work Experience
              </span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-8">
          {data.map((job, index) => (
            <ScrollReveal key={`${job.company.en}-${index}`} width="100%">
              <SpotlightCard className="p-8 border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/60 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {job.company.en}
                    </h3>
                    <p className="text-lg text-gray-300 font-medium">{job.position.en}</p>
                  </div>
                  <div className="flex flex-col items-start lg:items-end gap-2">
                    <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                      {job.period}
                    </span>
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
                      Responsibilities
                    </h4>
                    <ul className="space-y-4">
                      {(job.responsibilities.en || job.responsibilities.zh).map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500/60 flex-shrink-0 group-hover:bg-blue-400 transition-colors" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {job.achievements && job.achievements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
                        Key Achievements
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {job.achievements.map((achievement, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

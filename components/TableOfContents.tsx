'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="space-y-1">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-medium">Contents</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block text-sm py-1 transition-colors duration-150 ${
            h.level === 3 ? 'pl-4' : ''
          } ${
            activeId === h.id
              ? 'text-gray-900 font-medium'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}

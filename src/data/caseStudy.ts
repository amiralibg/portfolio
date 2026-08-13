// The one shape behind every Quick Look panel. Jobs and personal projects are
// different things — they live in different files and read differently on the
// page — but both tell the same three-beat story, so both render through the
// same component instead of two near-identical copies.

export interface CaseStudyMetric {
  value: string
  label: string
}

export interface CaseStudyLinks {
  live?: string
  github?: string
  docs?: string
}

export interface CaseStudy {
  /** Stable id — also the deep-link segment (`#projects/doran`). */
  slug: string
  /** Display name. For a job this is the company. */
  name: string
  /** One line, sentence case, no trailing period. */
  tagline: string
  /** Free text: a year, or a range. */
  year: string
  role: string
  /** Small label shown as a tag — keep the vocabulary short and honest. */
  kind: 'product' | 'open source' | 'freelance' | 'startup' | 'client'
  cover?: string
  /** Extra shots shown after the cover in the Quick Look slideshow. */
  gallery?: string[]
  story: { problem: string; built: string; impact: string }
  metrics: CaseStudyMetric[]
  tech: string[]
  links?: CaseStudyLinks
}

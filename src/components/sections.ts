/** Resume tabs, shared by the on-screen window and the scroll-mode controller. */
export const SECTIONS = [
  { id: 'about', label: 'about' },
  { id: 'experience', label: 'experience' },
  { id: 'works', label: 'works' },
  { id: 'oss', label: 'open source' },
  { id: 'skills', label: 'skills' },
  { id: 'contact', label: 'contact' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

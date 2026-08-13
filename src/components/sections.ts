/** Resume tabs, shared by the on-screen window and the scroll-mode controller. */
export const SECTIONS = [
  { id: 'about', label: 'about' },
  { id: 'experience', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'skills', label: 'skills' },
  { id: 'hire', label: 'hire me' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

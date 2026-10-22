import { resume } from '../data/resume'
import { useDraggable } from '../hooks/useDraggable'
import { TrafficLights } from './WindowChrome'
import avatar from '../assets/amirali.jpg'

interface AboutThisMacProps {
  onClose: () => void
  active: boolean
  onActivate: () => void
  /** "More Info…" — opens the resume's About tab. */
  onMoreInfo: () => void
}

/** Every value comes from resume.ts, so this can't drift from the real site. */
const languages = resume.skills.find((g) => g.group === 'Languages')?.items ?? []
const SPECS: [string, string][] = [
  ['Chip', languages.slice(0, 4).join(' · ')],
  ['Memory', resume.highlights[0]],
  ['Location', resume.availability.timezone],
  ['Serial number', resume.links.github.split('/').pop() ?? ''],
  ['Status', resume.availability.open ? resume.availability.headline : resume.availability.closedHeadline],
]

/**
 * The Apple-menu "About This Mac" panel, about the developer instead of the
 * hardware. Like the real one it's a fixed-size panel: it drags, but only the
 * close light works — minimize and zoom are greyed out.
 */
export function AboutThisMac({ onClose, active, onActivate, onMoreInfo }: AboutThisMacProps) {
  const { targetRef, onTitlePointerDown } = useDraggable()

  return (
    <div
      ref={targetRef}
      className={`about-mac${active ? ' front' : ' inactive'}`}
      role="dialog"
      aria-label="About this Mac"
      onPointerDownCapture={onActivate}
    >
      <div className="about-mac-bar" onPointerDown={onTitlePointerDown}>
        <TrafficLights label="About This Mac" onClose={onClose} />
      </div>
      <div className="about-mac-body">
        <img className="about-mac-photo" src={avatar} alt="" width={112} height={112} />
        <strong className="about-mac-name">{resume.name}</strong>
        <span className="about-mac-model">
          {resume.title}, {new Date().getFullYear()}
        </span>
        <dl className="about-mac-specs">
          {SPECS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <button className="about-mac-more" onClick={onMoreInfo}>
          More Info…
        </button>
      </div>
    </div>
  )
}

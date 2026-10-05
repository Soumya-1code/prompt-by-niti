interface LogoProps { size?: number }
interface MascotProps { size?: number }

/** P and N share one stem; the yellow dot is a blinking "prompt cursor". */
export function Logo({ size = 36 }: LogoProps) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Prompt by Niti logo">
      <rect width="64" height="64" rx="16" fill="currentColor" />
      <path d="M20 48V16h10a8 8 0 0 1 0 16h-2l18 16V24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="logo-dot" cx="46" cy="15" r="4.5" fill="#FFF0B8" />
    </svg>
  )
}

/** Niti: a friendly speech-bubble character that floats, blinks and sparkles. */
export function Mascot({ size = 140 }: MascotProps) {
  return (
    <svg className="mascot" width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Niti, the Prompt by Niti mascot">
      <g className="m-body">
        <path d="M60 14c24 0 42 15 42 36s-18 36-42 36H48L30 102V82C20 74 18 62 18 50c0-21 18-36 42-36z" fill="#E8E0FF" stroke="#7C5CFC" strokeWidth="4" strokeLinejoin="round" />
        <g className="m-eyes">
          <ellipse cx="46" cy="50" rx="5" ry="7" fill="#18221C" />
          <ellipse cx="74" cy="50" rx="5" ry="7" fill="#18221C" />
        </g>
        <circle cx="36" cy="62" r="6" fill="#FFD8C8" />
        <circle cx="84" cy="62" r="6" fill="#FFD8C8" />
        <path d="M52 62q8 8 16 0" fill="none" stroke="#18221C" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M60 14V7" stroke="#7C5CFC" strokeWidth="4" strokeLinecap="round" />
        <circle className="m-spark" cx="60" cy="5" r="5" fill="#FFF0B8" stroke="#7C5CFC" strokeWidth="2.5" />
      </g>
    </svg>
  )
}
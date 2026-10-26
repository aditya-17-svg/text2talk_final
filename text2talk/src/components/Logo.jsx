import { Link } from 'react-router-dom';

// Speech bubble with text lines and sound bars, drawn from the Text2Talk logo.
export function LogoMark({
  box = '#7288ae',
  glyph = '#111844',
  bars = '#eae0cf',
  className = 'h-9 w-9',
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{ background: box }}
      aria-hidden="true"
    >
      <svg
        viewBox="120 84 272 240"
        className="h-[72%] w-[72%]"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M168 102H345A26 26 0 0 1 371 128V244A26 26 0 0 1 345 270H240L185 308V270H168A26 26 0 0 1 142 244V128A26 26 0 0 1 168 102Z"
          stroke={glyph}
          strokeWidth="14"
        />
        <path
          d="M175 161H233M175 187H218M175 213H226"
          stroke={glyph}
          strokeWidth="11"
        />
        <path
          d="M267 173V203M290 148V229M313 163V214M336 180V196"
          stroke={bars}
          strokeWidth="11"
        />
      </svg>
    </span>
  );
}

export default function Logo({
  to = '/',
  textClass = '',
  two = 'text-steel',
  ...mark
}) {
  return (
    <Link
      to={to}
      aria-label="Text2Talk home"
      className={`flex items-center gap-2 text-lg font-bold tracking-tight ${textClass}`}
    >
      <LogoMark {...mark} />
      <span>
        text<span className={two}>2</span>talk
      </span>
    </Link>
  );
}

import { cn } from '../lib/ui'

const TONE_BG = {
  default:
    'bg-[radial-gradient(600px_180px_at_50%_0%,rgba(31,107,79,0.12),transparent_70%),color-mix(in_oklab,var(--color-card)_82%,transparent)]',
  warn: 'bg-[radial-gradient(600px_180px_at_50%_0%,rgba(194,59,59,0.1),transparent_70%),color-mix(in_oklab,var(--color-card)_82%,transparent)]',
  coral:
    'bg-[radial-gradient(600px_180px_at_50%_0%,rgba(224,80,122,0.12),transparent_70%),color-mix(in_oklab,var(--color-card)_82%,transparent)]',
}

const TONE_GLOW = {
  default: 'bg-[rgba(31,107,79,0.08)]',
  warn: 'bg-[rgba(194,59,59,0.08)]',
  coral: 'bg-[rgba(224,80,122,0.08)]',
}

const TONE_ORB = {
  default:
    'text-primary bg-primary-soft shadow-[0_10px_30px_rgba(31,107,79,0.12)]',
  warn: 'text-danger bg-[rgba(194,59,59,0.12)]',
  coral:
    'text-[#c23b6b] bg-[rgba(224,80,122,0.12)] shadow-[0_10px_30px_rgba(224,80,122,0.12)]',
}

export default function EmptyState({
  icon: Icon,
  eyebrow = 'Nothing here yet',
  title,
  description,
  action,
  tone = 'default',
}) {
  const t = TONE_BG[tone] ? tone : 'default'

  return (
    <div
      className={cn(
        'relative grid justify-items-center gap-[0.55rem] overflow-hidden rounded-2xl border border-border px-6 py-12 text-center',
        TONE_BG[t],
      )}
      role="status"
    >
      <div
        className={cn(
          'absolute inset-[auto_20%_-40%_20%] h-[60%] rounded-full blur-3xl pointer-events-none',
          TONE_GLOW[t],
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative mb-[0.35rem] grid h-16 w-16 animate-empty-float place-items-center rounded-2xl',
          TONE_ORB[t],
        )}
        aria-hidden="true"
      >
        {Icon ? <Icon size={28} strokeWidth={1.75} /> : null}
      </div>
      {eyebrow && (
        <p className="relative m-0 text-muted text-[0.78rem] font-bold tracking-[0.08em] uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="relative m-0 font-display text-[clamp(1.35rem,2.4vw,1.7rem)] font-extrabold tracking-tight text-fg">
        {title}
      </h2>
      {description && (
        <p className="relative m-0 max-w-md text-muted leading-[1.55] text-[0.95rem]">
          {description}
        </p>
      )}
      {action && <div className="relative mt-[0.65rem]">{action}</div>}
    </div>
  )
}

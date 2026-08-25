import { Link } from 'react-router-dom'
import { cn, ui } from '../lib/ui'

/**
 * TikTok-style vertical reel: full-bleed still, caption, hashtags, right action rail.
 */
export default function MediaReel({
  to,
  image,
  alt,
  handle,
  title,
  caption,
  hashtags = [],
  dimmed = false,
  badge,
  when,
  actions = [],
  compact = false,
  fullScreen = false,
}) {
  return (
    <article className={cn(ui.reel, compact && ui.reelCompact, fullScreen && ui.reelFull)}>
      <Link to={to} className={ui.reelHit}>
        <img
          src={image}
          alt={alt}
          loading="lazy"
          className={cn(ui.reelImg, dimmed && ui.reelImgDim)}
        />
        <span className={ui.reelShade} aria-hidden />
      </Link>

      {(badge || when) && (
        <div className={ui.reelTop}>
          {badge}
          {when && <span className={ui.reelWhen}>{when}</span>}
        </div>
      )}

      <div className={ui.reelRail}>
        {actions.map((a) => (
          <button
            key={a.key}
            type="button"
            className={cn(
              ui.reelRailBtn,
              a.active && (a.hot ? ui.reelRailBtnOn : ui.reelRailBtnActive),
            )}
            aria-label={a.label}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              a.onClick?.()
            }}
          >
            {a.icon}
            {a.count != null && a.count !== '' && (
              <span className={ui.reelRailCount}>{a.count}</span>
            )}
          </button>
        ))}
      </div>

      <Link to={to} className={ui.reelCaption}>
        <p className={ui.reelHandle}>{handle}</p>
        <h3 className={ui.reelTitle}>{title}</h3>
        {caption && <p className={ui.reelMeta}>{caption}</p>}
        {hashtags.length > 0 && <p className={ui.reelTags}>{hashtags.join(' ')}</p>}
      </Link>
    </article>
  )
}

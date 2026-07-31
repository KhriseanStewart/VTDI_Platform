export default function EmptyState({
  icon: Icon,
  eyebrow = 'Nothing here yet',
  title,
  description,
  action,
  tone = 'default',
}) {
  return (
    <div className={`empty-state empty-state--${tone}`} role="status">
      <div className="empty-state__glow" aria-hidden="true" />
      <div className="empty-state__orb" aria-hidden="true">
        {Icon ? <Icon size={28} strokeWidth={1.75} /> : null}
      </div>
      {eyebrow && <p className="empty-state__eyebrow">{eyebrow}</p>}
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}

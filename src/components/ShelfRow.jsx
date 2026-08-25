import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, ui } from '../lib/ui'

/**
 * A titled, horizontally scrolling row of tiles.
 *
 * Arrow controls disable at the ends and are hidden entirely when the content
 * already fits, so a short row doesn't show dead buttons.
 */
export default function ShelfRow({ title, subtitle, to, children, className }) {
  const railRef = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const sync = useCallback(() => {
    const el = railRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({
      left: el.scrollLeft > 8,
      right: max > 8 && el.scrollLeft < max - 8,
    })
  }, [])

  useEffect(() => {
    sync()
    const el = railRef.current
    if (!el) return
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [sync, children])

  const scroll = (dir) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' })
  }

  const heading = (
    <>
      {title}
      {to && <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />}
    </>
  )

  return (
    <section className={className}>
      <div className={ui.shelfHead}>
        <div className="min-w-0">
          {to ? (
            <Link to={to} className={cn(ui.shelfTitle, ui.focus)}>
              {heading}
            </Link>
          ) : (
            <h2 className={ui.shelfTitle}>{heading}</h2>
          )}
          {subtitle && <p className={ui.shelfSub}>{subtitle}</p>}
        </div>

        {(edges.left || edges.right) && (
          <div className={ui.shelfNav}>
            <button
              type="button"
              className={ui.shelfNavBtn}
              onClick={() => scroll(-1)}
              disabled={!edges.left}
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className={ui.shelfNavBtn}
              onClick={() => scroll(1)}
              disabled={!edges.right}
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div ref={railRef} className={ui.shelfRail} onScroll={sync}>
        {children}
      </div>
    </section>
  )
}

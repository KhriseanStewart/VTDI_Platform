import { Link } from 'react-router-dom'
import { cn, ui } from '../lib/ui'

const LOGO_SRC = '/terobytez-logo.png'
const LOGO_SRCSET = '/terobytez-logo-48.png 48w, /terobytez-logo-128.png 128w, /terobytez-logo.png 512w'

/**
 * OutYah wordmark with Terobytez brand mark.
 * @param {{ to?: string, light?: boolean, className?: string, showWordmark?: boolean, size?: 'sm' | 'md' | 'lg' }} props
 */
export default function Logo({
  to = '/',
  light = false,
  className,
  showWordmark = true,
  size = 'md',
}) {
  const markSize = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const wordSize =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'

  return (
    <Link to={to} className={cn(ui.logo, light && 'text-white', className)}>
      <img
        src={LOGO_SRC}
        srcSet={LOGO_SRCSET}
        sizes={size === 'lg' ? '44px' : size === 'sm' ? '32px' : '36px'}
        alt=""
        width={44}
        height={44}
        className={cn(markSize, 'rounded-xl object-contain')}
      />
      {showWordmark && (
        <span className={cn(ui.logoText, wordSize, light && 'text-white')}>
          Out<span className={light ? 'text-accent' : 'text-primary'}>Yah</span>
        </span>
      )}
    </Link>
  )
}

/** Terobytez mark for landing / marketing surfaces */
export function TerobytezLockup({ className, height = 48 }) {
  return (
    <img
      src={LOGO_SRC}
      srcSet={LOGO_SRCSET}
      sizes={`${height}px`}
      alt="Terobytez"
      width={height}
      height={height}
      className={cn('rounded-xl object-contain', className)}
      style={{ height, width: height }}
    />
  )
}

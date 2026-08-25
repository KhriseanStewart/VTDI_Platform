import { twMerge } from 'tailwind-merge'

/** Join class names; later utilities win over conflicts (bg-*, text-*, etc.) */
export function cn(...parts) {
  return twMerge(...parts.filter(Boolean))
}

/** Shared focus treatment for interactive elements */
const focus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

/** Shared motion for interactive elements */
const motion = 'transition-[background-color,color,border-color,box-shadow,transform] duration-150'

/** Shared Tailwind recipes (replaces former index.css component classes) */
export const ui = {
  focus,

  // ---- app shell
  shell: 'min-h-dvh',
  sidebar:
    'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[16.5rem] lg:flex-col lg:border-r lg:border-border lg:bg-card lg:px-4 lg:py-5',
  shellMain: 'min-h-dvh lg:pl-[16.5rem]',
  page: 'mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-9',
  pageFeed: 'mx-auto w-full max-w-none px-0 pb-28 pt-0 lg:max-w-[1180px] lg:px-10 lg:pb-16 lg:pt-9',
  pageWide: 'mx-auto w-full max-w-[1320px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-9',
  bottomNav:
    'fixed inset-x-0 bottom-0 z-40 flex justify-around gap-1 border-t border-border bg-card/92 px-2 pt-1.5 pb-[calc(0.45rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden',
  bottomLink: cn(
    'relative flex flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[0.68rem] font-semibold text-muted',
    motion,
  ),
  bottomLinkActive: 'text-primary',
  badgeDot:
    'absolute top-0.5 right-[calc(50%-1.35rem)] grid h-[1.05rem] min-w-[1.05rem] place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-bold leading-none text-on-primary',
  logo: 'inline-flex items-center gap-2.5 rounded-xl p-1',
  logoMark: 'grid h-9 w-9 place-items-center rounded-xl bg-primary text-on-primary',
  logoText: 'font-display text-xl font-extrabold tracking-tight',
  navGroupLabel:
    'mt-6 mb-1 px-3 text-[0.68rem] font-bold uppercase tracking-[0.09em] text-subtle',
  sidebarNav: 'mt-7 flex flex-col gap-0.5',
  sidebarLink: cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] font-semibold text-muted hover:bg-primary-soft hover:text-fg',
    motion,
    focus,
  ),
  sidebarLinkActive: 'bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary',
  countPill:
    'ml-auto grid min-w-[1.45rem] place-items-center rounded-full bg-primary-soft px-1.5 py-0.5 text-[0.7rem] font-bold text-primary',
  countPillOnActive: 'bg-primary text-on-primary',
  sidebarUser: cn(
    'mt-auto flex items-center gap-3 rounded-2xl border border-border bg-bg p-2.5 hover:border-border-strong',
    motion,
    focus,
  ),
  avatar: 'h-10 w-10 shrink-0 rounded-full bg-border object-cover',
  avatarXl: 'h-[4.5rem] w-[4.5rem] shrink-0 rounded-full bg-border object-cover ring-1 ring-border',
  avatarSm: 'h-9 w-9 shrink-0 rounded-full bg-border object-cover',

  // ---- typography
  display: 'font-display text-[clamp(1.6rem,3.2vw,2.15rem)] font-extrabold leading-[1.12]',
  displayLg: 'font-display text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-[1.08]',
  h2: 'font-display text-[clamp(1.25rem,2.2vw,1.6rem)] font-bold leading-tight',
  h3: 'text-[1.05rem] font-bold leading-snug',
  eyebrow: 'mb-1.5 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-primary',
  kicker: 'mb-1.5 text-[0.92rem] font-semibold text-muted',
  lede: 'max-w-2xl text-[0.98rem] leading-relaxed text-muted',
  muted: 'text-muted',
  small: 'text-[0.85rem] text-muted',
  stack: 'flex flex-col gap-4',
  stackLg: 'flex flex-col gap-7 lg:gap-9',
  sectionHead: 'mb-4 flex flex-wrap items-end justify-between gap-3',
  sectionHeadTitle: 'font-display text-[1.2rem] font-bold tracking-tight',
  textLink: cn('rounded text-[0.9rem] font-semibold text-primary hover:underline', focus),
  backLink: cn(
    'inline-flex w-fit items-center gap-1.5 rounded-lg text-[0.85rem] font-semibold text-muted hover:text-primary',
    motion,
    focus,
  ),
  mutedCount: 'inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-muted',
  divider: 'h-px w-full bg-border',

  // ---- buttons
  btn: cn(
    'inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent px-[1.15rem] py-2.5 text-[0.9rem] font-semibold disabled:cursor-not-allowed disabled:opacity-50',
    motion,
    focus,
  ),
  btnPrimary:
    'bg-primary text-on-primary shadow-[var(--shadow-xs)] hover:bg-primary-hover active:translate-y-px',
  btnSecondary: 'bg-primary-soft text-primary hover:bg-primary/15 active:translate-y-px',
  btnOutline:
    'border-border bg-card text-fg hover:border-border-strong hover:bg-bg active:translate-y-px',
  btnGhost: 'bg-transparent text-muted hover:bg-primary-soft hover:text-primary',
  btnDanger: 'bg-danger-soft text-danger hover:bg-danger/15',
  btnSm: 'gap-1.5 px-3.5 py-1.5 text-[0.8rem]',
  btnLg: 'px-6 py-3 text-[0.98rem]',
  btnBlock: 'w-full',
  iconBtn: cn(
    'grid cursor-pointer place-items-center rounded-lg border-none bg-transparent p-2 text-muted hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
    motion,
    focus,
  ),
  iconBtnLiked: 'text-danger hover:bg-danger-soft hover:text-danger',

  // ---- surfaces
  cardPanel: 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5',
  cardFlat: 'rounded-2xl border border-border bg-card',
  cardHover: cn('hover:border-border-strong hover:shadow-[var(--shadow-lift)]', motion),
  listGroup: 'divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card',
  listRow: cn('flex items-center gap-3 px-3.5 py-3 hover:bg-bg', motion),
  pill: 'inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[0.75rem] font-semibold text-primary',
  pillMuted:
    'inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--color-fg)_6%,transparent)] px-2.5 py-1 text-[0.75rem] font-semibold text-muted',
  statGrid: 'grid grid-cols-3 gap-2.5 sm:gap-3',
  stat: 'rounded-2xl border border-border bg-card px-3 py-3.5 text-center',
  statValue: 'block font-display text-[1.4rem] font-extrabold leading-none',
  statLabel: 'mt-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-subtle',

  // ---- tabs
  tabs: 'flex gap-1 overflow-x-auto border-b border-border rail-scroll',
  tab: cn(
    'shrink-0 cursor-pointer border-b-2 border-transparent bg-transparent px-3.5 pb-2.5 pt-2 text-[0.9rem] font-semibold text-muted hover:text-fg',
    motion,
  ),
  tabActive: 'border-b-primary text-primary hover:text-primary',

  // ---- forms
  field: 'flex flex-col gap-1.5',
  fieldLabel: 'text-[0.8rem] font-semibold text-muted',
  fieldControl: cn(
    'w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-[0.92rem] text-fg placeholder:text-subtle hover:border-border-strong focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
    motion,
  ),
  /** Wrap a control to sit an icon inside it. */
  fieldGroup: 'relative flex items-center',
  fieldIcon: 'pointer-events-none absolute left-3.5 text-subtle',
  fieldControlIcon: 'pl-10',
  fieldControlAction: 'pr-11',
  fieldAction: cn(
    'absolute right-1.5 grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-subtle hover:bg-primary-soft hover:text-primary',
    motion,
    focus,
  ),
  fieldHint: 'text-[0.76rem] text-subtle',
  formError:
    'flex items-start gap-1.5 rounded-lg bg-danger-soft px-3 py-2 text-[0.85rem] font-medium text-danger',
  formOk:
    'flex items-start gap-1.5 rounded-lg bg-primary-soft px-3 py-2 text-[0.85rem] font-medium text-primary',

  /** Two-state switch, e.g. sign in / sign up. */
  segmented: 'grid grid-cols-2 gap-1 rounded-xl border border-border bg-bg p-1',
  segmentedItem: cn(
    'cursor-pointer rounded-lg px-3 py-2 text-[0.88rem] font-semibold text-muted hover:text-fg',
    motion,
    focus,
  ),
  segmentedItemActive: 'bg-card text-fg shadow-[var(--shadow-xs)]',
  actionRow: 'flex flex-wrap items-center gap-2.5',
  codeBlock:
    'overflow-x-auto rounded-xl border border-border bg-bg p-3 font-mono text-[0.8rem] text-muted',
  note: 'rounded-xl border border-dashed border-border bg-card px-3.5 py-3 text-[0.87rem] leading-relaxed text-muted',

  // ---- search / discovery
  searchBar:
    'flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-3 text-muted',
  searchInput: 'flex-1 border-none bg-transparent text-fg outline-none placeholder:text-subtle',
  discoverPanel:
    'overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]',
  discoverRow:
    'grid grid-cols-1 divide-y divide-border sm:grid-cols-[1.2fr_1fr_auto] sm:divide-x sm:divide-y-0',
  discoverField: cn('flex flex-col gap-1 px-4 py-3.5 text-left hover:bg-bg', motion),
  discoverFieldLabel: 'text-[0.7rem] font-bold uppercase tracking-[0.08em] text-subtle',
  discoverFieldControl:
    'w-full cursor-pointer border-none bg-transparent p-0 text-[0.95rem] font-semibold text-fg outline-none placeholder:font-normal placeholder:text-subtle',
  discoverSearchBtn: cn(
    'm-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[0.9rem] font-semibold text-on-primary hover:bg-primary-hover sm:self-center',
    motion,
    focus,
  ),
  rail: 'flex gap-3 overflow-x-auto pb-1 rail-scroll',
  popularStrip: 'flex overflow-x-auto rail-scroll',
  popularMosaic:
    'flex min-w-full overflow-hidden rounded-2xl border border-border bg-border sm:inline-flex sm:min-w-0',
  popularCard: cn(
    'flex min-w-[15.5rem] shrink-0 items-center gap-3 border-r border-border bg-card p-2.5 pr-3 last:border-r-0 hover:bg-bg sm:min-w-[16.5rem]',
    motion,
  ),
  popularCardImg: 'h-14 w-14 shrink-0 rounded-xl object-cover',
  chips: 'flex gap-2 overflow-x-auto pb-0.5 rail-scroll',
  chipsSticky: 'sticky top-0 z-20 -mx-4 bg-bg/85 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6',
  chip: cn(
    'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[0.85rem] font-semibold text-muted hover:border-border-strong hover:text-fg',
    motion,
    focus,
  ),
  chipActive:
    'border-primary bg-primary text-on-primary hover:border-primary hover:text-on-primary',

  viewToggle: 'inline-flex shrink-0 items-center rounded-full border border-border bg-card p-1',
  viewToggleBtn: cn(
    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none bg-transparent px-3.5 py-1.5 text-[0.82rem] font-semibold text-muted hover:text-fg',
    motion,
  ),
  viewToggleBtnActive: 'bg-primary text-on-primary hover:text-on-primary',

  // ---- reels (TikTok-style feed cards)
  reel: cn(
    'group relative isolate aspect-9/16 overflow-hidden rounded-2xl bg-black text-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)]',
    motion,
  ),
  reelCompact: 'w-[13.5rem] shrink-0 sm:w-[14.5rem]',
  reelFull:
    'aspect-auto h-full min-h-[calc(100dvh-4.5rem)] w-full max-w-none rounded-none shadow-none lg:mx-auto lg:max-h-[calc(100dvh-5rem)] lg:max-w-[26rem] lg:rounded-2xl lg:shadow-[var(--shadow-card)]',
  feedShell: '-mx-0 flex min-h-[calc(100dvh-4.5rem)] flex-col lg:min-h-[calc(100dvh-5rem)]',
  feedScroller:
    'min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth [-webkit-overflow-scrolling:touch]',
  feedSlide: 'h-[calc(100dvh-4.5rem)] snap-start snap-always lg:h-[calc(100dvh-5rem)]',
  reelHit: cn('absolute inset-0 block', focus),
  reelImg: cn(
    'absolute inset-0 h-full w-full object-cover brightness-[0.78] contrast-[1.06] saturate-[0.95] group-hover:scale-[1.04]',
    'transition-transform duration-500 ease-out',
  ),
  reelImgDim: 'grayscale brightness-[0.45]',
  reelShade:
    'absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.55)_28%,rgba(0,0,0,0.05)_62%,rgba(0,0,0,0.25)_100%)]',
  reelTop:
    'pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between gap-2 p-3',
  reelWhen:
    'rounded-lg bg-black/50 px-2 py-1 text-[0.68rem] font-bold text-white backdrop-blur-md',
  reelRail: 'absolute right-2 bottom-[6rem] z-[3] flex flex-col items-center gap-4',
  reelRailBtn: cn(
    'flex cursor-pointer flex-col items-center gap-1 rounded-lg border-none bg-transparent p-1 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] hover:scale-110',
    motion,
  ),
  reelRailBtnOn: 'text-danger',
  reelRailBtnActive: 'text-accent',
  reelRailCount: 'text-[0.66rem] font-bold leading-none tabular-nums',
  reelCaption: cn(
    'absolute inset-x-0 bottom-0 z-[2] block max-w-[calc(100%-3.4rem)] p-3.5 pr-2 text-white',
    focus,
  ),
  reelHandle: 'text-[0.85rem] font-bold text-white/90',
  reelTitle: 'mt-0.5 font-display text-[1.05rem] font-bold leading-[1.2] line-clamp-2',
  reelMeta: 'mt-1 line-clamp-1 text-[0.78rem] leading-snug text-white/80',
  reelTags: 'mt-1.5 line-clamp-1 text-[0.74rem] font-semibold text-white/65',

  // ---- Jamaica Pulse
  pulsePanel:
    'overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-primary)_7%,var(--color-card)),var(--color-card))] shadow-[var(--shadow-card)]',
  pulseHead: 'flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5',
  pulseTitle: 'inline-flex items-center gap-2 font-display text-[1.1rem] font-extrabold tracking-tight',
  pulseLive:
    'relative grid h-2.5 w-2.5 place-items-center rounded-full bg-danger before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-danger/70',
  pulseScope: 'mt-1 text-[0.82rem] text-muted',
  pulseVibe:
    'inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[0.75rem] font-bold text-primary shadow-[var(--shadow-xs)]',
  pulseWeather: 'mx-4 mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[0.82rem] font-medium sm:mx-5',
  pulseWeatherGood: 'bg-primary-soft text-primary',
  pulseWeatherOk: 'bg-[color-mix(in_oklab,var(--color-fg)_6%,transparent)] text-muted',
  pulseWeatherPoor: 'bg-[color-mix(in_oklab,var(--color-accent)_22%,transparent)] text-on-accent',
  pulseTabs: 'mt-3 flex gap-1.5 overflow-x-auto px-4 pb-0.5 rail-scroll sm:px-5',
  pulseTab: cn(
    'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[0.8rem] font-semibold text-muted hover:border-border-strong hover:text-fg',
    motion,
    focus,
  ),
  pulseTabActive: 'border-primary bg-primary text-on-primary hover:text-on-primary',
  pulseTabCount: 'text-[0.72rem] font-bold tabular-nums opacity-70',
  pulseRail: 'flex gap-2.5 overflow-x-auto px-4 py-4 rail-scroll sm:px-5',
  pulseCard: cn(
    'flex w-[16.5rem] shrink-0 items-center gap-3 rounded-xl border border-border bg-card p-2.5 hover:border-border-strong hover:shadow-[var(--shadow-lift)]',
    motion,
  ),
  pulseCardImg: 'h-14 w-14 shrink-0 rounded-lg bg-border object-cover',
  pulseCardTitle: 'truncate text-[0.88rem] font-bold leading-snug',
  pulseCardMeta: 'mt-0.5 truncate text-[0.76rem] text-muted',
  pulseWhen: 'mt-1 inline-flex items-center gap-1 text-[0.74rem] font-bold',
  pulseWhenLive: 'text-danger',
  pulseWhenSoon: 'text-primary',
  pulseWhenMuted: 'text-muted',
  pulseEmpty: 'px-4 py-5 text-[0.88rem] text-muted sm:px-5',
  pulseNote:
    'border-t border-border bg-[color-mix(in_oklab,var(--color-fg)_3%,transparent)] px-4 py-2.5 text-[0.78rem] text-muted sm:px-5',

  // ---- event chat
  chatPanel: 'overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]',
  chatHead: 'flex items-center justify-between gap-3 border-b border-border px-4 py-3',
  chatTitle: 'inline-flex items-center gap-2 font-display text-[1rem] font-extrabold tracking-tight',
  chatLive:
    'inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-muted',
  chatLiveDot: 'h-1.5 w-1.5 rounded-full bg-primary',
  chatLiveDotOff: 'h-1.5 w-1.5 rounded-full bg-border-strong',
  chatScroll: 'flex max-h-[26rem] min-h-[12rem] flex-col gap-3.5 overflow-y-auto px-4 py-4',
  chatRow: 'group flex gap-2.5',
  chatAvatar: 'h-8 w-8 shrink-0 rounded-full bg-border object-cover',
  chatMeta: 'flex items-baseline gap-2',
  chatAuthor: 'truncate text-[0.82rem] font-bold',
  chatTime: 'shrink-0 text-[0.72rem] text-subtle tabular-nums',
  chatBody: 'mt-0.5 whitespace-pre-wrap break-words text-[0.88rem] leading-relaxed',
  chatDelete: cn(
    'shrink-0 cursor-pointer self-start rounded-lg p-1 text-subtle opacity-0 hover:bg-danger-soft hover:text-danger group-hover:opacity-100 focus-visible:opacity-100',
    motion,
    focus,
  ),
  chatForm: 'flex items-end gap-2 border-t border-border bg-bg/60 p-3',
  chatInput: cn(
    'max-h-28 min-h-[2.5rem] w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-[0.9rem] leading-relaxed placeholder:text-subtle',
    focus,
  ),
  chatSend: cn(
    'grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-primary text-on-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40',
    motion,
    focus,
  ),
  chatLocked: 'grid justify-items-center gap-3 px-6 py-10 text-center',
  chatLockedIcon: 'grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary',
  chatEmpty: 'px-4 py-10 text-center text-[0.88rem] text-muted',

  // ---- cost estimate
  costHead: 'flex items-start justify-between gap-3',
  costTag:
    'inline-flex shrink-0 items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-fg)_6%,transparent)] px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-muted',
  costHeadline: 'font-display text-[1.8rem] font-extrabold leading-none tabular-nums',
  costSub: 'mt-1.5 text-[0.85rem] text-muted',
  costRow: 'flex items-baseline justify-between gap-3 text-[0.86rem]',
  costRowName: 'min-w-0 truncate',
  costRowValue: 'shrink-0 font-semibold tabular-nums',
  costFoot: 'text-[0.76rem] leading-relaxed text-subtle',
  stepper: 'inline-flex items-center rounded-full border border-border bg-card p-0.5',
  stepperBtn: cn(
    'grid h-7 w-7 cursor-pointer place-items-center rounded-full text-muted hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent',
    motion,
    focus,
  ),
  stepperValue: 'w-9 text-center text-[0.9rem] font-bold tabular-nums',

  // ---- shelves (horizontally scrolling rows)
  shelfHead: 'mb-3 flex items-end justify-between gap-3',
  shelfTitle:
    'group inline-flex items-center gap-1.5 font-display text-[1.15rem] font-bold tracking-tight',
  shelfSub: 'mt-0.5 text-[0.85rem] text-muted',
  shelfRail: 'flex gap-3 overflow-x-auto pb-2 rail-scroll',
  shelfNav: 'hidden items-center gap-1.5 sm:flex',
  shelfNavBtn: cn(
    'grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-border bg-card text-muted hover:border-border-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-35',
    motion,
    focus,
  ),

  // ---- tiles (compact browse cards)
  tile: 'group relative flex w-[10.5rem] shrink-0 flex-col sm:w-[12.5rem]',
  tileGrid: 'grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 min-[1280px]:grid-cols-5',
  tileWide: 'w-full',
  tileMedia: cn(
    'relative block aspect-square overflow-hidden rounded-xl bg-border shadow-[var(--shadow-xs)]',
    focus,
  ),
  tileImg: cn(
    'h-full w-full object-cover group-hover:scale-[1.05]',
    'transition-transform duration-500 ease-out',
  ),
  tileBadge:
    'absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[0.68rem] font-bold text-fg shadow-[var(--shadow-xs)] backdrop-blur-md',
  tileBadgeLive: 'bg-danger text-on-primary',
  tileBadgeSoon: 'bg-primary text-on-primary',
  tileFav: cn(
    'absolute right-2 top-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] hover:scale-110',
    motion,
    focus,
  ),
  tileFavOn: 'text-danger',
  tileBody: 'mt-2 block',
  // `truncate` needs a block box to clip against — inline spans overflow instead.
  tileTitle: 'block truncate text-[0.88rem] font-bold leading-snug',
  tileMeta: 'mt-0.5 block truncate text-[0.82rem] text-muted',
  tileFoot: 'mt-0.5 flex items-center gap-1.5 text-[0.82rem] text-muted',

  // ---- grids
  placeGrid:
    'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 min-[1280px]:grid-cols-5',
  placeCard: 'bg-transparent',
  placeCardMedia: 'relative block aspect-4/3 overflow-hidden rounded-xl',
  placeCardImg: 'h-full w-full object-cover',
  catBadge:
    'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.7rem] font-bold text-white',
  favBtn: cn(
    'absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-none bg-white/92 text-muted shadow-[var(--shadow-xs)] backdrop-blur-md hover:bg-white',
    motion,
    focus,
  ),
  favBtnOn: 'text-danger',
  favBtnFloating: 'z-[3]',
  placeCardTags:
    'absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent)] px-3 pb-3 pt-8',
  tag: 'rounded-full bg-white/20 px-2 py-0.5 text-[0.68rem] font-bold text-white backdrop-blur-sm',
  tagGreen: 'bg-primary-soft text-primary',
  tagGold: 'bg-accent text-on-accent',
  tagDanger: 'bg-danger/15 text-danger',
  placeCardBody: 'block pt-3',
  placeCardTitleRow: 'flex justify-between gap-2',
  placeCardTitle: 'text-[0.95rem] font-bold leading-snug',
  rating:
    'inline-flex items-center gap-1 text-[0.88rem] font-bold tabular-nums text-fg [&_svg]:text-accent',
  placeMeta: 'mt-1.5 flex items-center gap-1.5 text-[0.82rem] text-muted',
  placeSubmeta: 'mt-1 flex items-center gap-1.5 text-[0.82rem] text-muted',

  // ---- detail layout
  detailGrid: 'grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,1fr)] lg:items-start lg:gap-8',
  detailAside: 'flex flex-col gap-4 lg:sticky lg:top-6',
  heroFrame:
    'relative overflow-hidden rounded-2xl bg-[color-mix(in_oklab,var(--color-fg)_8%,transparent)] shadow-[var(--shadow-card)]',
  heroMedia: 'aspect-4/3 w-full object-cover sm:aspect-16/10',
  heroOverlay:
    'pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.1)_38%,transparent_70%)]',
  heroCaption: 'absolute inset-x-0 bottom-0 z-[2] p-4 text-white sm:p-5',
  thumbRail: 'mt-3 flex gap-2 overflow-x-auto pb-1 rail-scroll',
  thumb: cn(
    'h-16 w-[4.5rem] shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-transparent p-0 opacity-65 hover:opacity-100 sm:h-[4.5rem] sm:w-[6rem]',
    motion,
    focus,
  ),
  thumbActive: 'border-primary opacity-100',
  infoRow: 'flex items-start gap-2.5 text-[0.9rem] leading-relaxed text-muted',

  // ---- events
  eventStrip: 'flex gap-3 overflow-x-auto pb-1.5 rail-scroll',
  eventGrid:
    'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 min-[1280px]:grid-cols-5',
  eventCard: cn('block bg-card hover:bg-bg', motion),
  eventCardCompact: 'w-64 shrink-0 overflow-hidden rounded-xl border border-border',
  eventCardMedia: 'relative aspect-16/10 overflow-hidden',
  eventType:
    'absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-bold text-on-accent',
  eventWhen:
    'absolute bottom-3 left-3 rounded-lg bg-white/92 px-2.5 py-1.5 text-[0.72rem] font-bold text-fg',
  eventBadgeRow: 'absolute left-3 top-3 z-[2] flex flex-wrap gap-1.5',
  eventBadge:
    'rounded-full px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.06em] backdrop-blur-sm',
  eventBadgePast: 'bg-fg/75 text-on-primary',
  eventBadgeLive: 'bg-danger text-on-primary',
  eventBadgeUpcoming: 'bg-primary text-on-primary',
  eventBadgeRecurring: 'bg-accent text-on-accent',
  eventPastCard: 'opacity-70',
  eventCardBody: 'p-4',
  eventCardBodyTitle: 'text-[0.96rem] font-bold leading-snug',
  eventCardBodyMeta: 'mt-1.5 flex items-center gap-1.5 text-[0.82rem] text-muted',
  eventCardFoot: 'mt-3.5 flex items-center justify-between',
  eventCardType: 'text-[0.7rem] font-bold uppercase tracking-[0.08em] text-primary',
  eventMosaic: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4',
  eventMosaicItem: cn('group block overflow-hidden rounded-xl bg-card', motion),
  eventMosaicMedia: 'aspect-16/10 overflow-hidden',
  eventMosaicBody: 'p-4',
  avatarStack: 'flex items-center gap-1.5 text-[0.75rem] font-semibold text-muted',
  avatarStackImg: '-ml-1.5 h-6 w-6 rounded-full border-2 border-card first:ml-0',
  avatarStackImgLarge: '-ml-1.5 h-[2.2rem] w-[2.2rem] rounded-full border-2 border-card first:ml-0',
  rsvp: 'inline-flex items-center gap-1 text-[0.75rem] font-bold text-primary',
  eventHero:
    'relative overflow-hidden rounded-2xl bg-black shadow-[var(--shadow-card)] aspect-4/3 sm:aspect-16/10',

  // ---- community posts
  igSectionTitle: 'inline-flex items-center gap-2',
  igSourceNote:
    'rounded-xl border border-dashed border-border bg-card px-3.5 py-3 text-[0.87rem] leading-relaxed text-muted [&_code]:text-[0.85em]',
  igFeed: 'grid gap-6 sm:grid-cols-2 min-[1100px]:grid-cols-3',
  igCard: 'flex flex-col gap-2.5',
  igCardHead: 'flex items-center gap-2.5',
  igCardUser: 'flex min-w-0 flex-1 flex-col gap-0.5',
  igPlaceLink: 'inline-flex items-center gap-1 text-[0.75rem] font-semibold text-primary',
  igCardMedia: cn(
    'block aspect-4/5 overflow-hidden rounded-xl bg-border shadow-[var(--shadow-card)]',
    focus,
  ),
  igCardActions: 'flex items-center gap-0.5',
  igCardBody: 'grid gap-1.5',
  igLikes: 'text-[0.85rem] font-bold',
  igCaption: 'text-[0.9rem] leading-relaxed text-fg [&_strong]:mr-1.5',
  igCommentsToggle: cn(
    'cursor-pointer rounded border-none bg-transparent p-0 text-left text-[0.82rem] font-semibold text-muted hover:text-fg',
    focus,
  ),
  igComments:
    'mt-1 grid list-none gap-1.5 p-0 [&_li]:text-[0.85rem] [&_li]:leading-relaxed [&_strong]:mr-1',

  // ---- maps
  mapPanel: 'overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]',
  mapCanvas: 'relative h-[58vh] min-h-[440px]',
  mapCanvasSm: 'h-80 min-h-[280px]',
  mapFallback:
    'grid h-full min-h-inherit w-full place-items-center bg-[color-mix(in_oklab,var(--color-primary)_5%,var(--color-bg))] p-6 text-center text-muted [&_code]:text-[0.85em]',

  // ---- admin
  adminShell: 'min-h-dvh bg-bg lg:grid lg:grid-cols-[15rem_1fr]',
  adminSidebar:
    'border-b border-border bg-card p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r',
  adminBrand: 'font-display text-lg font-extrabold tracking-tight',
  adminNav: 'mt-4 flex flex-wrap gap-1 lg:flex-col',
  adminLink: cn(
    'rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-primary-soft hover:text-fg',
    motion,
    focus,
  ),
  adminLinkActive: 'bg-primary-soft text-primary hover:text-primary',
  adminBack: 'mt-4 inline-flex text-sm font-semibold text-primary',
  adminMain: 'p-4 pb-12 lg:p-8 lg:pb-12',
  adminLoading: 'grid min-h-dvh place-items-center text-muted',
  adminDenied: 'mx-auto max-w-lg p-8',
  adminStatGrid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4',
  adminStat: 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]',
  adminStatValue: 'font-display text-[1.7rem] font-extrabold leading-none',
  adminStatLabel: 'mt-1.5 text-[0.8rem] font-medium text-muted',
  adminFormGrid: 'grid grid-cols-1 gap-3.5 lg:grid-cols-2',
  adminTableWrap:
    'overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]',
  adminTable: 'w-full border-collapse text-[0.9rem]',
  adminTh:
    'whitespace-nowrap border-b border-border bg-bg px-3.5 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.07em] text-subtle',
  adminTd: 'border-b border-border px-3.5 py-3 align-top last:border-b-0',
  adminRowActions: 'flex justify-end gap-1.5 whitespace-nowrap',
  adminEmptyInline: 'px-2 py-8 text-center text-muted',
  adminSubhead: 'text-[0.95rem] font-semibold',
  adminUploadRow: 'flex flex-wrap gap-2',
  adminFileBtn: 'cursor-pointer',
  adminImageGrid: 'grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3',
  adminImageThumb: 'overflow-hidden rounded-xl border border-border bg-bg',
  adminImageThumbCover: 'border-primary ring-1 ring-primary',
  adminImageThumbImg: 'aspect-square w-full object-cover',
  adminImageActions: 'flex flex-col gap-1.5 p-1.5',
  adminCoverBadge: 'text-[0.7rem] font-bold uppercase tracking-wider text-primary',

  placePicker: 'flex flex-col gap-2',
  placePickerHint: 'text-[0.85rem] text-muted',
  placePickerAddress: 'text-[0.85rem] text-muted',
  placePickerFallback: 'min-h-32',
}

export function btn(...variants) {
  return cn(ui.btn, ...variants)
}

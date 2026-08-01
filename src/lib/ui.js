/** Join class names, skipping falsy values */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

/** Shared Tailwind recipes (replaces former index.css component classes) */
export const ui = {
  // layout
  shell: 'min-h-dvh',
  sidebar:
    'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:gap-2 lg:border-r lg:border-border lg:bg-[color-mix(in_oklab,var(--color-card)_88%,var(--color-bg))] lg:p-6 lg:pr-4',
  shellMain: 'min-h-dvh lg:pl-64',
  page: 'mx-auto w-full max-w-[1040px] px-4 pb-24 pt-4 lg:px-8 lg:pb-10 lg:pt-8',
  bottomNav:
    'fixed inset-x-0 bottom-0 z-40 flex justify-around gap-1 border-t border-border bg-[color-mix(in_oklab,var(--color-card)_92%,transparent)] px-2 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden',
  bottomLink:
    'relative flex flex-1 flex-col items-center gap-0.5 rounded-xl p-1.5 text-[0.68rem] font-semibold text-muted',
  bottomLinkActive: 'text-primary',
  badgeDot:
    'absolute top-0 right-[calc(50%-1.4rem)] min-w-4 h-4 rounded-full bg-primary px-1 text-center text-[0.62rem] leading-4 text-primary-fg',
  logo: 'inline-flex items-center gap-2.5 p-1.5',
  logoMark: 'grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-fg',
  logoText: 'font-display text-xl font-extrabold',
  sidebarNav: 'mt-6 flex flex-col gap-1',
  sidebarLink:
    'flex items-center gap-3 rounded-[0.85rem] px-3 py-2.5 text-[0.92rem] font-semibold text-fg hover:bg-primary-soft',
  sidebarLinkActive: 'bg-primary text-primary-fg hover:bg-primary',
  countPill:
    'ml-auto min-w-[1.4rem] rounded-full bg-primary-soft px-1.5 py-0.5 text-center text-[0.72rem] text-primary',
  countPillOnActive: 'bg-white/20 text-primary-fg',
  sidebarUser:
    'mt-auto flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5',
  avatar: 'h-10 w-10 rounded-full object-cover bg-border',
  avatarXl: 'h-20 w-20 rounded-full object-cover bg-border',
  avatarSm: 'h-9 w-9 rounded-full object-cover bg-border',

  // type
  display: 'font-display text-[clamp(1.6rem,3vw,2rem)] font-extrabold leading-tight',
  eyebrow: 'mb-1 text-[0.9rem] text-muted',
  lede: 'max-w-2xl leading-relaxed text-muted',
  muted: 'text-muted',
  stack: 'flex flex-col gap-4',
  stackLg: 'flex flex-col gap-6',
  sectionHead: 'mb-3.5 flex items-center justify-between gap-4',
  sectionHeadTitle: 'text-[1.15rem] font-bold',
  textLink: 'text-[0.92rem] font-semibold text-primary',
  mutedCount: 'inline-flex items-center gap-1.5 text-[0.85rem] text-muted',

  // buttons
  btn: 'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-transparent bg-card px-4 py-2.5 text-[0.9rem] font-semibold text-fg',
  btnPrimary: 'bg-primary text-primary-fg',
  btnSecondary: 'bg-primary-soft text-primary',
  btnOutline: 'border-border bg-card',
  btnSm: 'px-3.5 py-1.5 text-[0.8rem]',
  iconBtn:
    'cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-muted hover:bg-primary-soft hover:text-primary',

  // forms
  field: 'flex flex-col gap-1.5 text-[0.85rem]',
  fieldLabel: 'font-semibold text-muted',
  fieldControl:
    'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-fg outline-none focus:border-primary',
  formError: 'text-sm text-danger',
  formOk: 'text-sm text-primary',
  cardPanel: 'rounded-[1.1rem] border border-border bg-card p-4 sm:p-5',
  actionRow: 'flex flex-wrap items-center gap-2',
  codeBlock:
    'overflow-x-auto rounded-xl border border-border bg-bg p-3 font-mono text-[0.8rem]',

  // search / chips
  searchBar:
    'flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-3.5 text-muted',
  searchInput: 'flex-1 border-none bg-transparent text-fg outline-none',
  chips: 'flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  chipsSticky:
    'sticky top-0 z-10 bg-[color-mix(in_oklab,var(--color-bg)_88%,transparent)] py-2 backdrop-blur-sm',
  chip: 'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[0.85rem] font-semibold text-fg',
  chipActive: 'border-primary bg-primary text-primary-fg',

  // place card
  placeGrid: 'grid grid-cols-1 gap-[1.15rem] sm:grid-cols-2 min-[1100px]:grid-cols-3',
  placeCard: 'bg-transparent',
  placeCardMedia: 'relative block aspect-[4/3] overflow-hidden rounded-[0.9rem]',
  placeCardImg: 'h-full w-full object-cover',
  catBadge:
    'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.7rem] font-bold text-white',
  favBtn:
    'absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-white/92 text-muted',
  favBtnOn: 'text-danger',
  favBtnFloating: 'z-[2]',
  placeCardTags:
    'absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-8',
  tag: 'rounded-full bg-white/18 px-2 py-0.5 text-[0.68rem] font-bold text-white',
  tagGreen: 'bg-primary-soft text-primary',
  tagGold: 'bg-accent text-accent-fg',
  tagDanger: 'bg-danger/15 text-danger',
  placeCardBody: 'block pt-3',
  placeCardTitleRow: 'flex justify-between gap-2',
  placeCardTitle: 'text-base font-bold leading-snug',
  rating: 'inline-flex items-center gap-1 text-[0.88rem] font-bold text-accent-fg [&_svg]:text-accent',
  placeMeta: 'mt-1.5 flex items-center gap-1.5 text-[0.82rem] text-muted',
  placeSubmeta: 'mt-1.5 flex items-center gap-1.5 text-[0.82rem] text-muted',

  // events
  eventStrip: 'flex gap-4 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  eventGrid: 'grid grid-cols-1 gap-[1.15rem] min-[720px]:grid-cols-2',
  eventCard: 'block bg-transparent',
  eventCardCompact: 'w-64 shrink-0',
  eventCardMedia: 'relative aspect-[16/10] overflow-hidden rounded-[0.9rem]',
  eventType:
    'absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-bold text-accent-fg',
  eventWhen:
    'absolute bottom-3 left-3 rounded-[0.7rem] bg-white/92 px-2.5 py-1.5 text-[0.72rem] font-bold',
  eventCardBody: 'pt-3',
  eventCardBodyTitle: 'text-[0.98rem] font-bold',
  eventCardBodyMeta: 'mt-1.5 flex items-center gap-1.5 text-[0.82rem] text-muted',
  eventCardFoot: 'mt-3.5 flex items-center justify-between',
  avatarStack: 'flex items-center gap-1.5 text-[0.75rem] font-semibold text-muted',
  avatarStackImg: '-ml-1.5 h-6 w-6 rounded-full border-2 border-card first:ml-0',
  avatarStackImgLarge: '-ml-1.5 h-[2.2rem] w-[2.2rem] rounded-full border-2 border-card first:ml-0',
  rsvp: 'inline-flex items-center gap-1 text-[0.75rem] font-bold text-primary',
  eventHero: 'relative aspect-video overflow-hidden rounded-[1.1rem]',

  viewToggle: 'inline-flex shrink-0 items-center rounded-full border border-border bg-card p-0.5',
  viewToggleBtn:
    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none bg-transparent px-3.5 py-1.5 text-[0.82rem] font-semibold text-muted',
  viewToggleBtnActive: 'bg-primary text-primary-fg',

  // ig
  igSectionTitle: 'inline-flex items-center gap-1.5',
  igSourceNote:
    'm-0 rounded-xl border border-dashed border-border px-3.5 py-3 text-[0.85rem] leading-snug text-muted [&_code]:text-[0.8em]',
  igFeed: 'grid max-w-[34rem] gap-6 min-[900px]:max-w-none min-[900px]:grid-cols-2',
  igCard: 'flex flex-col gap-2.5',
  igCardHead: 'flex items-center gap-2.5',
  igCardUser: 'flex min-w-0 flex-1 flex-col gap-0.5',
  igPlaceLink: 'inline-flex items-center gap-1 text-[0.75rem] font-semibold text-primary',
  igCardMedia: 'block aspect-[4/5] overflow-hidden rounded-[0.9rem] bg-border',
  igCardActions: 'flex items-center gap-0.5',
  iconBtnLiked: 'text-danger hover:text-danger',
  igCardBody: 'grid gap-1.5',
  igLikes: 'text-[0.85rem] font-bold',
  igCaption: 'text-[0.9rem] leading-snug text-fg [&_strong]:mr-1.5',
  igCommentsToggle:
    'cursor-pointer border-none bg-transparent p-0 text-left text-[0.82rem] font-semibold text-muted',
  igComments: 'mt-1 grid list-none gap-1.5 p-0 [&_li]:text-[0.85rem] [&_li]:leading-snug [&_strong]:mr-1',

  // maps
  mapPanel: 'overflow-hidden rounded-[1.1rem] border border-border bg-card',
  mapCanvas: 'relative h-[58vh] min-h-[440px]',
  mapCanvasSm: 'h-80 min-h-[280px]',
  mapFallback:
    'grid h-full min-h-inherit w-full place-items-center bg-[color-mix(in_oklab,var(--color-primary)_6%,var(--color-bg))] p-6 text-center text-muted [&_code]:text-[0.85em]',

  // admin
  adminShell: 'min-h-dvh bg-bg lg:grid lg:grid-cols-[15rem_1fr]',
  adminSidebar:
    'border-b border-border bg-[color-mix(in_oklab,var(--color-card)_90%,var(--color-bg))] p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r',
  adminBrand: 'font-display text-lg font-extrabold',
  adminNav: 'mt-4 flex flex-wrap gap-1 lg:flex-col',
  adminLink:
    'rounded-xl px-3 py-2 text-sm font-semibold text-fg hover:bg-primary-soft',
  adminLinkActive: 'bg-primary text-primary-fg hover:bg-primary',
  adminBack: 'mt-4 inline-flex text-sm font-semibold text-primary',
  adminMain: 'p-4 pb-12 lg:p-8 lg:pb-12',
  adminLoading: 'grid min-h-dvh place-items-center text-muted',
  adminDenied: 'mx-auto max-w-lg p-8',
  adminStatGrid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4',
  adminStat: 'rounded-[1.1rem] border border-border bg-card p-4',
  adminStatValue: 'font-display text-[1.6rem] font-bold',
  adminStatLabel: 'text-[0.85rem] text-muted',
  adminFormGrid: 'grid grid-cols-1 gap-3 lg:grid-cols-2',
  adminTableWrap: 'overflow-x-auto rounded-2xl border border-border bg-card',
  adminTable: 'w-full border-collapse text-[0.9rem]',
  adminTh:
    'border-b border-border px-3.5 py-3 text-left text-[0.75rem] uppercase tracking-wider text-muted',
  adminTd: 'border-b border-border px-3.5 py-3 align-top',
  adminRowActions: 'flex justify-end gap-1.5 whitespace-nowrap',
  adminEmptyInline: 'px-2 py-6 text-center text-muted',
  adminSubhead: 'm-0 text-[0.95rem] font-semibold',
  adminUploadRow: 'flex flex-wrap gap-2',
  adminFileBtn: 'cursor-pointer',
  adminImageGrid: 'grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3',
  adminImageThumb: 'overflow-hidden rounded-xl border border-border bg-bg',
  adminImageThumbCover: 'border-primary',
  adminImageThumbImg: 'aspect-square w-full object-cover',
  adminImageActions: 'flex flex-col gap-1.5 p-1.5',
  adminCoverBadge: 'text-[0.7rem] font-semibold uppercase tracking-wider text-primary',

  placePicker: 'flex flex-col gap-2',
  placePickerHint: 'm-0 text-[0.85rem]',
  placePickerAddress: 'm-0 text-[0.85rem]',
  placePickerFallback: 'min-h-32',
}

export function btn(...variants) {
  return cn(ui.btn, ...variants)
}

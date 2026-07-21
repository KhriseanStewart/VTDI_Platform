import { places } from './outyahData'

const av = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`

/**
 * Curated Instagram-style posts used when no live Instagram token is set.
 * Each post maps to a venue so the map view stays in sync.
 */
export const MOCK_INSTAGRAM_POSTS = [
  {
    id: 'ig-sugarcane-1',
    placeId: 'sugarcane',
    username: 'sugarcane.kingston',
    userAvatar: av('sugarcane'),
    caption:
      'Sunset service on the roof. Jerk lamb + rum punch under the string lights. Book ahead this weekend. #Kingston #OutYah',
    mediaUrl: places.find((p) => p.id === 'sugarcane')?.image,
    mediaType: 'IMAGE',
    permalink: 'https://www.instagram.com/',
    timestamp: '2026-07-18T22:14:00Z',
    likeCount: 842,
    commentsCount: 36,
    comments: [
      {
        id: 'c1',
        username: 'kimberly.eats',
        text: 'Those lamb chops look deadly. Table for 2 Sat?',
        timestamp: '2026-07-18T22:40:00Z',
      },
      {
        id: 'c2',
        username: 'damar_yaad',
        text: 'Rooftop never misses. See unnu later.',
        timestamp: '2026-07-18T23:05:00Z',
      },
      {
        id: 'c3',
        username: 'jade.ja',
        text: 'Is the band still on Fridays?',
        timestamp: '2026-07-19T01:12:00Z',
      },
    ],
  },
  {
    id: 'ig-scotchies-1',
    placeId: 'scotchies',
    username: 'scotchiesjerk',
    userAvatar: av('scotchies'),
    caption:
      'Pit smoke rolling in Drax Hall. Come early — the line moves but the chicken goes fast.',
    mediaUrl: places.find((p) => p.id === 'scotchies')?.image,
    mediaType: 'IMAGE',
    permalink: 'https://www.instagram.com/',
    timestamp: '2026-07-17T16:02:00Z',
    likeCount: 2104,
    commentsCount: 88,
    comments: [
      {
        id: 'c1',
        username: 'mobayfoodie',
        text: 'Best jerk on the north coast, no debate.',
        timestamp: '2026-07-17T16:20:00Z',
      },
      {
        id: 'c2',
        username: 'tour.crew',
        text: 'Grabbing a pound after the falls.',
        timestamp: '2026-07-17T17:01:00Z',
      },
    ],
  },
  {
    id: 'ig-ricks-1',
    placeId: 'ricks',
    username: 'rickscafenegril',
    userAvatar: av('ricks'),
    caption:
      'Cliff jumps, cold Red Stripe, and that Negril sunset. West End magic tonight.',
    mediaUrl: places.find((p) => p.id === 'ricks')?.image,
    mediaType: 'IMAGE',
    permalink: 'https://www.instagram.com/',
    timestamp: '2026-07-16T23:48:00Z',
    likeCount: 5621,
    commentsCount: 214,
    comments: [
      {
        id: 'c1',
        username: 'sunset.chaser',
        text: 'Bucket list every time I land in Negril.',
        timestamp: '2026-07-17T00:10:00Z',
      },
      {
        id: 'c2',
        username: 'andre.g',
        text: 'Careful on the rocks after dark!',
        timestamp: '2026-07-17T00:22:00Z',
      },
    ],
  },
  {
    id: 'ig-dunns-1',
    placeId: 'dunns-river',
    username: 'visitjamaica',
    userAvatar: av('dunns'),
    caption:
      "Climbing Dunn's River with the morning crowd. Wear shoes with grip.",
    mediaUrl: places.find((p) => p.id === 'dunns-river')?.image,
    mediaType: 'IMAGE',
    permalink: 'https://www.instagram.com/',
    timestamp: '2026-07-15T11:30:00Z',
    likeCount: 9802,
    commentsCount: 412,
    comments: [
      {
        id: 'c1',
        username: 'family.trips',
        text: 'Kids loved it. Go early before the cruise ships.',
        timestamp: '2026-07-15T12:05:00Z',
      },
      {
        id: 'c2',
        username: 'ochi.local',
        text: 'Still the one attraction visitors ask for first.',
        timestamp: '2026-07-15T13:40:00Z',
      },
    ],
  },
  {
    id: 'ig-cafeblue-1',
    placeId: 'cafe-blue',
    username: 'cafeblueja',
    userAvatar: av('cafeblue'),
    caption:
      'Blue Mountain mist + a flat white in Irish Town. Slow mornings hit different up here.',
    mediaUrl: places.find((p) => p.id === 'cafe-blue')?.image,
    mediaType: 'IMAGE',
    permalink: 'https://www.instagram.com/',
    timestamp: '2026-07-14T09:18:00Z',
    likeCount: 1266,
    commentsCount: 54,
    comments: [
      {
        id: 'c1',
        username: 'bean.there',
        text: 'Worth the drive from Kingston every time.',
        timestamp: '2026-07-14T09:45:00Z',
      },
    ],
  },
  {
    id: 'ig-doctors-1',
    placeId: 'doctors-cave',
    username: 'doctorscavebeach',
    userAvatar: av('doctors'),
    caption:
      "Doctor's Cave looking glass-clear this morning. MoBay water therapy.",
    mediaUrl: places.find((p) => p.id === 'doctors-cave')?.image,
    mediaType: 'IMAGE',
    permalink: 'https://www.instagram.com/',
    timestamp: '2026-07-13T14:02:00Z',
    likeCount: 3340,
    commentsCount: 97,
    comments: [
      {
        id: 'c1',
        username: 'beachbum.ja',
        text: 'Softest sand on the hip strip.',
        timestamp: '2026-07-13T14:30:00Z',
      },
      {
        id: 'c2',
        username: 'kayla.m',
        text: 'Any chairs left after 11?',
        timestamp: '2026-07-13T15:00:00Z',
      },
    ],
  },
  {
    id: 'ig-pier-1',
    placeId: 'pier-one',
    username: 'pieroneja',
    userAvatar: av('pierone'),
    caption:
      'Waterfront selectors loading up. Pier One Friday energy is unmatched.',
    mediaUrl: places.find((p) => p.id === 'pier-one')?.image,
    mediaType: 'IMAGE',
    permalink: 'https://www.instagram.com/',
    timestamp: '2026-07-12T21:00:00Z',
    likeCount: 1890,
    commentsCount: 73,
    comments: [
      {
        id: 'c1',
        username: 'dancehall.diary',
        text: "Who's on the decks tonight?",
        timestamp: '2026-07-12T21:20:00Z',
      },
    ],
  },
  {
    id: 'ig-sevenmile-1',
    placeId: 'seven-mile',
    username: 'negrilvibes',
    userAvatar: av('sevenmile'),
    caption:
      'Seven Mile stretch forever. Soft sand, cold coconut, no rush.',
    mediaUrl: places.find((p) => p.id === 'seven-mile')?.image,
    mediaType: 'IMAGE',
    permalink: 'https://www.instagram.com/',
    timestamp: '2026-07-11T17:44:00Z',
    likeCount: 4512,
    commentsCount: 156,
    comments: [
      {
        id: 'c1',
        username: 'travel.twin',
        text: 'This photo sold me on Negril.',
        timestamp: '2026-07-11T18:02:00Z',
      },
    ],
  },
]

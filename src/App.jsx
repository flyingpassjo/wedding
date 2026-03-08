import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { useScroll } from './hooks/useScroll'

const BASE_PATH = import.meta.env.BASE_URL ?? '/'
const withBase = (path) => `${BASE_PATH}${String(path || '').replace(/^\/+/, '')}`

const WEB_APP_URL =
  import.meta.env.VITE_GAS_WEB_APP_URL ??
  'https://script.google.com/macros/s/AKfycbw6hwsbS1sQBJ7m0hB6-c2_F9KbzAFJHWHZTE6-T4N2pjXIG8OpByl4YQ_2Vkrddlz-/exec'

const GOOGLE_SHEET_URL =
  import.meta.env.VITE_RSVP_SHEET_URL ??
  'https://docs.google.com/spreadsheets/d/1zPbH8RcBarPho4miI6BY5wBOpiBb3r6CF77wwvl0ii0/edit'

const DRIVE_FOLDER_URL =
  import.meta.env.VITE_PHOTO_UPLOAD_FOLDER_URL ??
  'https://drive.google.com/drive/u/0/folders/1PlTvn5v_1mho2c-tc5IYg7aLiIE9qlU1'

const OPENING_IMAGE = withBase('images/wedding-start.jepg')
const MAIN_BANNER_IMAGE = withBase('images/wedding-sub.jepg')
const WEDDING_AT = '2026-10-17T18:00:00+09:00'
const SNAP_UPLOAD_START = '2026-10-17T17:00:00+09:00'
const SNAP_UPLOAD_START_LABEL = '2026-10-17 17:00부터'
const RSVP_HIDE_UNTIL_KEY = 'wedding_rsvp_hide_until'
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const WEDDING_CALENDAR = {
  year: 2026,
  month: 10,
  day: 17,
  dateStamp: '2026.10.17',
  timeStamp: '토요일 오후 6시',
}

const SNAP_COLLAGE_IMAGES = {
  left: withBase('images/snap-collage-left.jpg'),
  center: withBase('images/snap-collage-center.jpg'),
  right: withBase('images/snap-collage-right.jpg'),
}

const wedding = {
  groom: '윤원태',
  bride: '조영서',
  groomParents: '윤상열 · 정미옥',
  brideParents: '조현철 · 강명희',
  dateLabel: '2026년 10월 17일 토요일',
  timeLabel: '오후 6시',
  place: '기장 루모스가든',
  address: '부산광역시 기장군 기장읍 기장해안로 377',
  phoneDisplay: '051-722-0727',
  phoneLink: '0517220727',
  groomPhone: '010-9353-8258',
  bridePhone: '010-3981-1188',
  greeting: [
    '서로의 계절이 되어 평생을 함께 걷고자 합니다.',
    '귀한 걸음으로 오셔서 두 사람의 시작을 축복해 주세요.',
  ],
}

const timeline = [
  { time: '17:00', title: '입장 가능' },
  { time: '18:00', title: '예식 시작' },
  { time: '18:00 ~ 19:00', title: '1부 예식' },
  { time: '19:00 ~ 21:00', title: '2부 예식' },
]

const noticeList = [
  '입장은 오후 5시부터 예식은 오후 6시에 시작합니다.',
  '부산역 셔틀버스 노선은 김해공항 → 부산역 → 기장 루모스가든이며, 이용은 개별 연락으로 안내드립니다.',
]

const transportSections = [
  {
    title: '대중교통',
    items: [
      '100번, 181번(기차여행 정류장 하차)과 1001번(동암후문 정류장 하차) 버스 이용 가능',
      '181번: 센텀시티역·벡스코 탑승(정류장번호 09136) → 기차여행 정류장 하차 (도보 1분)',
      '부산역: 1001번 탑승 → 동암후문 정류장 하차 → 100/181번 환승 → 기차여행 정류장 하차 (도보 1분)',
      '100번: 동래시장 탑승(정류장번호 06712) → 기차여행 정류장 하차 (도보 1분)',
    ],
  },
  {
    title: '자가용',
    items: [
      '[일반도로1] 송정터널 → 부산국제외국인학교 → 연화터널 → 루모스가든',
      '[일반도로2] 석대(반여)화훼단지 → 기장동원로얄CC → 기장초등학교 → 연화터널 → 루모스가든',
      '[고속도로] 동부산TG → 용궁사 → 반얀트리 리조트 바로앞 → 루모스가든',
    ],
  },
  {
    title: '공항 리무진',
    items: [
      '김해공항 1층 3번 탑승장 → 공항리무진1(해운대/기장행) → 반얀트리 해운대 하차(종점) 바로 앞',
    ],
  },
]

const airportLimousineStops = [
  { toAirport: '반얀트리해운대부산(기차여행)', fromAirport: '국제선' },
  { toAirport: '동암후문(아난티코브)', fromAirport: '국내선' },
  { toAirport: '동부산관광단지(오시리아테마파크)', fromAirport: '더비치푸르지오써밋' },
  { toAirport: '장산역 14번 출구', fromAirport: '신세계센텀시티' },
  { toAirport: '해운대온천사거리', fromAirport: '벡스코' },
  { toAirport: '해운대해수욕장', fromAirport: '요트경기장' },
  { toAirport: '동백섬 입구', fromAirport: '파크하얏트부산' },
  { toAirport: '한화리조트해운대', fromAirport: '한화리조트해운대' },
  { toAirport: '파크하얏트부산', fromAirport: '동백섬 입구' },
  { toAirport: '요트경기장', fromAirport: '해운대해수욕장' },
  { toAirport: '벡스코', fromAirport: '해운대온천사거리' },
  { toAirport: '신세계센텀시티', fromAirport: '장산역 5번 출구' },
  { toAirport: '상수도남부사업소', fromAirport: '동부산관광단지(한화마티에)' },
  { toAirport: '국제선', fromAirport: '동암후문(아난티코브)' },
  { toAirport: '국내선', fromAirport: '반얀트리해운대부산(기차여행)' },
]

const parkingGuide = [
  {
    order: 1,
    title: '드라이브 오시리아 주차장 (셔틀버스 운영)',
    address: '부산광역시 기장군 기장읍 기장해안로 298 (드라이브 오시리아 주차장)',
    note: '오시리아 주차장에 주차 후 셔틀버스로 이동해 주세요.',
  },
]

const shuttleGuide = [
  {
    order: 1,
    route: '드라이브 오시리아 주차장 입구 → 루모스가든',
    detail: '예식 2시간 전부터 상시 운행합니다.',
  },
  {
    order: 2,
    route: '부산역 셔틀버스 노선: 김해공항 → 부산역 → 기장 루모스가든',
    detail: '부산역 셔틀버스는 이용 예정 하객께 개별 연락드립니다.',
  },
]

const accounts = [
  { side: '신부 측', bank: '토스', number: '1000-3369-0452', holder: '조영서' },
  { side: '신랑 측', bank: '카카오뱅크', number: '3333-09-2110347', holder: '윤원태' },
]

const RSVP_INITIAL = {
  attendance: '참석',
  side: 'bride',
  name: '',
  phone: '',
  companions: '0',
  airportShuttleCount: '0',
  busanStationShuttleCount: '0',
  shuttleCount: '0',
  meal: '식사 가능',
  shuttleChoice: '미이용',
  memo: '',
  agreePrivacy: false,
}

const GUEST_CATEGORY_ITEMS = [
  { id: 'rsvp', label: '회신', mobileLabel: '회신' },
  { id: 'contact', label: '연락/계좌', mobileLabel: '연락/계좌' },
  { id: 'ceremony', label: '예식', mobileLabel: '예식' },
  { id: 'location', label: '오시는길', mobileLabel: '오시는길' },
  { id: 'snap', label: '이벤트', mobileLabel: '이벤트' },
]

function buildCalendarCells(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = Array.from({ length: firstDay }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  return cells
}

function getCountdownParts(targetISO) {
  const diff = new Date(targetISO).getTime() - Date.now()
  const safeMs = Math.max(0, diff)

  const totalSeconds = Math.floor(safeMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

function getInitialScreen() {
  return window.location.hash === '#/admin' ? 'admin' : 'guest'
}

function getOrCreateVisitorId() {
  const storageKey = 'wedding_visitor_id'
  const existing = localStorage.getItem(storageKey)
  if (existing) return existing

  const id = `v_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
  localStorage.setItem(storageKey, id)
  return id
}

function isAppsScriptErrorPage(text, methodName) {
  if (!text) return false
  if (!text.includes('<title>오류</title>')) return false
  if (!text.includes('Google Apps Script')) return false
  return text.includes(`함수(${methodName})`) || text.includes(`function(${methodName})`)
}

async function postToWebApp(payload, options = {}) {
  const allowNoCorsFallback = Boolean(options.allowNoCorsFallback)
  const body = JSON.stringify(payload)

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    })

    const text = await response.text()
    let data = null

    if (isAppsScriptErrorPage(text, 'doPost')) {
      throw new Error('MISSING_DO_POST')
    }

    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }

    if (!response.ok) {
      throw new Error('HTTP_ERROR')
    }

    return { ok: true, data, mode: 'cors' }
  } catch (error) {
    if (error instanceof Error && error.message === 'MISSING_DO_POST') {
      throw error
    }

    if (allowNoCorsFallback) {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
      })
      return { ok: true, data: null, mode: 'no-cors' }
    }

    throw error
  }
}

async function fetchFromWebApp(action) {
  const url = `${WEB_APP_URL}?action=${encodeURIComponent(action)}`
  const response = await fetch(url)
  const text = await response.text()

  if (isAppsScriptErrorPage(text, 'doGet')) {
    throw new Error('MISSING_DO_GET')
  }

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

function normalizeRows(input) {
  if (!input) return []
  if (Array.isArray(input)) return input
  if (Array.isArray(input.items)) return input.items
  if (Array.isArray(input.rows)) return input.rows
  if (Array.isArray(input.data)) return input.data
  return []
}

function formatPhoneInput(raw) {
  const digits = String(raw ?? '')
    .replace(/\D/g, '')
    .slice(0, 11)

  if (!digits) return ''

  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function parseCount(value) {
  return Number(String(value ?? '0').replace(/[^0-9]/g, '') || 0)
}

function computeSummary(rows) {
  const summary = {
    total: 0,
    attend: 0,
    decline: 0,
    companions: 0,
    shuttle: 0,
    airportShuttle: 0,
    busanStationShuttle: 0,
    groomAttendPeople: 0,
    brideAttendPeople: 0,
    unknownAttendPeople: 0,
    attendPeopleTotal: 0,
  }

  rows.forEach((row) => {
    const attendance = String(row.attendance ?? row.status ?? '').trim()
    if (!attendance) return

    summary.total += 1

    if (attendance.includes('참석')) summary.attend += 1
    if (attendance.includes('불참')) summary.decline += 1

    const companions = parseCount(row.companions ?? row.guests ?? '0')
    const airportShuttle = parseCount(row.airportShuttleCount ?? row.shuttleAirportCount)
    const busanStationShuttle = parseCount(row.busanStationShuttleCount ?? row.shuttleBusanCount)
    const derivedShuttle = airportShuttle + busanStationShuttle
    const shuttleRaw = parseCount(row.shuttleCount ?? row.shuttle ?? '0')
    const shuttle = shuttleRaw > 0 ? shuttleRaw : derivedShuttle

    summary.companions += companions
    summary.shuttle += shuttle
    summary.airportShuttle += airportShuttle
    summary.busanStationShuttle += busanStationShuttle

    if (attendance.includes('참석')) {
      const attendPeople = companions + 1
      const rawSide = String(row.side ?? '').trim().toLowerCase()

      summary.attendPeopleTotal += attendPeople

      if (rawSide === 'groom' || rawSide.includes('신랑')) {
        summary.groomAttendPeople += attendPeople
      } else if (rawSide === 'bride' || rawSide.includes('신부')) {
        summary.brideAttendPeople += attendPeople
      } else {
        summary.unknownAttendPeople += attendPeople
      }
    }
  })

  return summary
}

function normalizeVisitStats(input) {
  const raw = input?.stats ?? input ?? {}

  return {
    totalViews: Number(raw.totalViews ?? raw.total_views ?? 0),
    uniqueVisitors: Number(raw.uniqueVisitors ?? raw.unique_visitors ?? 0),
    todayViews: Number(raw.todayViews ?? raw.today_views ?? 0),
  }
}

function toXlsxDownloadUrl(sheetUrl) {
  const cleanUrl = String(sheetUrl || '').split('?')[0]
  return cleanUrl.replace(/\/edit$/, '/export?format=xlsx')
}

function formatDateTime(value, includeYear = false) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString('ko-KR', {
    ...(includeYear ? { year: 'numeric' } : {}),
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatSideLabel(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return '-'
  if (raw === 'groom') return '신랑측'
  if (raw === 'bride') return '신부측'
  if (raw.includes('신랑')) return '신랑측'
  if (raw.includes('신부')) return '신부측'
  return raw
}

function InviteSectionTitle({ kicker, title }) {
  return (
    <header className="invite-section-head">
      <p>{kicker}</p>
      <h3 className="section-title">{title}</h3>
    </header>
  )
}

function App() {
  const [screen, setScreen] = useState(getInitialScreen)
  const [toast, setToast] = useState('')
  const [mapBroken, setMapBroken] = useState(false)
  const [openingImageBroken, setOpeningImageBroken] = useState(false)
  const [coverImageBroken, setCoverImageBroken] = useState(false)
  const [showOpening, setShowOpening] = useState(() => getInitialScreen() === 'guest')
  const [openingFade, setOpeningFade] = useState(false)
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [hasAutoOpenedRsvp, setHasAutoOpenedRsvp] = useState(false)
  const [rsvpView, setRsvpView] = useState('intro')

  const [rsvp, setRsvp] = useState(RSVP_INITIAL)

  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false)

  const [adminLoading, setAdminLoading] = useState(false)
  const [adminRows, setAdminRows] = useState([])
  const [adminPhotos, setAdminPhotos] = useState([])
  const [adminError, setAdminError] = useState('')
  const [adminUpdatedAt, setAdminUpdatedAt] = useState('')
  const [isParticleEnabled, setIsParticleEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('wedding_particle_enabled')
    if (saved == null) return true
    return saved === '1'
  })
  const [activeCategory, setActiveCategory] = useState(GUEST_CATEGORY_ITEMS[0].id)
  const [jumpHighlightId, setJumpHighlightId] = useState('')
  const [copiedKey, setCopiedKey] = useState('')
  const [visitStats, setVisitStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    todayViews: 0,
  })
  const [countdown, setCountdown] = useState(() => getCountdownParts(WEDDING_AT))

  const categoryBarRef = useRef(null)
  const rsvpSectionRef = useRef(null)
  const contactSectionRef = useRef(null)
  const ceremonySectionRef = useRef(null)
  const locationSectionRef = useRef(null)
  const snapSectionRef = useRef(null)

  const sectionRefs = useMemo(
    () => ({
      rsvp: rsvpSectionRef,
      contact: contactSectionRef,
      ceremony: ceremonySectionRef,
      location: locationSectionRef,
      snap: snapSectionRef,
    }),
    [],
  )

  const scroll = useScroll()

  const adminSummary = useMemo(() => computeSummary(adminRows), [adminRows])
  const adminAttendRate = useMemo(() => {
    if (adminSummary.total === 0) return 0
    return Math.round((adminSummary.attend / adminSummary.total) * 100)
  }, [adminSummary])
  const adminShuttleRate = useMemo(() => {
    if (adminSummary.attend === 0) return 0
    return Math.round((adminSummary.shuttle / adminSummary.attend) * 100)
  }, [adminSummary])
  const sheetXlsxUrl = useMemo(() => toXlsxDownloadUrl(GOOGLE_SHEET_URL), [])
  const contactAccountCards = useMemo(
    () => [
      {
        key: 'groom',
        sideLabel: '신랑측',
        lineage: `${wedding.groomParents}의 아들`,
        name: wedding.groom,
        phone: wedding.groomPhone,
        account: accounts.find((item) => item.side === '신랑 측'),
      },
      {
        key: 'bride',
        sideLabel: '신부측',
        lineage: `${wedding.brideParents}의 딸`,
        name: wedding.bride,
        phone: wedding.bridePhone,
        account: accounts.find((item) => item.side === '신부 측'),
      },
    ],
    [],
  )
  const snapUploadUrl = useMemo(() => {
    if (typeof window === 'undefined') return withBase('snap.html')
    return `${window.location.origin}${withBase('snap.html')}`
  }, [])
  const mapLinks = useMemo(() => {
    const query = encodeURIComponent('부산광역시 기장군 기장읍 기장해안로 377')
    return {
      naver: `https://map.naver.com/v5/search/${query}`,
      kakao: `https://map.kakao.com/link/search/${query}`,
      google: `https://www.google.com/maps/search/?api=1&query=${query}`,
    }
  }, [])
  const parkingMapLinks = useMemo(() => {
    const query = encodeURIComponent('부산 기장군 기장해안로 298')
    return {
      naver: `https://map.naver.com/v5/search/${query}`,
      kakao: `https://map.kakao.com/link/search/${query}`,
    }
  }, [])
  const isWeddingSnapOpen = useMemo(() => {
    return Date.now() >= new Date(SNAP_UPLOAD_START).getTime()
  }, [])
  const weddingCalendarCells = useMemo(
    () => buildCalendarCells(WEDDING_CALENDAR.year, WEDDING_CALENDAR.month),
    [],
  )
  const particleItems = useMemo(
    () =>
      Array.from({ length: 18 }, (_, idx) => ({
        id: idx + 1,
        left: 4 + ((idx * 17) % 92),
        size: 2.5 + (idx % 4) * 1.2,
        duration: 9 + (idx % 6) * 1.6,
        delay: -1 * (idx % 7),
        drift: (idx % 2 === 0 ? 1 : -1) * (8 + (idx % 5) * 3),
        opacity: 0.2 + (idx % 5) * 0.12,
      })),
    [],
  )
  const isGuestScreen = screen === 'guest'
  const isAttending = rsvp.attendance === '참석'
  const coverParallaxY = isGuestScreen ? Math.min(scroll.y * 0.11, 56) : 0
  const showScrollTop = isGuestScreen && scroll.y > 280
  const progressScale = isGuestScreen ? scroll.progressY : 0

  useEffect(() => {
    const onHashChange = () => {
      setScreen(getInitialScreen())
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 2000)
    return () => clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (!copiedKey) return undefined
    const timeout = setTimeout(() => setCopiedKey(''), 1400)
    return () => clearTimeout(timeout)
  }, [copiedKey])

  useEffect(() => {
    const tick = () => setCountdown(getCountdownParts(WEDDING_AT))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isRsvpModalOpen && !isContactModalOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsRsvpModalOpen(false)
        setIsContactModalOpen(false)
        setRsvpView('intro')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [isRsvpModalOpen, isContactModalOpen])

  useEffect(() => {
    if (!showOpening) return undefined

    const fadeTimer = setTimeout(() => setOpeningFade(true), 2300)
    const removeTimer = setTimeout(() => setShowOpening(false), 3000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [showOpening])

  useEffect(() => {
    if (screen !== 'guest' || showOpening || hasAutoOpenedRsvp || isRsvpModalOpen || isContactModalOpen) return undefined

    const hideUntil = Number(localStorage.getItem(RSVP_HIDE_UNTIL_KEY) ?? 0)
    if (hideUntil > Date.now()) {
      setHasAutoOpenedRsvp(true)
      return undefined
    }

    const timer = setTimeout(() => {
      setIsRsvpModalOpen(true)
      setRsvpView('intro')
      setHasAutoOpenedRsvp(true)
    }, 220)

    return () => clearTimeout(timer)
  }, [screen, showOpening, hasAutoOpenedRsvp, isRsvpModalOpen, isContactModalOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('wedding_particle_enabled', isParticleEnabled ? '1' : '0')
  }, [isParticleEnabled])

  useEffect(() => {
    if (!isGuestScreen || showOpening) return undefined

    const sections = Array.from(document.querySelectorAll('.guest-page .reveal-item'))
    if (sections.length === 0) return undefined

    if (!('IntersectionObserver' in window)) {
      sections.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    sections.forEach((section) => {
      section.classList.add('reveal-prep')
      if (!section.classList.contains('is-visible')) {
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [isGuestScreen, showOpening])

  useEffect(() => {
    if (screen !== 'guest') return

    const visitorId = getOrCreateVisitorId()
    const payload = {
      type: 'VISIT',
      source: 'INVITATION',
      timestamp: new Date().toISOString(),
      page: 'guest',
      visitorId,
      userAgent: navigator.userAgent,
      referrer: document.referrer || '',
    }

    postToWebApp(payload, { allowNoCorsFallback: true }).catch(() => undefined)
  }, [screen])

  const onRsvpFieldChange = (key) => (event) => {
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value

    if (key === 'phone') {
      value = formatPhoneInput(value)
    }

    setRsvp((prev) => {
      if (key === 'shuttleChoice') {
        const currentAirport = parseCount(prev.airportShuttleCount)
        const currentBusan = parseCount(prev.busanStationShuttleCount)
        if (value === '부산역 셔틀 이용' && currentAirport + currentBusan === 0) {
          return {
            ...prev,
            shuttleChoice: value,
            airportShuttleCount: '0',
            busanStationShuttleCount: '1',
            shuttleCount: '1',
          }
        }
        if (value === '부산역 셔틀 이용') {
          return {
            ...prev,
            shuttleChoice: value,
            shuttleCount: String(currentAirport + currentBusan),
          }
        }
        if (value === '미이용') {
          return {
            ...prev,
            shuttleChoice: value,
            airportShuttleCount: '0',
            busanStationShuttleCount: '0',
            shuttleCount: '0',
          }
        }
      }

      if (key !== 'attendance') {
        return { ...prev, [key]: value }
      }

      if (value === '불참') {
        return {
          ...prev,
          attendance: value,
          companions: '0',
          airportShuttleCount: '0',
          busanStationShuttleCount: '0',
          shuttleCount: '0',
          meal: '식사 불가 · 답례품 수령',
          shuttleChoice: '미이용',
        }
      }

      return { ...prev, attendance: value }
    })
  }

  const onCopy = async (value, label, flashKey = '') => {
    try {
      await navigator.clipboard.writeText(value)
      setToast(`${label} 정보를 복사했습니다.`)
      if (flashKey) setCopiedKey(flashKey)
    } catch {
      setToast('복사에 실패했습니다. 길게 눌러 수동 복사해 주세요.')
    }
  }

  const openRsvpModal = (view = 'form') => {
    setIsContactModalOpen(false)
    setIsRsvpModalOpen(true)
    setRsvpView(view)
  }

  const closeRsvpModal = () => {
    setIsRsvpModalOpen(false)
    setRsvpView('intro')
  }

  const openContactModal = () => {
    setIsRsvpModalOpen(false)
    setIsContactModalOpen(true)
  }

  const closeContactModal = () => {
    setIsContactModalOpen(false)
  }

  const hideRsvpForToday = () => {
    const until = new Date()
    until.setHours(23, 59, 59, 999)
    localStorage.setItem(RSVP_HIDE_UNTIL_KEY, String(until.getTime()))
    closeRsvpModal()
  }

  const adjustRsvpCount = (key, diff) => {
    setRsvp((prev) => {
      const current = parseCount(prev[key])
      const next = Math.max(0, Math.min(20, current + diff))

      if (key === 'airportShuttleCount' || key === 'busanStationShuttleCount') {
        const airport = key === 'airportShuttleCount' ? next : parseCount(prev.airportShuttleCount)
        const busan = key === 'busanStationShuttleCount' ? next : parseCount(prev.busanStationShuttleCount)
        const shuttleTotal = airport + busan
        return {
          ...prev,
          [key]: String(next),
          shuttleCount: String(shuttleTotal),
          shuttleChoice: shuttleTotal > 0 ? '부산역 셔틀 이용' : '미이용',
        }
      }

      return { ...prev, [key]: String(next) }
    })
  }

  const submitRsvp = async (event) => {
    event.preventDefault()

    if (!rsvp.name.trim()) {
      setToast('성함을 입력해 주세요.')
      return
    }

    if (!rsvp.phone.trim()) {
      setToast('연락처를 입력해 주세요.')
      return
    }

    if (!rsvp.agreePrivacy) {
      setToast('개인정보 수집 및 이용 동의가 필요합니다.')
      return
    }

    setIsRsvpSubmitting(true)

    try {
      const airportShuttleCount =
        isAttending && rsvp.shuttleChoice === '부산역 셔틀 이용' ? rsvp.airportShuttleCount : '0'
      const busanStationShuttleCount =
        isAttending && rsvp.shuttleChoice === '부산역 셔틀 이용' ? rsvp.busanStationShuttleCount : '0'
      const shuttleCount = String(parseCount(airportShuttleCount) + parseCount(busanStationShuttleCount))

      const payload = {
        type: 'RSVP',
        timestamp: new Date().toISOString(),
        attendance: rsvp.attendance,
        name: rsvp.name.trim(),
        phone: rsvp.phone.trim(),
        companions: isAttending ? rsvp.companions : '0',
        airportShuttleCount,
        busanStationShuttleCount,
        shuttleCount,
        side: rsvp.side,
        meal: isAttending ? rsvp.meal : '식사 불가 · 답례품 수령',
        shuttleChoice: isAttending ? rsvp.shuttleChoice : '미이용',
        memo: rsvp.memo.trim(),
        sheetUrl: GOOGLE_SHEET_URL,
      }

      await postToWebApp(payload)
      setToast('회신이 접수되었습니다. 감사합니다.')
      setRsvp(RSVP_INITIAL)
      closeRsvpModal()
    } catch (error) {
      if (error instanceof Error && error.message === 'MISSING_DO_POST') {
        setToast('웹앱에 doPost 함수가 없어 저장할 수 없습니다. Apps Script를 먼저 배포해 주세요.')
      } else {
        setToast('웹앱 연동에 실패했습니다. 최신 배포와 권한(모든 사용자)을 확인해 주세요.')
      }
    } finally {
      setIsRsvpSubmitting(false)
    }
  }

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true)
    setAdminError('')

    try {
      const [rsvpData, photoData, visitData] = await Promise.all([
        fetchFromWebApp('rsvp_list'),
        fetchFromWebApp('photo_list'),
        fetchFromWebApp('visit_stats'),
      ])

      const rsvpRows = normalizeRows(rsvpData)
      const photoRows = normalizeRows(photoData)
      const stats = normalizeVisitStats(visitData)

      setAdminRows(rsvpRows)
      setAdminPhotos(photoRows)
      setVisitStats(stats)
      setAdminUpdatedAt(new Date().toISOString())
    } catch (error) {
      if (error instanceof Error && error.message === 'MISSING_DO_GET') {
        setAdminError('웹앱에 doGet 함수가 없어 조회할 수 없습니다. Apps Script 조회 함수를 추가해 주세요.')
      } else {
        setAdminError('관리자 데이터를 불러오지 못했습니다. 웹앱 최신 배포(doGet/doPost 포함)와 권한(모든 사용자)을 확인해 주세요.')
      }
    } finally {
      setAdminLoading(false)
    }
  }, [])

  useEffect(() => {
    if (screen !== 'admin') return
    if (adminLoading) return
    if (adminUpdatedAt || adminError) return
    if (adminRows.length > 0 || adminPhotos.length > 0) return
    loadAdminData()
  }, [screen, adminLoading, adminRows.length, adminPhotos.length, adminUpdatedAt, adminError, loadAdminData])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToCategory = (id) => {
    setJumpHighlightId(id)

    const target = sectionRefs[id]?.current
    if (!target) return

    const barHeight = categoryBarRef.current?.offsetHeight ?? 0
    const top = target.getBoundingClientRect().top + window.scrollY - (barHeight + 20)

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (!isGuestScreen) return

    const barHeight = categoryBarRef.current?.offsetHeight ?? 0
    const offset = barHeight + 24
    let next = GUEST_CATEGORY_ITEMS[0].id

    GUEST_CATEGORY_ITEMS.forEach((item) => {
      const node = sectionRefs[item.id]?.current
      if (!node) return
      const top = node.getBoundingClientRect().top - offset
      if (top <= 0) next = item.id
    })

    setActiveCategory((prev) => (prev === next ? prev : next))
  }, [isGuestScreen, scroll.y, sectionRefs])

  useEffect(() => {
    if (!jumpHighlightId) return undefined
    const timer = setTimeout(() => setJumpHighlightId(''), 4000)
    return () => clearTimeout(timer)
  }, [jumpHighlightId])

  return (
    <div className={`app-shell screen-${screen}`}>
      <div className="scroll-progress" aria-hidden={screen !== 'guest'}>
        <span className="scroll-progress-fill" style={{ transform: `scaleX(${progressScale})` }} />
      </div>

      {isGuestScreen && !showOpening && isParticleEnabled ? (
        <div className="particle-layer" aria-hidden="true">
          {particleItems.map((item) => (
            <span
              key={item.id}
              className="particle-dot"
              style={{
                '--particle-left': `${item.left}%`,
                '--particle-size': `${item.size}px`,
                '--particle-duration': `${item.duration}s`,
                '--particle-delay': `${item.delay}s`,
                '--particle-drift': `${item.drift}px`,
                '--particle-opacity': `${item.opacity}`,
              }}
            />
          ))}
        </div>
      ) : null}

      {showOpening ? (
        <div className={`opening-splash ${openingFade ? 'fade-out' : ''}`}>
          {!openingImageBroken ? (
            <img
              src={OPENING_IMAGE}
              alt="청첩장 오프닝 이미지"
              className="opening-image"
              onError={() => setOpeningImageBroken(true)}
            />
          ) : (
            <div className="opening-fallback" />
          )}
          <div className="opening-dim" />
          <div className="opening-copy">
            <p>WEDDING INVITATION</p>
            <h2>
              {wedding.groom} & {wedding.bride}
            </h2>
          </div>
          <button type="button" className="opening-skip" onClick={() => setShowOpening(false)}>
            건너뛰기
          </button>
        </div>
      ) : null}

      {screen === 'guest' ? (
        <>
          {!showOpening ? (
            <nav className="guest-category-bar" ref={categoryBarRef} aria-label="청첩장 섹션 바로가기">
              <div className="guest-category-scroll">
                {GUEST_CATEGORY_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`guest-category-btn ${activeCategory === item.id ? 'active' : ''}`}
                    onClick={() => scrollToCategory(item.id)}
                    aria-label={item.label}
                  >
                    <span className="full-label">{item.label}</span>
                    <span className="mobile-label">{item.mobileLabel}</span>
                  </button>
                ))}
              </div>
            </nav>
          ) : null}

          <main className="page-container guest-page">
          <section className="invite-cover reveal-item" style={{ '--reveal-delay': '0ms' }}>
            {!coverImageBroken ? (
              <img
                src={MAIN_BANNER_IMAGE}
                alt="청첩장 메인 배너 이미지"
                className="invite-cover-image parallax-enabled"
                style={{ transform: `translate3d(0, ${coverParallaxY}px, 0) scale(1.08)` }}
                onError={() => setCoverImageBroken(true)}
              />
            ) : (
              <div className="invite-cover-fallback" />
            )}
            <div className="invite-cover-overlay" />
            <div className="invite-hero-top">
              <p className="invite-eyebrow">WEDDING INVITATION</p>
              <h2 className="invite-title">
                {wedding.groom} & {wedding.bride}
              </h2>
              <p className="invite-date">
                {wedding.dateLabel} {wedding.timeLabel}
              </p>
              <p className="invite-venue">{wedding.place}</p>
            </div>
            <div className="invite-hero-bottom">
              <p className="invite-hero-message">소중한 분들을 초대합니다</p>
              <div className="invite-cover-greeting">
                {wedding.greeting.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <p className="family-line">{wedding.groomParents}의 아들 {wedding.groom}</p>
              <p className="family-line">{wedding.brideParents}의 딸 {wedding.bride}</p>
              <p className="family-sign">{wedding.groom} · {wedding.bride} 올림</p>
              <button type="button" className="cover-contact-open-btn" onClick={openContactModal}>
                연락처 · 마음 전하실 곳
              </button>
            </div>
          </section>

          <section className="card invite-card calendar-count-card reveal-item" style={{ '--reveal-delay': '70ms' }}>
            <div className="calendar-count-head">
              <p>{WEDDING_CALENDAR.dateStamp}</p>
              <span>{WEDDING_CALENDAR.timeStamp}</span>
            </div>

            <div className="wedding-calendar-grid">
              {WEEKDAY_LABELS.map((label, idx) => (
                <div key={label} className={`weekday ${idx === 0 ? 'sun' : idx === 6 ? 'sat' : ''}`}>
                  {label}
                </div>
              ))}

              {weddingCalendarCells.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="day-cell empty" />
                }

                const isSunday = idx % 7 === 0
                const isWeddingDay = day === WEDDING_CALENDAR.day
                return (
                  <div key={`day-${day}`} className={`day-cell ${isSunday ? 'sun' : ''} ${isWeddingDay ? 'target' : ''}`}>
                    <span>{day}</span>
                  </div>
                )
              })}
            </div>

            <div className="countdown-panel">
              <div>
                <span>DAYS</span>
                <strong>{countdown.days}</strong>
              </div>
              <i>:</i>
              <div>
                <span>HOUR</span>
                <strong>{String(countdown.hours).padStart(2, '0')}</strong>
              </div>
              <i>:</i>
              <div>
                <span>MIN</span>
                <strong>{String(countdown.minutes).padStart(2, '0')}</strong>
              </div>
              <i>:</i>
              <div>
                <span>SEC</span>
                <strong>{String(countdown.seconds).padStart(2, '0')}</strong>
              </div>
            </div>
            <p className="countdown-note">
              {wedding.groom}, {wedding.bride}의 결혼식이 <strong>{countdown.days}일</strong> 남았습니다.
            </p>
          </section>

          <section
            className={`card invite-card reveal-item ${activeCategory === 'rsvp' || jumpHighlightId === 'rsvp' ? 'section-jump-focus' : ''} ${jumpHighlightId === 'rsvp' ? 'section-click-ring' : ''}`}
            ref={rsvpSectionRef}
            style={{ '--reveal-delay': '140ms' }}
          >
            <InviteSectionTitle kicker="RESPONSE" title="참석 여부 회신 · 안내 말씀" />
            <p className="rsvp-highlight">
              특별한 날 축하하는 마음으로
              <br />
              참석해 주시는 모든 분들에게 한 분 한 분
              <br />
              마음을 담아 귀하게 모실 수 있도록,
              <br />
              하단의 버튼을 클릭하여
              <br />
              참석 여부 전달을 꼭 부탁드립니다.
            </p>
            <ul className="notice-list">
              {noticeList.map((item, idx) => (
                <li key={`${item}-${idx}`}>{item}</li>
              ))}
            </ul>
            <button type="button" className="btn btn-primary rsvp-open-btn" onClick={() => openRsvpModal('form')}>
              참석 여부 전달하기
            </button>
          </section>

          <section
            className={`card invite-card reveal-item ${activeCategory === 'ceremony' || jumpHighlightId === 'ceremony' ? 'section-jump-focus' : ''} ${jumpHighlightId === 'ceremony' ? 'section-click-ring' : ''}`}
            ref={ceremonySectionRef}
            style={{ '--reveal-delay': '280ms' }}
          >
            <InviteSectionTitle kicker="INFORMATION" title="예식 정보 · 예식 순서" />
            <dl className="essential-list">
              <div>
                <dt>일시</dt>
                <dd>{wedding.dateLabel} {wedding.timeLabel}</dd>
              </div>
              <div>
                <dt>장소</dt>
                <dd>{wedding.place}</dd>
              </div>
              <div>
                <dt>주소</dt>
                <dd>{wedding.address}</dd>
              </div>
              <div>
                <dt>문의</dt>
                <dd>{wedding.phoneDisplay}</dd>
              </div>
            </dl>
            <div className="button-row">
              <a className="btn btn-line" href={`tel:${wedding.phoneLink}`}>
                예식장 전화
              </a>
              <a className="btn btn-line" href={mapLinks.naver} target="_blank" rel="noreferrer">
                네이버지도
              </a>
            </div>
            <p className="sub-section-label">예식 순서</p>
            <ul className="timeline-list">
              {timeline.map((item) => (
                <li key={item.time}>
                  <span>{item.time}</span>
                  <strong>{item.title}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={`card invite-card reveal-item ${activeCategory === 'location' || jumpHighlightId === 'location' ? 'section-jump-focus' : ''} ${jumpHighlightId === 'location' ? 'section-click-ring' : ''}`}
            ref={locationSectionRef}
            style={{ '--reveal-delay': '350ms' }}
          >
            <InviteSectionTitle kicker="LOCATION" title="오시는 길 · 주차 및 셔틀 안내" />
            <div className="map-frame">
              {!mapBroken ? (
                <img
                  src={withBase('venue-map.png')}
                  alt={`${wedding.place} 약도`}
                  className="map-image"
                  onError={() => setMapBroken(true)}
                />
              ) : (
                <div className="map-fallback">`public/venue-map.png` 파일을 추가하면 약도가 표시됩니다.</div>
              )}
            </div>
            <div className="button-row three">
              <a className="btn btn-line" href={mapLinks.naver} target="_blank" rel="noreferrer">
                네이버지도
              </a>
              <a className="btn btn-line" href={mapLinks.kakao} target="_blank" rel="noreferrer">
                카카오맵
              </a>
              <a className="btn btn-line" href={mapLinks.google} target="_blank" rel="noreferrer">
                구글지도
              </a>
            </div>
            <p className="sub-section-label">교통 안내</p>
            <div className="transport-groups">
              {transportSections.map((group) => (
                <article key={group.title} className="transport-group">
                  <p className="transport-group-title">{group.title}</p>
                  <ul className="transport-list">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {group.title === '공항 리무진' ? (
                    <details className="stop-guide-card stop-guide-collapse stop-guide-inline">
                      <summary className="stop-guide-summary">공항리무진1 정류소 안내</summary>
                      <p className="stop-guide-title">김해공항 ↔ 해운대/기장</p>
                      <div className="stop-guide-table-wrap">
                        <table className="stop-guide-table">
                          <thead>
                            <tr>
                              <th scope="col">해운대/기장 → 김해공항</th>
                              <th scope="col">김해공항 → 해운대/기장</th>
                            </tr>
                          </thead>
                          <tbody>
                            {airportLimousineStops.map((stop) => (
                              <tr key={`${stop.toAirport}-${stop.fromAirport}`}>
                                <td>{stop.toAirport}</td>
                                <td>{stop.fromAirport}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="stop-guide-caption">
                        벡스코, 신세계센텀시티, 해운대해수욕장 등 주요 정류소를 경유합니다.
                      </p>
                    </details>
                  ) : null}
                </article>
              ))}
            </div>
            <p className="sub-section-label">주차 및 셔틀 안내</p>
            <p className="sub-section-label">주차 안내</p>
            <div className="parking-guide-grid">
              <article className="transport-group">
                <p className="transport-group-title">{parkingGuide[0].title}</p>
                <ul className="transport-list">
                  <li>{parkingGuide[0].address}</li>
                  <li>{parkingGuide[0].note}</li>
                </ul>
                <div className="button-row">
                  <a className="btn btn-line" href={parkingMapLinks.naver} target="_blank" rel="noreferrer">
                    네이버지도
                  </a>
                  <a className="btn btn-line" href={parkingMapLinks.kakao} target="_blank" rel="noreferrer">
                    카카오맵
                  </a>
                </div>
              </article>
            </div>
            <p className="sub-section-label">셔틀버스 이용안내</p>
            <article className="transport-group">
              <ul className="transport-list">
                {shuttleGuide.map((item) => (
                  <li key={item.order}>
                    <strong>{item.order}. {item.route}</strong>
                    <br />
                    {item.detail}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section
            className={`card invite-card reveal-item ${activeCategory === 'contact' || jumpHighlightId === 'contact' ? 'section-jump-focus' : ''} ${jumpHighlightId === 'contact' ? 'section-click-ring' : ''}`}
            ref={contactSectionRef}
            style={{ '--reveal-delay': '400ms' }}
          >
            <InviteSectionTitle kicker="CONTACT" title="연락처 · 마음 전하실 곳" />
            <div className="contact-account-grid">
              {contactAccountCards.map((item) => (
                <article key={item.key} className="contact-account-card">
                  {(() => {
                    const accountCopyKey = `account-${item.key}`
                    return (
                      <>
                  <p className="contact-side">{item.sideLabel}</p>
                  <p className="contact-lineage">{item.lineage}</p>
                  <p className="contact-role">{item.name}</p>
                  <p className="contact-meta">
                    <span className="contact-label">계좌번호</span>
                    {item.account?.bank} {item.account?.number}
                  </p>
                  <p className="contact-meta">
                    <span className="contact-label">전화번호</span>
                    {item.phone}
                  </p>
                  <div className="button-row contact-actions">
                    <a className="btn btn-line" href={`tel:${item.phone.replaceAll('-', '')}`}>
                      전화하기
                    </a>
                    <button
                      type="button"
                      className={`btn btn-line copy-btn ${copiedKey === accountCopyKey ? 'is-copied' : ''}`}
                      onClick={() =>
                        onCopy(
                          `${item.account?.bank ?? ''} ${item.account?.number ?? ''} ${item.account?.holder ?? ''}`,
                          `${item.sideLabel} 계좌`,
                          accountCopyKey,
                        )
                      }
                    >
                      {copiedKey === accountCopyKey ? '복사 완료' : '계좌 복사'}
                    </button>
                  </div>
                      </>
                    )
                  })()}
                </article>
              ))}
            </div>
          </section>

          <section
            className={`card invite-card reveal-item ${activeCategory === 'snap' || jumpHighlightId === 'snap' ? 'section-jump-focus' : ''} ${jumpHighlightId === 'snap' ? 'section-click-ring' : ''}`}
            ref={snapSectionRef}
            style={{ '--reveal-delay': '470ms' }}
          >
            <div className="snap-collage" aria-hidden="true">
              <div className="snap-photo back-left">
                <img src={SNAP_COLLAGE_IMAGES.left} alt="" />
              </div>
              <div className="snap-photo back-right">
                <img src={SNAP_COLLAGE_IMAGES.center} alt="" />
              </div>
              <div className="snap-photo front">
                <img src={SNAP_COLLAGE_IMAGES.right} alt="" />
              </div>
            </div>
            <InviteSectionTitle kicker="CAPTURE OUR MOMENTS" title="스냅" />
            <div className="snap-intro">
              <p>신랑신부의 행복한 순간을 담아주세요.</p>
              <p>예식 당일, 아래 버튼을 통해 사진을 올려주세요.</p>
              <p>많은 참여 부탁드려요!</p>
            </div>
            <a className="btn snap-upload-btn" href={snapUploadUrl}>
              스냅 사진 업로드
            </a>
            <p className="snap-open-note">
              {isWeddingSnapOpen ? '지금 업로드 가능합니다.' : `${SNAP_UPLOAD_START_LABEL}\n업로드 가능합니다.`}
            </p>
          </section>

          </main>
        </>
      ) : (
        <main className="page-container admin-page">
          <section className="card admin-hero-card">
            <div className="admin-hero-top">
              <div>
                <p className="admin-kicker">ADMIN DASHBOARD</p>
                <h3>청첩장 운영 대시보드</h3>
                <p className="muted">RSVP, 방문 통계, 스냅 업로드 현황을 한 번에 확인하세요.</p>
              </div>
              <button type="button" className="btn btn-primary admin-refresh-btn" onClick={loadAdminData}>
                {adminLoading ? '동기화 중...' : '데이터 새로고침'}
              </button>
            </div>

            <div className="admin-sync-row">
              <p className="admin-sync-label">
                최근 동기화 <strong>{adminUpdatedAt ? formatDateTime(adminUpdatedAt, true) : '아직 불러오지 않음'}</strong>
              </p>
              <span className={`admin-status-pill ${adminError ? 'is-error' : 'is-ok'}`}>
                {adminError ? '연동 오류' : adminUpdatedAt ? '정상 연동' : '대기 중'}
              </span>
            </div>

            <div className="admin-action-grid">
              <a className="btn btn-line" href={GOOGLE_SHEET_URL} target="_blank" rel="noreferrer">
                응답 시트 보기
              </a>
              <a className="btn btn-line" href={sheetXlsxUrl} target="_blank" rel="noreferrer">
                엑셀 다운로드
              </a>
              <a className="btn btn-line" href={DRIVE_FOLDER_URL} target="_blank" rel="noreferrer">
                사진 폴더 열기
              </a>
              <a className="btn btn-line" href={snapUploadUrl} target="_blank" rel="noreferrer">
                업로드 페이지 열기
              </a>
              <button type="button" className="btn btn-line" onClick={() => onCopy(snapUploadUrl, '업로드 링크')}>
                업로드 링크 복사
              </button>
            </div>
            {adminError ? <p className="error-text">{adminError}</p> : null}
          </section>

          <section className="card">
            <header className="admin-card-head">
              <h3>RSVP 요약</h3>
              <p className="admin-card-tail">참석률 {adminAttendRate}%</p>
            </header>
            <div className="admin-metric-grid">
              <article className="admin-metric-card">
                <p className="admin-metric-label">총 응답</p>
                <p className="admin-metric-value">{adminSummary.total}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">참석</p>
                <p className="admin-metric-value">{adminSummary.attend}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">불참</p>
                <p className="admin-metric-value">{adminSummary.decline}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">추가 인원 합계</p>
                <p className="admin-metric-value">{adminSummary.companions}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">신랑측 참석인원</p>
                <p className="admin-metric-value">{adminSummary.groomAttendPeople}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">신부측 참석인원</p>
                <p className="admin-metric-value">{adminSummary.brideAttendPeople}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">총 인원 합계</p>
                <p className="admin-metric-value">{adminSummary.attendPeopleTotal}</p>
                {adminSummary.unknownAttendPeople > 0 ? (
                  <p className="admin-metric-sub">측 구분 미입력 {adminSummary.unknownAttendPeople}명 포함</p>
                ) : null}
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">셔틀 전체 인원</p>
                <p className="admin-metric-value">{adminSummary.shuttle}</p>
                <p className="admin-metric-sub">참석자 기준 {adminShuttleRate}%</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">김해공항 탑승 인원</p>
                <p className="admin-metric-value">{adminSummary.airportShuttle}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">부산역 탑승 인원</p>
                <p className="admin-metric-value">{adminSummary.busanStationShuttle}</p>
              </article>
            </div>
          </section>

          <section className="card">
            <header className="admin-card-head">
              <h3>방문자 통계</h3>
              <p className="admin-card-tail">실시간 집계</p>
            </header>
            <div className="admin-metric-grid visit-metrics">
              <article className="admin-metric-card">
                <p className="admin-metric-label">총 방문 수</p>
                <p className="admin-metric-value">{visitStats.totalViews}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">고유 방문자</p>
                <p className="admin-metric-value">{visitStats.uniqueVisitors}</p>
              </article>
              <article className="admin-metric-card">
                <p className="admin-metric-label">오늘 방문 수</p>
                <p className="admin-metric-value">{visitStats.todayViews}</p>
              </article>
            </div>
          </section>

          <section className="card">
            <header className="admin-card-head">
              <h3>최근 RSVP</h3>
              <p className="admin-card-tail">{adminRows.length}건</p>
            </header>
            {adminRows.length === 0 ? (
              <p className="muted">표시할 RSVP 데이터가 없습니다.</p>
            ) : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>시간</th>
                      <th>성함</th>
                      <th>구분</th>
                      <th>참석</th>
                      <th>추가</th>
                      <th>셔틀합</th>
                      <th>공항</th>
                      <th>부산역</th>
                      <th>연락처</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRows.slice(0, 30).map((row, idx) => {
                      const attendance = row.attendance ?? row.status ?? '-'
                      const attendanceClass = String(attendance).includes('불참') ? 'is-decline' : 'is-attend'
                      const rowTime = row.timestamp ?? row.createdAt ?? row.updatedAt ?? ''
                      const airportCount = parseCount(row.airportShuttleCount ?? row.shuttleAirportCount)
                      const busanCount = parseCount(row.busanStationShuttleCount ?? row.shuttleBusanCount)
                      const shuttleTotalRaw = parseCount(row.shuttleCount ?? row.shuttle)
                      const shuttleTotal = shuttleTotalRaw > 0 ? shuttleTotalRaw : airportCount + busanCount

                      return (
                        <tr key={`${row.name ?? row.phone ?? ''}-${idx}`}>
                          <td>{formatDateTime(rowTime)}</td>
                          <td>{row.name ?? '-'}</td>
                          <td>{formatSideLabel(row.side)}</td>
                          <td>
                            <span className={`admin-chip ${attendanceClass}`}>{attendance}</span>
                          </td>
                          <td>{row.companions ?? row.guests ?? '0'}</td>
                          <td>{shuttleTotal}</td>
                          <td>{airportCount}</td>
                          <td>{busanCount}</td>
                          <td>{row.phone ?? '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card">
            <header className="admin-card-head">
              <h3>최근 사진 업로드</h3>
              <p className="admin-card-tail">{adminPhotos.length}건</p>
            </header>
            {adminPhotos.length === 0 ? (
              <p className="muted">표시할 사진 업로드 데이터가 없습니다.</p>
            ) : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>시간</th>
                      <th>업로더</th>
                      <th>파일명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminPhotos.slice(0, 30).map((row, idx) => {
                      const rowTime = row.timestamp ?? row.createdAt ?? row.updatedAt ?? ''
                      return (
                        <tr key={`${row.fileName ?? row.name ?? ''}-${idx}`}>
                          <td>{formatDateTime(rowTime)}</td>
                          <td>{row.uploaderName ?? row.name ?? '-'}</td>
                          <td className="admin-file-name">{row.fileName ?? '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      )}

      {isGuestScreen && isContactModalOpen ? (
        <div className="rsvp-modal-backdrop" onClick={closeContactModal} role="dialog" aria-modal="true">
          <section className="contact-popup-modal" onClick={(event) => event.stopPropagation()}>
            <header className="contact-popup-head">
              <h4>연락처 · 마음 전하실 곳</h4>
              <button type="button" className="rsvp-close-x" onClick={closeContactModal} aria-label="닫기">
                ×
              </button>
            </header>
            <p className="contact-popup-desc">신랑 · 신부 연락처와 계좌 정보를 확인하실 수 있습니다.</p>
            <div className="contact-account-grid">
              {contactAccountCards.map((item) => (
                <article key={item.key} className="contact-account-card">
                  {(() => {
                    const accountCopyKey = `account-${item.key}`
                    return (
                      <>
                  <p className="contact-side">{item.sideLabel}</p>
                  <p className="contact-lineage">{item.lineage}</p>
                  <p className="contact-role">{item.name}</p>
                  <p className="contact-meta">
                    <span className="contact-label">계좌번호</span>
                    {item.account?.bank} {item.account?.number}
                  </p>
                  <p className="contact-meta">
                    <span className="contact-label">전화번호</span>
                    {item.phone}
                  </p>
                  <div className="button-row contact-actions">
                    <a className="btn btn-line" href={`tel:${item.phone.replaceAll('-', '')}`}>
                      전화하기
                    </a>
                    <button
                      type="button"
                      className={`btn btn-line copy-btn ${copiedKey === accountCopyKey ? 'is-copied' : ''}`}
                      onClick={() =>
                        onCopy(
                          `${item.account?.bank ?? ''} ${item.account?.number ?? ''} ${item.account?.holder ?? ''}`,
                          `${item.sideLabel} 계좌`,
                          accountCopyKey,
                        )
                      }
                    >
                      {copiedKey === accountCopyKey ? '복사 완료' : '계좌 복사'}
                    </button>
                  </div>
                      </>
                    )
                  })()}
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {isGuestScreen && isRsvpModalOpen ? (
        <div className="rsvp-modal-backdrop" onClick={closeRsvpModal} role="dialog" aria-modal="true">
          {rsvpView === 'intro' ? (
            <section className="rsvp-intro-modal" onClick={(event) => event.stopPropagation()}>
              <div className="rsvp-intro-hero">
                <img src={OPENING_IMAGE} alt="참석 의사 전달 안내" />
                <div className="rsvp-intro-hero-dim" />
                <p className="rsvp-intro-date-mark">
                  26
                  <br />
                  10
                  <br />
                  17
                </p>
              </div>

              <div className="rsvp-intro-content">
                <button type="button" className="rsvp-close-x" onClick={closeRsvpModal} aria-label="닫기">
                  ×
                </button>
                <h4>참석 의사 전달</h4>
                <p className="rsvp-intro-text">
                  특별한 날 축하의 마음으로 참석해주시는 모든 분들을 한 분 한 분 더욱 귀하게 모실 수 있도록,
                  아래 버튼으로 신랑 &amp; 신부에게 꼭 참석여부 전달을 부탁드립니다.
                </p>

                <ul className="rsvp-intro-meta">
                  <li>
                    <span aria-hidden="true">📅</span>
                    {wedding.dateLabel} {wedding.timeLabel}
                  </li>
                  <li>
                    <span aria-hidden="true">🏛️</span>
                    {wedding.place}
                  </li>
                  <li>
                    <span aria-hidden="true">📍</span>
                    {wedding.address}
                  </li>
                </ul>

                <div className="rsvp-intro-actions">
                  <button type="button" className="rsvp-hide-today" onClick={hideRsvpForToday}>
                    오늘 하루 보지 않기
                  </button>
                  <button type="button" className="rsvp-intro-submit" onClick={() => setRsvpView('form')}>
                    참석의사 전달하기
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="rsvp-form-modal" onClick={(event) => event.stopPropagation()}>
              <header className="rsvp-form-head">
                <h4>참석 의사 전달</h4>
                <button type="button" className="rsvp-close-x" onClick={closeRsvpModal} aria-label="닫기">
                  ×
                </button>
              </header>

              <p className="rsvp-form-desc">원활한 예식 진행을 위해 참석 정보를 미리 알려주시면 감사하겠습니다.</p>

              <form className="rsvp-modern-form" onSubmit={submitRsvp}>
                <div className="rsvp-toggle-grid two">
                  <label className={`rsvp-select-card ${rsvp.attendance === '참석' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="attendance"
                      value="참석"
                      checked={rsvp.attendance === '참석'}
                      onChange={onRsvpFieldChange('attendance')}
                    />
                    <span className="card-title">가능</span>
                    <span className="card-check">{rsvp.attendance === '참석' ? '●' : '○'}</span>
                  </label>
                  <label className={`rsvp-select-card ${rsvp.attendance === '불참' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="attendance"
                      value="불참"
                      checked={rsvp.attendance === '불참'}
                      onChange={onRsvpFieldChange('attendance')}
                    />
                    <span className="card-title">불가</span>
                    <span className="card-check">{rsvp.attendance === '불참' ? '●' : '○'}</span>
                  </label>
                </div>

                <div className="rsvp-line-field">
                  <div className="rsvp-name-side">
                    <label className="rsvp-field-label">성함</label>
                    <div className={`rsvp-side-segment ${rsvp.side === 'groom' ? 'is-groom' : 'is-bride'}`}>
                      <span className="segment-thumb" aria-hidden="true" />
                      <label className={`segment-option ${rsvp.side === 'groom' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="side"
                          value="groom"
                          checked={rsvp.side === 'groom'}
                          onChange={onRsvpFieldChange('side')}
                        />
                        신랑측
                      </label>
                      <label className={`segment-option ${rsvp.side === 'bride' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="side"
                          value="bride"
                          checked={rsvp.side === 'bride'}
                          onChange={onRsvpFieldChange('side')}
                        />
                        신부측
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={rsvp.name}
                    onChange={onRsvpFieldChange('name')}
                    placeholder="성함을 입력해 주세요."
                  />
                </div>

                <div className="rsvp-line-field">
                  <label className="rsvp-field-label">연락처</label>
                  <input
                    type="tel"
                    value={rsvp.phone}
                    onChange={onRsvpFieldChange('phone')}
                    placeholder="참석자 대표 연락처를 입력해 주세요."
                  />
                </div>

                {isAttending ? (
                  <>
                    <div className="rsvp-stepper-block">
                      <p className="rsvp-required-label">* 추가인원</p>
                      <div className="rsvp-stepper">
                        <button type="button" onClick={() => adjustRsvpCount('companions', -1)}>
                          －
                        </button>
                        <strong>{rsvp.companions}</strong>
                        <button type="button" onClick={() => adjustRsvpCount('companions', 1)}>
                          ＋
                        </button>
                      </div>
                    </div>

                    <p className="rsvp-required-label">* 식사여부</p>
                    <div className="rsvp-toggle-grid two">
                      <label className={`rsvp-select-card ${rsvp.meal === '식사 가능' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="meal"
                          value="식사 가능"
                          checked={rsvp.meal === '식사 가능'}
                          onChange={onRsvpFieldChange('meal')}
                        />
                        <span className="card-title">식사함</span>
                        <span className="card-check">{rsvp.meal === '식사 가능' ? '●' : '○'}</span>
                      </label>
                      <label className={`rsvp-select-card ${rsvp.meal === '식사 불가 · 답례품 수령' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="meal"
                          value="식사 불가 · 답례품 수령"
                          checked={rsvp.meal === '식사 불가 · 답례품 수령'}
                          onChange={onRsvpFieldChange('meal')}
                        />
                        <span className="card-title">식사안함</span>
                        <span className="card-check">{rsvp.meal === '식사 불가 · 답례품 수령' ? '●' : '○'}</span>
                      </label>
                    </div>

                    <p className="rsvp-required-label">* 셔틀버스 탑승여부 (김해공항 → 부산역 → 기장 루모스가든)</p>
                    <div className="rsvp-toggle-grid two">
                      <label className={`rsvp-select-card ${rsvp.shuttleChoice === '부산역 셔틀 이용' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="shuttleChoice"
                          value="부산역 셔틀 이용"
                          checked={rsvp.shuttleChoice === '부산역 셔틀 이용'}
                          onChange={onRsvpFieldChange('shuttleChoice')}
                        />
                        <span className="card-title">탑승함</span>
                        <span className="card-check">{rsvp.shuttleChoice === '부산역 셔틀 이용' ? '●' : '○'}</span>
                      </label>
                      <label className={`rsvp-select-card ${rsvp.shuttleChoice === '미이용' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="shuttleChoice"
                          value="미이용"
                          checked={rsvp.shuttleChoice === '미이용'}
                          onChange={onRsvpFieldChange('shuttleChoice')}
                        />
                        <span className="card-title">탑승안함</span>
                        <span className="card-check">{rsvp.shuttleChoice === '미이용' ? '●' : '○'}</span>
                      </label>
                    </div>

                    {rsvp.shuttleChoice === '부산역 셔틀 이용' ? (
                      <>
                        <div className="rsvp-stepper-block">
                          <p className="rsvp-required-label">* 김해공항 탑승 인원</p>
                          <div className="rsvp-stepper">
                            <button type="button" onClick={() => adjustRsvpCount('airportShuttleCount', -1)}>
                              －
                            </button>
                            <strong>{rsvp.airportShuttleCount}</strong>
                            <button type="button" onClick={() => adjustRsvpCount('airportShuttleCount', 1)}>
                              ＋
                            </button>
                          </div>
                        </div>
                        <div className="rsvp-stepper-block">
                          <p className="rsvp-required-label">* 부산역 탑승 인원</p>
                          <div className="rsvp-stepper">
                            <button type="button" onClick={() => adjustRsvpCount('busanStationShuttleCount', -1)}>
                              －
                            </button>
                            <strong>{rsvp.busanStationShuttleCount}</strong>
                            <button type="button" onClick={() => adjustRsvpCount('busanStationShuttleCount', 1)}>
                              ＋
                            </button>
                          </div>
                        </div>
                        <p className="rsvp-state-note">셔틀 탑승 인원 합계 {rsvp.shuttleCount}명</p>
                      </>
                    ) : null}
                  </>
                ) : (
                  <p className="rsvp-state-note">불참으로 접수되며 식사 및 셔틀은 미이용 처리됩니다.</p>
                )}

                <div className="rsvp-line-field">
                  <label className="rsvp-field-label">전달사항</label>
                  <input
                    type="text"
                    value={rsvp.memo}
                    onChange={onRsvpFieldChange('memo')}
                    maxLength={30}
                    placeholder="전달하실 내용을 입력해 주세요. (예: 유아 1명 동반)"
                  />
                </div>

                <label className="rsvp-privacy-card">
                  <input type="checkbox" checked={rsvp.agreePrivacy} onChange={onRsvpFieldChange('agreePrivacy')} />
                  <div>
                    <strong>동의합니다.</strong>
                    <p>
                      참석여부 전달을 위한 개인정보 수집 및 이용에 동의해주세요.
                      <br />
                      항목: 성함, 연락처 / 보유기간: 청첩장 이용 종료 시 까지
                    </p>
                  </div>
                </label>

                <div className="rsvp-modal-actions modern">
                  <button type="button" className="btn btn-line" onClick={() => setRsvpView('intro')}>
                    이전
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={isRsvpSubmitting}>
                    {isRsvpSubmitting ? '전달 중...' : '참석의사 전달하기'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      ) : null}

      {showScrollTop ? (
        <button type="button" className="scroll-top-btn" onClick={scrollToTop}>
          맨 위로
        </button>
      ) : null}

      {isGuestScreen && !showOpening ? (
        <button
          type="button"
          className="particle-toggle-btn"
          onClick={() => setIsParticleEnabled((prev) => !prev)}
        >
          {isParticleEnabled ? '눈 효과 끄기' : '눈 효과 켜기'}
        </button>
      ) : null}

      {toast ? <p className="toast">{toast}</p> : null}
    </div>
  )
}

export default App

import type { TimeseriesBucket } from '~/lib/api/types.gen'
import type { DashboardPeriod } from './types'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const MAX_HOURLY_RANGE_DAYS = 31
const MAX_DAILY_RANGE_DAYS = 365

const parseDate = (input: string, fallback: Date): Date => {
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? fallback : date
}

const nowRoundedToHour = () => {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  return now
}

const defaultCustomRange = (bucket: TimeseriesBucket) => {
  const to = nowRoundedToHour()
  const from = new Date(to)
  from.setDate(from.getDate() - (bucket === 'hour' ? 7 : 30))
  return { from: from.toISOString(), to: to.toISOString() }
}

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const startOfWeek = (date: Date) => {
  const next = startOfDay(date)
  const day = next.getDay()
  const distanceFromMonday = (day + 6) % 7
  next.setDate(next.getDate() - distanceFromMonday)
  return next
}

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

const addDays = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

const addMonths = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

const getPeriodBounds = (period: DashboardPeriod, anchor: Date) => {
  if (period === 'daily') {
    const from = startOfDay(anchor)
    return {
      bucket: 'hour' as TimeseriesBucket,
      from,
      to: addDays(from, 1)
    }
  }

  if (period === 'weekly') {
    const from = startOfWeek(anchor)
    return {
      bucket: 'day' as TimeseriesBucket,
      from,
      to: addDays(from, 7)
    }
  }

  const from = startOfMonth(anchor)
  return {
    bucket: 'day' as TimeseriesBucket,
    from,
    to: addMonths(from, 1)
  }
}

const shiftPeriodStart = (period: DashboardPeriod, start: Date, direction: -1 | 1) => {
  if (period === 'daily') {
    return addDays(start, direction)
  }

  if (period === 'weekly') {
    return addDays(start, direction * 7)
  }

  if (period === 'custom') {
    return start
  }

  return addMonths(start, direction)
}

export function useTrailDashboardTimeframeState() {
  const period = useState<DashboardPeriod>('dashboard:period', () => 'weekly')
  const periodAnchor = useState<string>('dashboard:periodAnchor', () => nowRoundedToHour().toISOString())
  const customBucket = useState<TimeseriesBucket>('dashboard:customBucket', () => 'day')
  const customRangeFrom = useState<string>('dashboard:customRangeFrom', () => defaultCustomRange('day').from)
  const customRangeTo = useState<string>('dashboard:customRangeTo', () => defaultCustomRange('day').to)

  const normalizeCustomRange = () => {
    const fallbackTo = nowRoundedToHour()
    let to = parseDate(customRangeTo.value, fallbackTo)
    let from = parseDate(customRangeFrom.value, new Date(to.getTime() - 7 * DAY_MS))

    if (to <= from) {
      to = new Date(from.getTime() + HOUR_MS)
    }

    const maxRangeMs = (customBucket.value === 'hour' ? MAX_HOURLY_RANGE_DAYS : MAX_DAILY_RANGE_DAYS) * DAY_MS
    if (to.getTime() - from.getTime() > maxRangeMs) {
      from = new Date(to.getTime() - maxRangeMs)
    }

    customRangeFrom.value = from.toISOString()
    customRangeTo.value = to.toISOString()
  }

  const periodBounds = computed(() =>
    getPeriodBounds(period.value, parseDate(periodAnchor.value, nowRoundedToHour()))
  )

  const bucket = computed(() => (period.value === 'custom' ? customBucket.value : periodBounds.value.bucket))
  const rangeFrom = computed(() => (period.value === 'custom' ? customRangeFrom.value : periodBounds.value.from.toISOString()))
  const rangeTo = computed(() => (period.value === 'custom' ? customRangeTo.value : periodBounds.value.to.toISOString()))
  const currentPeriodStart = computed(() => getPeriodBounds(period.value, nowRoundedToHour()).from.getTime())

  const setPeriod = (nextPeriod: DashboardPeriod) => {
    if (period.value === nextPeriod) {
      return
    }

    const currentStart = periodBounds.value.from
    period.value = nextPeriod
    periodAnchor.value = currentStart.toISOString()
  }

  const shiftPeriod = (direction: -1 | 1) => {
    if (period.value === 'custom') {
      return
    }
    const nextStart = shiftPeriodStart(period.value, periodBounds.value.from, direction)
    periodAnchor.value = nextStart.toISOString()
  }

  const canShiftForward = computed(
    () => period.value !== 'custom'
      && shiftPeriodStart(period.value, periodBounds.value.from, 1).getTime() <= currentPeriodStart.value
  )

  const periodLabel = computed(() => {
    if (period.value === 'custom') {
      const from = parseDate(customRangeFrom.value, nowRoundedToHour())
      const toExclusive = parseDate(customRangeTo.value, nowRoundedToHour())
      const toInclusive = new Date(toExclusive.getTime() - 1)
      const format = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      return `${format.format(from)} - ${format.format(toInclusive)}`
    }

    const start = periodBounds.value.from

    if (period.value === 'daily') {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(start)
    }

    if (period.value === 'weekly') {
      const end = addDays(periodBounds.value.to, -1)
      const format = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric'
      })
      return `${format.format(start)} - ${format.format(end)}`
    }

    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric'
    }).format(start)
  })

  const setCustomBucket = (nextBucket: TimeseriesBucket) => {
    customBucket.value = nextBucket
    normalizeCustomRange()
  }

  const setCustomRangeFrom = (iso: string) => {
    customRangeFrom.value = iso
    normalizeCustomRange()
  }

  const setCustomRangeTo = (iso: string) => {
    customRangeTo.value = iso
    normalizeCustomRange()
  }

  return {
    bucket,
    canShiftForward,
    customBucket,
    period,
    periodLabel,
    rangeFrom,
    rangeTo,
    setCustomBucket,
    setCustomRangeFrom,
    setCustomRangeTo,
    setPeriod,
    shiftPeriod
  }
}

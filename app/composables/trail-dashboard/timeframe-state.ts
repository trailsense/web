import type { TimeseriesBucket } from '~/lib/api/types.gen'
import type { DashboardPeriod } from './types'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

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
  const customBucket = useState<TimeseriesBucket | undefined>('dashboard:customBucket', () => 'day')
  const customRangeFrom = useState<string>('dashboard:customRangeFrom', () => defaultCustomRange('day').from)
  const customRangeTo = useState<string>('dashboard:customRangeTo', () => defaultCustomRange('day').to)

  const normalizeCustomRange = () => {
    const fallbackTo = nowRoundedToHour()
    let to = parseDate(customRangeTo.value, fallbackTo)
    const from = parseDate(customRangeFrom.value, new Date(to.getTime() - 7 * DAY_MS))

    if (to <= from) {
      to = new Date(from.getTime() + HOUR_MS)
    }

    customRangeFrom.value = from.toISOString()
    customRangeTo.value = to.toISOString()
  }

  const periodBounds = computed(() =>
    getPeriodBounds(period.value, parseDate(periodAnchor.value, nowRoundedToHour()))
  )

  const autoBucketForRange = (from: Date, to: Date): TimeseriesBucket => {
    const days = (to.getTime() - from.getTime()) / DAY_MS

    if (days <= 1) return 'hour'
    if (days <= 30) return 'day'
    return 'week'
  }

  const bucket = computed(() => {
    if (period.value !== 'custom') {
      return periodBounds.value.bucket
    }

    const from = parseDate(customRangeFrom.value, nowRoundedToHour())
    const to = parseDate(customRangeTo.value, nowRoundedToHour())

    if (!customBucket.value) {
      return autoBucketForRange(from, to)
    }

    return customBucket.value
  })

  const rangeFrom = computed(() => (period.value === 'custom' ? customRangeFrom.value : periodBounds.value.from.toISOString()))
  const rangeTo = computed(() => (period.value === 'custom' ? customRangeTo.value : periodBounds.value.to.toISOString()))
  const currentPeriodStart = computed(() => getPeriodBounds(period.value, nowRoundedToHour()).from.getTime())

  const setPeriod = (nextPeriod: DashboardPeriod) => {
    if (period.value === nextPeriod) return

    period.value = nextPeriod

    if (nextPeriod !== 'custom') {
      periodAnchor.value = nowRoundedToHour().toISOString()
    }
  }

  const shiftPeriod = (direction: -1 | 1) => {
    if (period.value === 'custom') return

    let windowStart = periodBounds.value.from
    if (period.value === 'weekly') {
      windowStart = addDays(windowStart, direction * 7)
    } else if (period.value === 'daily') {
      windowStart = addDays(windowStart, direction)
    } else if (period.value === 'monthly') {
      windowStart = addMonths(windowStart, direction)
    }

    periodAnchor.value = windowStart.toISOString()
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

  const setCustomBucket = (next: TimeseriesBucket) => {
    customBucket.value = next
  }

  const setCustomRangeFrom = (iso: string) => {
    customRangeFrom.value = iso
    normalizeCustomRange()
    customBucket.value = undefined
  }

  const setCustomRangeTo = (iso: string) => {
    customRangeTo.value = iso
    normalizeCustomRange()
    customBucket.value = undefined
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

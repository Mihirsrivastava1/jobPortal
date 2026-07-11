import { describe, expect, it } from 'vitest'
import { formatSalary, isClosingSoon, isNew } from '../utils/format'

describe('formatSalary', () => {
  it('shows a range when both min and max are present', () => {
    expect(formatSalary({ salaryMin: 50000, salaryMax: 70000, currency: 'USD' })).toContain('$50,000')
  })

  it('falls back to "not disclosed" when no salary is given', () => {
    expect(formatSalary({ salaryMin: null, salaryMax: null, currency: 'USD' })).toBe('Salary not disclosed')
  })

  it('shows a single figure when only one bound is present', () => {
    expect(formatSalary({ salaryMin: 60000, salaryMax: null, currency: 'USD' })).toContain('$60,000')
  })
})

describe('isNew', () => {
  it('is true for a job posted an hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    expect(isNew(oneHourAgo)).toBe(true)
  })

  it('is false for a job posted a week ago', () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    expect(isNew(weekAgo)).toBe(false)
  })
})

describe('isClosingSoon', () => {
  it('is false when there is no closing date', () => {
    expect(isClosingSoon(undefined)).toBe(false)
  })

  it('is true when the closing date is within a week', () => {
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    expect(isClosingSoon(inThreeDays)).toBe(true)
  })

  it('is false when the closing date already passed', () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    expect(isClosingSoon(lastWeek)).toBe(false)
  })
})

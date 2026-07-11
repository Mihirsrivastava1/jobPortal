import type { Job } from '../types/job'

export function formatSalary(job: Pick<Job, 'salaryMin' | 'salaryMax' | 'currency'>): string {
  const { salaryMin, salaryMax, currency } = job
  if (!salaryMin && !salaryMax) return 'Salary not disclosed'

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  })

  if (salaryMin && salaryMax) {
    return `${formatter.format(salaryMin)} – ${formatter.format(salaryMax)} / yr`
  }
  const single = salaryMin ?? salaryMax
  return `${formatter.format(single as number)} / yr`
}

export function formatPostedAgo(postedAt: string): string {
  const posted = new Date(postedAt).getTime()
  const diffMs = Date.now() - posted
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(postedAt).toLocaleDateString()
}

export function isNew(postedAt: string): boolean {
  const hours = (Date.now() - new Date(postedAt).getTime()) / (1000 * 60 * 60)
  return hours <= 48
}

export function isClosingSoon(closingDate?: string | null): boolean {
  if (!closingDate) return false
  const days = (new Date(closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return days >= 0 && days <= 7
}

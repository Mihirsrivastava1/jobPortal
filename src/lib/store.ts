import type { ApplicationFormValues, Job, JobFormValues } from '../types/job'
import { SEED_JOBS } from './seedJobs'

const JOBS_KEY = 'pinboard.jobs'
const APPLICATIONS_KEY = 'pinboard.applications'
const NEXT_ID_KEY = 'pinboard.next-job-id'

export interface StoredApplication {
  id: number
  jobId: number
  applicantName: string
  applicantEmail: string
  resumeUrl: string
  coverLetter: string
  appliedAt: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function ensureSeeded(): void {
  if (window.localStorage.getItem(JOBS_KEY) === null) {
    writeJson(JOBS_KEY, SEED_JOBS)
    writeJson(NEXT_ID_KEY, SEED_JOBS.length + 1)
  }
  if (window.localStorage.getItem(APPLICATIONS_KEY) === null) {
    writeJson(APPLICATIONS_KEY, [])
  }
}

function getAllJobs(): Job[] {
  ensureSeeded()
  return readJson<Job[]>(JOBS_KEY, [])
}

function saveAllJobs(jobs: Job[]): void {
  writeJson(JOBS_KEY, jobs)
}

function nextJobId(): number {
  ensureSeeded()
  const current = readJson<number>(NEXT_ID_KEY, SEED_JOBS.length + 1)
  writeJson(NEXT_ID_KEY, current + 1)
  return current
}

function getAllApplications(): StoredApplication[] {
  ensureSeeded()
  return readJson<StoredApplication[]>(APPLICATIONS_KEY, [])
}

function saveAllApplications(applications: StoredApplication[]): void {
  writeJson(APPLICATIONS_KEY, applications)
}

function toJobFromForm(values: JobFormValues): Omit<Job, 'id' | 'postedAt' | 'status' | 'updatedAt'> {
  return {
    title: values.title.trim(),
    company: values.company.trim(),
    companyLogoUrl: values.companyLogoUrl || null,
    location: values.location.trim(),
    remoteType: values.remoteType,
    jobType: values.jobType,
    category: values.category.trim(),
    salaryMin: values.salaryMin ? Number(values.salaryMin) : null,
    salaryMax: values.salaryMax ? Number(values.salaryMax) : null,
    currency: values.currency || 'USD',
    description: values.description,
    requirements: values.requirements || null,
    applyUrl: values.applyUrl || null,
    applyEmail: values.applyEmail || null,
    closingDate: values.closingDate || null,
  }
}

export interface JobQuery {
  search?: string
  location?: string
  category?: string
  jobType?: string
  remoteType?: string
  status?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export interface PagedResult<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export const store = {
  listJobs(query: JobQuery): PagedResult<Job> {
    const jobs = getAllJobs()
    const {
      search = '',
      location = '',
      category = '',
      jobType = '',
      remoteType = '',
      status = 'OPEN',
      page = 0,
      size = 9,
      sortBy = 'postedAt',
      sortDir = 'desc',
    } = query

    let filtered = jobs.filter((job) => {
      if (status && job.status !== status) return false
      if (search) {
        const term = search.toLowerCase()
        const haystack = `${job.title} ${job.company} ${job.description}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false
      if (category && job.category.toLowerCase() !== category.toLowerCase()) return false
      if (jobType && job.jobType !== jobType) return false
      if (remoteType && job.remoteType !== remoteType) return false
      return true
    })

    filtered = filtered.sort((a, b) => {
      const aVal = (a as unknown as Record<string, string>)[sortBy] ?? ''
      const bVal = (b as unknown as Record<string, string>)[sortBy] ?? ''
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === 'asc' ? comparison : -comparison
    })

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const start = page * size
    const items = filtered.slice(start, start + size)

    return {
      items,
      page,
      size,
      totalElements,
      totalPages,
      last: page >= totalPages - 1,
    }
  },

  getJob(id: number): Job | null {
    return getAllJobs().find((job) => job.id === id) ?? null
  },

  createJob(values: JobFormValues): Job {
    const jobs = getAllJobs()
    const job: Job = {
      id: nextJobId(),
      ...toJobFromForm(values),
      status: 'OPEN',
      postedAt: new Date().toISOString(),
      updatedAt: null,
    }
    saveAllJobs([job, ...jobs])
    return job
  },

  updateJob(id: number, values: JobFormValues): Job | null {
    const jobs = getAllJobs()
    const index = jobs.findIndex((job) => job.id === id)
    if (index === -1) return null
    const updated: Job = {
      ...jobs[index],
      ...toJobFromForm(values),
      updatedAt: new Date().toISOString(),
    }
    jobs[index] = updated
    saveAllJobs(jobs)
    return updated
  },

  deleteJob(id: number): void {
    saveAllJobs(getAllJobs().filter((job) => job.id !== id))
    saveAllApplications(getAllApplications().filter((application) => application.jobId !== id))
  },

  setStatus(id: number, status: Job['status']): Job | null {
    const jobs = getAllJobs()
    const index = jobs.findIndex((job) => job.id === id)
    if (index === -1) return null
    jobs[index] = { ...jobs[index], status, updatedAt: new Date().toISOString() }
    saveAllJobs(jobs)
    return jobs[index]
  },

  distinctCategories(): string[] {
    return Array.from(new Set(getAllJobs().map((job) => job.category))).sort()
  },

  distinctLocations(): string[] {
    return Array.from(new Set(getAllJobs().map((job) => job.location))).sort()
  },

  applyToJob(jobId: number, values: ApplicationFormValues): StoredApplication {
    const applications = getAllApplications()
    const application: StoredApplication = {
      id: applications.length > 0 ? Math.max(...applications.map((a) => a.id)) + 1 : 1,
      jobId,
      applicantName: values.applicantName.trim(),
      applicantEmail: values.applicantEmail.trim(),
      resumeUrl: values.resumeUrl.trim(),
      coverLetter: values.coverLetter,
      appliedAt: new Date().toISOString(),
    }
    saveAllApplications([application, ...applications])
    return application
  },

  listApplicationsForJob(jobId: number): StoredApplication[] {
    return getAllApplications()
      .filter((application) => application.jobId === jobId)
      .sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1))
  },

  countApplicationsForJob(jobId: number): number {
    return getAllApplications().filter((application) => application.jobId === jobId).length
  },

  resetToSeed(): void {
    writeJson(JOBS_KEY, SEED_JOBS)
    writeJson(NEXT_ID_KEY, SEED_JOBS.length + 1)
    writeJson(APPLICATIONS_KEY, [])
  },
}

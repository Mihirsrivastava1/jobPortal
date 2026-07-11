export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
export type RemoteType = 'ON_SITE' | 'REMOTE' | 'HYBRID'
export type JobStatus = 'OPEN' | 'CLOSED'

export interface Job {
  id: number
  title: string
  company: string
  companyLogoUrl?: string | null
  location: string
  remoteType: RemoteType
  jobType: JobType
  category: string
  salaryMin?: number | null
  salaryMax?: number | null
  currency: string
  description: string
  requirements?: string | null
  applyUrl?: string | null
  applyEmail?: string | null
  status: JobStatus
  postedAt: string
  updatedAt?: string | null
  closingDate?: string | null
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface JobFilters {
  search: string
  location: string
  category: string
  jobType: JobType | ''
  remoteType: RemoteType | ''
}

export interface JobFormValues {
  title: string
  company: string
  companyLogoUrl: string
  location: string
  remoteType: RemoteType
  jobType: JobType
  category: string
  salaryMin: string
  salaryMax: string
  currency: string
  description: string
  requirements: string
  applyUrl: string
  applyEmail: string
  closingDate: string
}

export interface ApplicationFormValues {
  applicantName: string
  applicantEmail: string
  resumeUrl: string
  coverLetter: string
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
}

export const REMOTE_TYPE_LABELS: Record<RemoteType, string> = {
  ON_SITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
}

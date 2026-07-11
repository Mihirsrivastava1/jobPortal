import type { ApplicationFormValues, Job, JobFormValues, PagedResponse } from '../types/job'
import type { JobQuery } from '../lib/store'
import { store } from '../lib/store'

export class ApiError extends Error {
  status: number
  details?: Record<string, string>

  constructor(message: string, status: number, details?: Record<string, string>) {
    super(message)
    this.status = status
    this.details = details
  }
}

// A tiny artificial delay makes loading states/skeletons feel real instead of
// flashing instantly - purely a UX touch, not required for correctness.
function settle<T>(value: T, delayMs = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delayMs))
}

function validateJobForm(values: JobFormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!values.title.trim()) errors.title = 'Title is required'
  if (!values.company.trim()) errors.company = 'Company is required'
  if (!values.location.trim()) errors.location = 'Location is required'
  if (!values.category.trim()) errors.category = 'Category is required'
  if (!values.description.trim()) errors.description = 'Description is required'
  if (values.salaryMin && values.salaryMax && Number(values.salaryMin) > Number(values.salaryMax)) {
    errors.salaryMax = 'Maximum salary cannot be less than minimum salary'
  }
  return errors
}

export const api = {
  async listJobs(params: JobQuery): Promise<PagedResponse<Job>> {
    const result = store.listJobs(params)
    return settle(result)
  },

  async getJob(id: number | string): Promise<Job> {
    const job = store.getJob(Number(id))
    if (!job) throw new ApiError('Job not found', 404)
    return settle(job)
  },

  async getJobsByIds(ids: number[]): Promise<(Job | null)[]> {
    return settle(ids.map((id) => store.getJob(id)))
  },

  async createJob(values: JobFormValues): Promise<Job> {
    const errors = validateJobForm(values)
    if (Object.keys(errors).length > 0) {
      throw new ApiError('Validation failed', 400, errors)
    }
    const job = store.createJob(values)
    return settle(job)
  },

  async updateJob(id: number, values: JobFormValues): Promise<Job> {
    const errors = validateJobForm(values)
    if (Object.keys(errors).length > 0) {
      throw new ApiError('Validation failed', 400, errors)
    }
    const job = store.updateJob(id, values)
    if (!job) throw new ApiError('Job not found', 404)
    return settle(job)
  },

  async deleteJob(id: number): Promise<void> {
    store.deleteJob(id)
    return settle(undefined)
  },

  async closeJob(id: number): Promise<Job> {
    const job = store.setStatus(id, 'CLOSED')
    if (!job) throw new ApiError('Job not found', 404)
    return settle(job)
  },

  async reopenJob(id: number): Promise<Job> {
    const job = store.setStatus(id, 'OPEN')
    if (!job) throw new ApiError('Job not found', 404)
    return settle(job)
  },

  async applyToJob(jobId: number, values: ApplicationFormValues): Promise<void> {
    const job = store.getJob(jobId)
    if (!job) throw new ApiError('Job not found', 404)
    if (job.status === 'CLOSED') {
      throw new ApiError('This job is closed and no longer accepting applications', 400)
    }
    if (!values.applicantName.trim() || !values.applicantEmail.trim() || !values.resumeUrl.trim()) {
      throw new ApiError('Validation failed', 400, { applicantName: 'All required fields must be filled in' })
    }
    store.applyToJob(jobId, values)
    return settle(undefined)
  },

  async listApplications(jobId: number) {
    return settle(store.listApplicationsForJob(jobId))
  },

  async countApplications(jobId: number) {
    return settle(store.countApplicationsForJob(jobId))
  },

  async categories(): Promise<string[]> {
    return settle(store.distinctCategories())
  },

  async locations(): Promise<string[]> {
    return settle(store.distinctLocations())
  },

  async resetDemoData(): Promise<void> {
    store.resetToSeed()
    return settle(undefined)
  },
}

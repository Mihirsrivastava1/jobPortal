import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'pinboard.saved-jobs'

function readSavedIds(): number[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<number[]>(() => readSavedIds())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds))
  }, [savedIds])

  const isSaved = useCallback((id: number) => savedIds.includes(id), [savedIds])

  const toggleSaved = useCallback((id: number) => {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    )
  }, [])

  return { savedIds, isSaved, toggleSaved }
}

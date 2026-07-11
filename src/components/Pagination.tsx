import './Pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Job results pages">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        ← Previous
      </button>
      <span className="pagination__status">
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Next →
      </button>
    </nav>
  )
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPrevNext = true,
}) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid #f2f4f7', display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        {showPrevNext && (
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              minWidth: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid #d0d5dd',
              background: currentPage === 1 ? '#f2f4f7' : '#fff',
              color: currentPage === 1 ? '#98a2b3' : '#344054',
              fontSize: 13,
              fontWeight: 700,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            {'<<'}
          </button>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              minWidth: 34,
              height: 34,
              borderRadius: 8,
              border: page === currentPage ? '1px solid #1570ef' : '1px solid #d0d5dd',
              background: page === currentPage ? '#eff8ff' : '#fff',
              color: page === currentPage ? '#175cd3' : '#344054',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {page}
          </button>
        ))}

        {showPrevNext && (
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              minWidth: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid #d0d5dd',
              background: currentPage === totalPages ? '#f2f4f7' : '#fff',
              color: currentPage === totalPages ? '#98a2b3' : '#344054',
              fontSize: 13,
              fontWeight: 700,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            {'>>'}
          </button>
        )}
      </div>
    </div>
  );
}

export function getPagination(query, defaults = {}) {
  const page = Math.max(1, Number(query.page) || defaults.page || 1);
  const limit = Math.min(
    defaults.maxLimit || 24,
    Math.max(1, Number(query.limit) || defaults.limit || 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function createPaginatedResponse({ items, total, page, limit }) {
  return {
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

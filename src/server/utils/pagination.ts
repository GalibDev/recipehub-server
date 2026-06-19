export function getPagination(searchParams: URLSearchParams, defaults: { page?: number; limit?: number; maxLimit?: number } = {}) {
  const rawPage = Number.parseInt(searchParams.get('page') || '', 10);
  const rawLimit = Number.parseInt(searchParams.get('limit') || '', 10);
  const page = Math.max(1, Number.isFinite(rawPage) ? rawPage : defaults.page || 1);
  const limit = Math.min(
    defaults.maxLimit || 24,
    Math.max(1, Number.isFinite(rawLimit) ? rawLimit : defaults.limit || 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function createPaginatedResponse<T>({
  items,
  total,
  page,
  limit,
}: {
  items: T[];
  total: number;
  page: number;
  limit: number;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    total,
    page,
    limit,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };
}

import { buildRegexSearch, getFirstQueryValue, parseBoolean, uniqueCsv } from './utils/query';

export function buildRecipeQuery(searchParams: URLSearchParams, includeHidden = false) {
  const filters: Record<string, unknown> = {};

  if (!includeHidden) {
    filters.status = 'published';
  } else if (searchParams.get('status')) {
    filters.status = searchParams.get('status') || undefined;
  }

  const categories = uniqueCsv(getFirstQueryValue(searchParams.get('categories'), searchParams.get('category')));
  const cuisines = uniqueCsv(getFirstQueryValue(searchParams.get('cuisines'), searchParams.get('cuisine')));
  const difficulty = uniqueCsv(
    getFirstQueryValue(searchParams.get('difficultyLevels'), searchParams.get('difficulty'))
  );
  const featured = parseBoolean(searchParams.get('featured'));

  if (categories.length) {
    filters.category = { $in: categories };
  }

  if (cuisines.length) {
    filters.cuisineType = { $in: cuisines };
  }

  if (difficulty.length) {
    filters.difficultyLevel = { $in: difficulty };
  }

  if (featured !== undefined) {
    filters.isFeatured = featured;
  }

  const searchRegex = buildRegexSearch(searchParams.get('search'));

  if (searchRegex) {
    filters.$or = ['recipeName', 'category', 'cuisineType', 'authorName'].map((field) => ({
      [field]: searchRegex,
    }));
  }

  return filters;
}

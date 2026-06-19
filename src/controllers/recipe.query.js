import { buildRegexSearch, getFirstQueryValue, parseBoolean, uniqueCsv } from '../utils/query.js';

export function buildRecipeQuery(query, includeHidden = false) {
  const filters = {};

  if (!includeHidden) {
    filters.status = 'published';
  } else if (query.status) {
    filters.status = query.status;
  }

  const categories = uniqueCsv(getFirstQueryValue(query.categories, query.category));
  const cuisines = uniqueCsv(getFirstQueryValue(query.cuisines, query.cuisine));
  const difficulty = uniqueCsv(getFirstQueryValue(query.difficultyLevels, query.difficulty));
  const featured = parseBoolean(query.featured);

  if (categories.length) {
    filters.category = { $in: categories };
  }

  if (cuisines.length) {
    filters.cuisineType = { $in: cuisines };
  }

  if (difficulty.length) {
    filters.difficultyLevel = { $in: difficulty };
  }

  if (featured === true) {
    filters.isFeatured = true;
  }

  if (featured === false) {
    filters.isFeatured = false;
  }

  if (query.search) {
    const searchRegex = buildRegexSearch(query.search);

    if (!searchRegex) {
      return filters;
    }

    filters.$or = ['recipeName', 'category', 'cuisineType', 'authorName'].map((field) => ({
      [field]: searchRegex,
    }));
  }

  return filters;
}

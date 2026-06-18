import { parseBoolean, splitCsv } from '../utils/query.js';

export function buildRecipeQuery(query, includeHidden = false) {
  const filters = {};

  if (!includeHidden) {
    filters.status = 'published';
  } else if (query.status) {
    filters.status = query.status;
  }

  const categories = splitCsv(query.category);
  const cuisines = splitCsv(query.cuisine);
  const difficulty = splitCsv(query.difficulty);
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
    filters.$or = ['recipeName', 'category', 'cuisineType', 'authorName'].map((field) => ({
      [field]: {
        $regex: String(query.search),
        $options: 'i',
      },
    }));
  }

  return filters;
}

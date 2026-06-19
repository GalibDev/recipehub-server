export function splitCsv(value) {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : String(value).split(',');

  return values
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueCsv(value) {
  return [...new Set(splitCsv(value))];
}

export function escapeRegex(value) {
  return String(value)
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildRegexSearch(value) {
  const search = escapeRegex(value);

  if (!search) {
    return null;
  }

  return {
    $regex: search,
    $options: 'i',
  };
}

export function getFirstQueryValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

export function parseBoolean(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return undefined;
}

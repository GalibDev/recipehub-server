export function splitCsv(value: string | string[] | null | undefined) {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : String(value).split(',');

  return values
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueCsv(value: string | string[] | null | undefined) {
  return [...new Set(splitCsv(value))];
}

export function escapeRegex(value: string) {
  return String(value)
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildRegexSearch(value: string | null) {
  const search = escapeRegex(value || '');

  if (!search) {
    return null;
  }

  return {
    $regex: search,
    $options: 'i',
  };
}

export function parseBoolean(value: string | null) {
  if (value === null) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

export function getFirstQueryValue(...values: Array<string | null>) {
  return values.find((value) => value !== null && value !== '');
}

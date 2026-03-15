const UK_POSTCODE_REGEX =
  /^(GIR\s?0AA|(?:(?:[A-PR-UWYZ][0-9][0-9A-HJKSTUW]?|[A-PR-UWYZ][A-HK-Y][0-9][0-9ABEHMNPRVWXY]?))\s?[0-9][ABD-HJLNP-UW-Z]{2})$/i;

export function normalizeUkPostcode(input: string): string {
  const compact = input.trim().toUpperCase().replace(/\s+/g, "");
  if (compact.length < 5) {
    return compact;
  }

  const outward = compact.slice(0, -3);
  const inward = compact.slice(-3);

  return `${outward} ${inward}`;
}

export function isValidUkPostcode(postcode: string): boolean {
  return UK_POSTCODE_REGEX.test(postcode);
}

export function parseUkPostcode(input: string): {
  normalized: string;
  valid: boolean;
} {
  const normalized = normalizeUkPostcode(input);
  return {
    normalized,
    valid: isValidUkPostcode(normalized),
  };
}

export function normalizeAndValidatePostcodes(
  inputs: string[],
): { normalized: string[]; errors: Array<{ index: number; message: string }> } {
  const normalized: string[] = [];
  const errors: Array<{ index: number; message: string }> = [];

  inputs.forEach((value, index) => {
    const parsed = parseUkPostcode(value);
    if (!parsed.valid) {
      errors.push({
        index,
        message: "Please enter a valid UK postcode.",
      });
      return;
    }

    normalized.push(parsed.normalized);
  });

  return { normalized, errors };
}

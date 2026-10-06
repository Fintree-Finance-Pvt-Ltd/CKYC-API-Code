export function maskIdentifier(val?: string | null): string {
  if (!val) return '';
  const str = String(val).trim();
  if (str.length <= 4) {
    return '****';
  }
  const prefix = str.slice(0, 2);
  const suffix = str.slice(-2);
  const maskedLength = Math.max(str.length - 4, 2);
  return `${prefix}${'*'.repeat(maskedLength)}${suffix}`;
}

export function maskMobile(mobile?: string | null): string {
  if (!mobile) return '';
  const str = String(mobile).trim();
  if (str.length <= 4) return '******';
  return `${str.slice(0, 2)}******${str.slice(-2)}`;
}

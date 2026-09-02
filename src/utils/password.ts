/** IDCloudHost VM password: min 8 chars, at least one lower, upper, and digit. */
export const VM_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const VM_PASSWORD_HINT = 'Min. 8 karakter, huruf besar, huruf kecil, dan angka.';

const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const UPPER = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const ALL = `${LOWER}${UPPER}${DIGITS}`;

function pick(source: string) {
  return source[Math.floor(Math.random() * source.length)];
}

export function isValidVmPassword(value: string) {
  return VM_PASSWORD_PATTERN.test(value);
}

export function generateVmPassword(length = 16) {
  const size = Math.max(8, length);
  const chars = [pick(LOWER), pick(UPPER), pick(DIGITS)];
  while (chars.length < size) chars.push(pick(ALL));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

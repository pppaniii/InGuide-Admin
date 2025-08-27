export function generateId() {
  const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let now = new Date().getTime();
  let timeStampChars = '';
  for (let i = 7; i >= 0; i--) {
    timeStampChars = PUSH_CHARS.charAt(now % 64) + timeStampChars;
    now = Math.floor(now / 64);
  }

  let id = timeStampChars;
  for (let i = 0; i < 12; i++) {
    id += PUSH_CHARS.charAt(Math.floor(Math.random() * 64));
  }
  return id;
}

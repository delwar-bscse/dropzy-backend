// Generate a random tracking ID : #ABC83927
export function generateTrackingId(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const randomLetters = Array.from({ length: 5 }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join("");

  const timestamp = Date.now().toString().slice(-5); // last 5 digits

  return `#${randomLetters}${timestamp}`;
}
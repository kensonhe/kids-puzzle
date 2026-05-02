export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  let attempts = 0;
  const maxAttempts = 100;

  do {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    attempts++;
  } while (
    attempts < maxAttempts &&
    result.filter((v, i) => v !== array[i]).length < Math.ceil(array.length * 0.6)
  );

  return result;
}
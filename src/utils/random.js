export function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sample(values) {
  return values[Math.floor(Math.random() * values.length)];
}

export function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

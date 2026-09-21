export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomIntBetween(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

export function chance(probability) {
  return Math.random() < probability;
}

export function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export function addSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000);
}
let counters = {};

export function generateId(prefix = 'id') {
  if (!counters[prefix]) counters[prefix] = 1;
  return `${prefix}${counters[prefix]++}`;
}
import { apiFamilyLabel } from './taxonomy';

/** Presentation only: keep the changelog dataset and its raw declarations unchanged. */
export function resourceChangePresentation(detail: string) {
  const match = /^Before: (.*?)\. After: (.*?)\.$/s.exec(detail);
  if (!match) return null;
  const entries = (value: string) => (value === 'none recorded' ? [] : value.split(' | '));
  const before = entries(match[1]);
  const after = entries(match[2]);
  const subtract = (from: string[], other: string[]) => {
    const remaining = [...other];
    return from.filter((entry) => {
      const index = remaining.indexOf(entry);
      if (index < 0) return true;
      remaining.splice(index, 1);
      return false;
    });
  };
  const removed = subtract(before, after);
  const added = subtract(after, before);
  const identity = (entry: string) => entry.split(';')[0];
  const updated: string[] = [];
  for (let index = added.length - 1; index >= 0; index--) {
    const oldIndex = removed.findIndex((entry) => identity(entry) === identity(added[index]));
    if (oldIndex >= 0) {
      updated.push(added[index]);
      added.splice(index, 1);
      removed.splice(oldIndex, 1);
    }
  }
  const changes = [
    { entries: added, verb: 'added' },
    { entries: updated, verb: 'updated' },
    { entries: removed, verb: 'removed' },
  ].filter((change) => change.entries.length);
  const count = changes.reduce((total, change) => total + change.entries.length, 0);
  let summary = 'Declarations updated.';
  if (count === 1) {
    const { entries: changed, verb } = changes[0];
    const [family, ...version] = identity(changed[0]).split(' ');
    summary = `${apiFamilyLabel(family)} ${version.join(' ')} ${verb}.`;
  } else if (count > 1) {
    summary = changes.map(({ entries: changed, verb }) => `${changed.length} ${verb}`).join(' · ');
    summary = `${count} declarations changed: ${summary}.`;
  }
  return { summary, before, after };
}

import { describe, expect, it } from 'vitest';
import { participantPageMeta } from '../participant-meta';

const base = {
  name: 'Mercury',
  id: '36b067c3-8017-4144-bb7e-49cf794089c9',
  roles: ['LFI', 'TPP'],
  profileDescription: null as string | null,
  ambiguous: false,
  nameCollides: false,
};

describe('participantPageMeta', () => {
  it('gives production and sandbox pages different titles and descriptions', () => {
    const production = participantPageMeta({ ...base, environment: 'production' });
    const sandbox = participantPageMeta({ ...base, environment: 'sandbox' });
    expect(production.title).toBe('Mercury');
    expect(sandbox.title).toBe('Mercury (Sandbox)');
    expect(production.description).not.toBe(sandbox.description);
    expect(production.description).toContain(
      'Production registration 36b067c3-8017-4144-bb7e-49cf794089c9'
    );
    expect(sandbox.description).toContain(
      'Sandbox registration 36b067c3-8017-4144-bb7e-49cf794089c9'
    );
  });

  it('disambiguates registrations that share a display name', () => {
    const first = participantPageMeta({
      ...base,
      environment: 'production',
      nameCollides: true,
    });
    const second = participantPageMeta({
      ...base,
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      environment: 'production',
      nameCollides: true,
    });
    expect(first.title).toBe('Mercury (36b067c3)');
    expect(second.title).toBe('Mercury (aaaaaaaa)');
    expect(first.title).not.toBe(second.title);
  });

  it('describes a name chooser without pretending it is one registration', () => {
    const chooser = participantPageMeta({
      ...base,
      environment: 'production',
      ambiguous: true,
      nameCollides: true,
    });
    expect(chooser.title).toBe('Mercury registrations');
    expect(chooser.description).toContain('more than one production directory registration');
  });
});

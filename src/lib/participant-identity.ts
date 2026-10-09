export interface RegistrationIdentity {
  id: string;
  name: string;
  shortName?: string;
}

export function participantUrl(
  registration: Pick<RegistrationIdentity, 'id'>,
  environment: 'production' | 'sandbox' = 'production'
): string {
  const base = environment === 'sandbox' ? '/observatory/sandbox' : '/observatory';
  return `${base}/participant/${encodeURIComponent(registration.id)}`;
}

/** ID pages are stable. Old name URLs redirect, or offer a choice when names collide. */
export function participantPaths<T extends RegistrationIdentity>(
  registrations: T[],
  environment: 'production' | 'sandbox'
) {
  const paths = registrations.map((registration) => ({
    params: { slug: registration.id },
    props: { matches: [registration], redirectTo: undefined as string | undefined },
  }));
  const ids = new Set(registrations.map((registration) => registration.id));
  const aliases = new Map<string, T[]>();
  for (const registration of registrations) {
    const slug = (registration.shortName || registration.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!slug || ids.has(slug)) continue;
    aliases.set(slug, [...(aliases.get(slug) || []), registration]);
  }
  for (const [slug, matches] of aliases) {
    paths.push({
      params: { slug },
      props: {
        matches,
        redirectTo: matches.length === 1 ? participantUrl(matches[0], environment) : undefined,
      },
    });
  }
  return paths;
}

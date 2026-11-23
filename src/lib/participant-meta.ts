export interface ParticipantMetaInput {
  name: string;
  id: string;
  roles: string[];
  environment: 'production' | 'sandbox';
  profileDescription?: string | null;
  /** Name-slug page that lists more than one registration. */
  ambiguous: boolean;
  /** Another registration in this environment uses the same display name. */
  nameCollides: boolean;
}

export function participantPageMeta(input: ParticipantMetaInput): {
  title: string;
  description: string;
} {
  const envLabel = input.environment === 'sandbox' ? 'Sandbox' : 'Production';
  const envWord = envLabel.toLowerCase();

  if (input.ambiguous) {
    const title =
      input.environment === 'sandbox'
        ? `${input.name} registrations (Sandbox)`
        : `${input.name} registrations`;
    return {
      title,
      description: `${input.name} has more than one ${envWord} directory registration in UAE Open Finance. Choose a registration to see its published roles and API metadata.`,
    };
  }

  const idSuffix = input.nameCollides ? ` (${input.id.slice(0, 8)})` : '';
  const title =
    input.environment === 'sandbox'
      ? `${input.name}${idSuffix} (Sandbox)`
      : `${input.name}${idSuffix}`;

  const identity = `${envLabel} registration ${input.id}`;
  const profile = input.profileDescription?.trim().replace(/\s+/g, ' ');
  const description = profile
    ? `${identity}. ${profile}`
    : `${identity}. ${input.name} is listed in the UAE Open Finance ${envWord} directory with roles: ${input.roles.join(', ') || 'not published'}.`;

  return { title, description };
}

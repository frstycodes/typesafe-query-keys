import type { core } from 'zod/v4'

export function zodIssuesToString(issues: core.$ZodIssue[]) {
  return issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
}

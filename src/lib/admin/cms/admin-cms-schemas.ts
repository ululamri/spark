import { z } from 'zod';

export const adminCmsKindSchema = z.enum(['core_lesson', 'lab']);
export const adminCmsStatusSchema = z.enum(['draft', 'review', 'published', 'archived']);
export const adminCmsInitialStatusSchema = z.enum(['draft', 'review']);

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Slug must be at least 3 characters.')
  .max(120, 'Slug must be at most 120 characters.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and single hyphens only.');

const titleSchema = z
  .string()
  .trim()
  .min(3, 'Title must be at least 3 characters.')
  .max(180, 'Title must be at most 180 characters.')
  .refine((value) => !/[\u0000-\u001f]/.test(value), 'Title cannot contain control characters.');

const optionalTextSchema = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters.`)
    .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), `${label} cannot contain control characters.`)
    .optional()
    .transform((value) => (value && value.length ? value : undefined));

export const adminCmsDraftSchema = z.object({
  kind: adminCmsKindSchema,
  slug: slugSchema,
  title: titleSchema,
  summary: optionalTextSchema(500, 'Summary'),
  body: optionalTextSchema(20_000, 'Body seed'),
  status: adminCmsInitialStatusSchema.default('draft')
});

export type AdminCmsDraftInput = z.infer<typeof adminCmsDraftSchema>;

export function parseAdminCmsDraftForm(formData: FormData) {
  return adminCmsDraftSchema.safeParse({
    kind: formData.get('kind'),
    slug: formData.get('slug'),
    title: formData.get('title'),
    summary: formData.get('summary') ?? undefined,
    body: formData.get('body') ?? undefined,
    status: formData.get('status') ?? 'draft'
  });
}

export function adminCmsDraftError(result: z.SafeParseError<unknown>) {
  return result.error.issues.map((issue) => issue.message).join(' ');
}

export function buildAdminCmsDraftPayload(input: AdminCmsDraftInput) {
  return {
    title: input.title,
    body: input.body ?? '',
    blocks: input.kind === 'core_lesson' ? [] : undefined,
    steps: input.kind === 'lab' ? [] : undefined,
    source: 'admin_ui',
    schema_version: 1
  } satisfies Record<string, unknown>;
}

import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminCmsApi } from '$lib/admin/admin-cms-api';
import { adminCmsDraftError, buildAdminCmsDraftPayload, parseAdminCmsDraftForm } from '$lib/admin/cms/admin-cms-schemas';
import { guardAdminRoute } from '$lib/server/admin-access';

function pick(searchParams: URLSearchParams, key: string, allowed: string[], fallback = 'all') {
  const value = searchParams.get(key)?.trim() || fallback;
  return allowed.includes(value) ? value : fallback;
}

function cleanQuery(searchParams: URLSearchParams) {
  const value = searchParams.get('q')?.trim() || '';
  if (value.length > 80 || /[\u0000-\u001f]/.test(value)) return '';
  return value;
}

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });

  const filters = {
    kind: pick(event.url.searchParams, 'kind', ['all', 'core_lesson', 'lab']),
    status: pick(event.url.searchParams, 'status', ['all', 'draft', 'review', 'published', 'archived']),
    q: cleanQuery(event.url.searchParams)
  };

  try {
    const response = await adminCmsApi.items(event.fetch, { ...filters, limit: 50 }, access.requestContext);
    return {
      filters,
      cms: response.data,
      canCreate: access.actor.capabilities.includes('content_create'),
      canEdit: access.actor.capabilities.includes('content_edit'),
      canPublish: access.actor.capabilities.includes('content_publish'),
      canArchive: access.actor.capabilities.includes('content_archive'),
      apiError: null
    };
  } catch (error) {
    return {
      filters,
      cms: null,
      canCreate: access.actor.capabilities.includes('content_create'),
      canEdit: access.actor.capabilities.includes('content_edit'),
      canPublish: access.actor.capabilities.includes('content_publish'),
      canArchive: access.actor.capabilities.includes('content_archive'),
      apiError: adminErrorMessage(error)
    };
  }
};

export const actions: Actions = {
  createDraft: async (event) => {
    const access = await guardAdminRoute(event);
    if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });
    if (!access.actor.capabilities.includes('content_create')) return fail(403, { error: 'This admin role cannot create CMS drafts.' });

    const formData = await event.request.formData();
    const parsed = parseAdminCmsDraftForm(formData);
    if (!parsed.success) return fail(400, { error: adminCmsDraftError(parsed) });

    const input = parsed.data;

    try {
      const response = await adminCmsApi.createItem(
        event.fetch,
        {
          kind: input.kind,
          slug: input.slug,
          title: input.title,
          status: input.status,
          summary: input.summary ?? 'Initial CMS draft created from admin UI.',
          payload: buildAdminCmsDraftPayload(input)
        },
        access.requestContext
      );
      return { success: `Draft created: ${response.data.item.title}.` };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  }
};

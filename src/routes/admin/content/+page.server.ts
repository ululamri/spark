import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminCmsApi } from '$lib/admin/admin-cms-api';
import { guardAdminRoute } from '$lib/server/admin-access';

function textFromForm(formData: FormData, key: string) {
  const value = String(formData.get(key) || '').trim();
  return value.length ? value : undefined;
}

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
    const kind = textFromForm(formData, 'kind');
    const slug = textFromForm(formData, 'slug');
    const title = textFromForm(formData, 'title');
    if (!kind || !slug || !title) return fail(400, { error: 'Kind, slug, and title are required.' });

    try {
      const response = await adminCmsApi.createItem(
        event.fetch,
        {
          kind,
          slug,
          title,
          status: 'draft',
          summary: textFromForm(formData, 'summary') ?? 'Initial CMS draft created from admin UI.',
          payload: {
            title,
            body: textFromForm(formData, 'body') ?? '',
            source: 'admin_ui'
          }
        },
        access.requestContext
      );
      return { success: `Draft created: ${response.data.item.title}.` };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  }
};

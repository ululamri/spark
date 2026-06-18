import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { findAdminLessonCatalog } from '$lib/admin/admin-data';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  try {
    const response = await adminApi.lessons(event.fetch, access.requestContext ?? undefined);
    const lessons = response.data.items.map((item) => {
      const catalog = findAdminLessonCatalog(item.slug);
      return {
        ...item,
        title: item.title || catalog?.title || item.slug,
        status: item.status || catalog?.status || 'observed',
        moduleTitle: catalog?.moduleTitle || item.estimated_level || 'Observed progress',
        estimatedMinutes: catalog?.estimatedMinutes ?? null,
        previewHref: catalog?.previewHref || null
      };
    });
    return { lessons, dataSource: response.data.data_source, catalogStatus: response.data.catalog_status, apiError: null };
  } catch (err) {
    return { lessons: [], dataSource: null, catalogStatus: null, apiError: adminErrorMessage(err) };
  }
};

import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { findAdminLabCatalog } from '$lib/admin/admin-data';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await adminApi.lab(fetch);
    const modules = response.data.modules.map((item) => {
      const catalog = findAdminLabCatalog(item.module_id);
      return { ...item, catalog };
    });
    return { modules, recentEvents: response.data.recent_lab_events, dataSource: response.data.data_source, apiError: null };
  } catch (error) {
    return { modules: [], recentEvents: [], dataSource: null, apiError: adminErrorMessage(error) };
  }
};

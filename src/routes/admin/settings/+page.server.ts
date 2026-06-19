import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { adminTeamApi } from '$lib/admin/admin-team-api';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });

  const [systemResult, actorResult, rolesResult] = await Promise.allSettled([
    adminApi.system(event.fetch, access.requestContext),
    adminTeamApi.actor(event.fetch, access.requestContext),
    adminTeamApi.capabilities(event.fetch, access.requestContext)
  ]);

  return {
    actor: access.actor,
    system: systemResult.status === 'fulfilled' ? systemResult.value.data : null,
    backendActor: actorResult.status === 'fulfilled' ? actorResult.value.data : null,
    roles: rolesResult.status === 'fulfilled' ? rolesResult.value.data : [],
    apiError: [systemResult, actorResult, rolesResult]
      .filter((result) => result.status === 'rejected')
      .map((result) => adminErrorMessage((result as PromiseRejectedResult).reason))
      .at(0) ?? null
  };
};

export const actions: Actions = {
  runDiagnostics: async (event) => {
    const access = await guardAdminRoute(event);
    if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });

    try {
      const [system, actor] = await Promise.all([
        adminApi.system(event.fetch, access.requestContext),
        adminTeamApi.actor(event.fetch, access.requestContext)
      ]);
      return {
        success: `Diagnostics OK: ${system.data.service_name}, database ${system.data.database_connectivity_status}, role ${actor.data.role}.`
      };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  }
};

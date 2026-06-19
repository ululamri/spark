import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage, type AdminSystem } from '$lib/admin/admin-api';
import { adminTeamApi } from '$lib/admin/admin-team-api';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });

  const systemPromise: Promise<AdminSystem | null> = access.actor.mode === 'superadmin'
    ? adminApi.system(event.fetch, access.requestContext).then((response) => response.data)
    : Promise.resolve(null);

  const [systemResult, actorResult, rolesResult] = await Promise.allSettled([
    systemPromise,
    adminTeamApi.actor(event.fetch, access.requestContext),
    adminTeamApi.capabilities(event.fetch, access.requestContext)
  ]);

  return {
    actor: access.actor,
    system: systemResult.status === 'fulfilled' ? systemResult.value : null,
    systemRestricted: access.actor.mode !== 'superadmin',
    backendActor: actorResult.status === 'fulfilled' ? actorResult.value.data : null,
    roles: rolesResult.status === 'fulfilled' ? rolesResult.value.data : [],
    apiError: [actorResult, rolesResult]
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
      const actor = await adminTeamApi.actor(event.fetch, access.requestContext);
      if (access.actor.mode !== 'superadmin') {
        return { success: `Diagnostics OK: delegated role ${actor.data.role}; root-only system diagnostics are hidden for this role.` };
      }
      const system = await adminApi.system(event.fetch, access.requestContext);
      return {
        success: `Diagnostics OK: ${system.data.service_name}, database ${system.data.database_connectivity_status}, role ${actor.data.role}.`
      };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  }
};

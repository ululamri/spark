import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { adminSocialOpsApi } from '$lib/admin/admin-social-ops-api';

function idsFromForm(formData: FormData, key = 'target_ids') {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function textFromForm(formData: FormData, key: string) {
  const value = String(formData.get(key) || '').trim();
  return value.length ? value : undefined;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === 'on' || formData.get(key) === 'true';
}

export const load: PageServerLoad = async ({ fetch }) => {
  const [reportsResult, postsResult, commentsResult, signalsResult, bulkJobsResult] = await Promise.allSettled([
    adminApi.socialReports(fetch, { limit: 50, status: 'pending' }),
    adminApi.socialPosts(fetch, { limit: 50 }),
    adminApi.socialComments(fetch, { limit: 50 }),
    adminApi.mlSignals(fetch, { limit: 50 }),
    adminSocialOpsApi.bulkJobs(fetch, { limit: 25 })
  ]);

  return {
    reports: reportsResult.status === 'fulfilled' ? reportsResult.value.data : null,
    posts: postsResult.status === 'fulfilled' ? postsResult.value.data : null,
    comments: commentsResult.status === 'fulfilled' ? commentsResult.value.data : null,
    signals: signalsResult.status === 'fulfilled' ? signalsResult.value.data : null,
    bulkJobs: bulkJobsResult.status === 'fulfilled' ? bulkJobsResult.value.data : null,
    apiError: [reportsResult, postsResult, commentsResult, signalsResult, bulkJobsResult]
      .filter((result) => result.status === 'rejected')
      .map((result) => adminErrorMessage((result as PromiseRejectedResult).reason))
      .at(0) ?? null
  };
};

export const actions: Actions = {
  scanTarget: async ({ request, fetch }) => {
    const formData = await request.formData();
    const targetType = textFromForm(formData, 'target_type');
    const targetId = textFromForm(formData, 'target_id');
    if (!targetType || !targetId) return fail(400, { error: 'Target type and target ID are required.' });

    try {
      const response = await adminApi.mlScan(fetch, {
        target_type: targetType,
        target_id: targetId,
        use_local_ai: checked(formData, 'use_local_ai'),
        use_external_fallback: checked(formData, 'use_external_fallback'),
        note: textFromForm(formData, 'note')
      });
      return {
        success: `ML signal created for ${response.data.signal.target_type} ${response.data.signal.target_id}. Status: ${response.data.signal.status}.`,
        signalId: response.data.signal.id
      };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  },

  markSignalReviewed: async ({ request, fetch }) => {
    const formData = await request.formData();
    const signalId = textFromForm(formData, 'signal_id');
    if (!signalId) return fail(400, { error: 'Signal ID is required.' });

    try {
      await adminApi.markMlSignalReviewed(fetch, signalId, { note: textFromForm(formData, 'note') });
      return { success: 'ML moderation signal marked as reviewed.' };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  },

  bulkPosts: async ({ request, fetch }) => {
    const formData = await request.formData();
    const targetIds = idsFromForm(formData);
    if (!targetIds.length) return fail(400, { error: 'Select at least one post.' });

    const action = textFromForm(formData, 'action') || 'hide';
    try {
      const response = await adminApi.bulkModeration(fetch, {
        target_type: 'post',
        action,
        target_ids: targetIds,
        reason: textFromForm(formData, 'reason'),
        dry_run: checked(formData, 'dry_run'),
        idempotency_key: `ui-post-${action}-${Date.now()}`,
        payload: { source: 'admin_ui_pass_17g' }
      });
      return {
        success: `Bulk post job ${response.data.job.status}: ${response.data.job.applied_count} applied, ${response.data.job.would_apply_count} would apply, ${response.data.job.skipped_count} skipped, ${response.data.job.failed_count} failed.`,
        bulkJobId: response.data.job.id
      };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  },

  bulkComments: async ({ request, fetch }) => {
    const formData = await request.formData();
    const targetIds = idsFromForm(formData);
    if (!targetIds.length) return fail(400, { error: 'Select at least one comment.' });

    const action = textFromForm(formData, 'action') || 'hide';
    try {
      const response = await adminApi.bulkModeration(fetch, {
        target_type: 'comment',
        action,
        target_ids: targetIds,
        reason: textFromForm(formData, 'reason'),
        dry_run: checked(formData, 'dry_run'),
        idempotency_key: `ui-comment-${action}-${Date.now()}`,
        payload: { source: 'admin_ui_pass_17g' }
      });
      return {
        success: `Bulk comment job ${response.data.job.status}: ${response.data.job.applied_count} applied, ${response.data.job.would_apply_count} would apply, ${response.data.job.skipped_count} skipped, ${response.data.job.failed_count} failed.`,
        bulkJobId: response.data.job.id
      };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  },

  bulkReports: async ({ request, fetch }) => {
    const formData = await request.formData();
    const targetIds = idsFromForm(formData);
    if (!targetIds.length) return fail(400, { error: 'Select at least one report.' });

    const action = textFromForm(formData, 'action') || 'mark_reviewed';
    try {
      const response = await adminApi.bulkModeration(fetch, {
        target_type: 'report',
        action,
        target_ids: targetIds,
        reason: textFromForm(formData, 'reason'),
        dry_run: checked(formData, 'dry_run'),
        idempotency_key: `ui-report-${action}-${Date.now()}`,
        payload: { source: 'admin_ui_pass_17g' }
      });
      return {
        success: `Bulk report job ${response.data.job.status}: ${response.data.job.applied_count} applied, ${response.data.job.would_apply_count} would apply, ${response.data.job.skipped_count} skipped, ${response.data.job.failed_count} failed.`,
        bulkJobId: response.data.job.id
      };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  }
};

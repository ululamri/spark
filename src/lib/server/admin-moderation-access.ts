import { fail } from '@sveltejs/kit';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { adminSocialOpsApi } from '$lib/admin/admin-social-ops-api';
import { requireAdminAccess } from '$lib/server/admin-access';

export function idsFromAdminForm(formData: FormData, key = 'target_ids') {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export function textFromAdminForm(formData: FormData, key: string) {
  const value = String(formData.get(key) || '').trim();
  return value.length ? value : undefined;
}

export function checkedAdminForm(formData: FormData, key: string) {
  return formData.get(key) === 'on' || formData.get(key) === 'true';
}

export function pickAdminFilter(searchParams: URLSearchParams, key: string, allowed: string[], fallback = 'all') {
  const value = searchParams.get(key)?.trim() || fallback;
  return allowed.includes(value) ? value : fallback;
}

function apiFilter(value: string) {
  return value && value !== 'all' ? value : undefined;
}

export async function loadModerationAdminSurface(event: { fetch: typeof fetch; request: Request; cookies: { get(name: string): string | undefined }; url: URL }) {
  const { fetch, url } = event;
  const context = await requireAdminAccess(event, 'moderation_read');
  const filters = {
    reportStatus: pickAdminFilter(url.searchParams, 'report_status', ['all', 'pending', 'reviewed', 'dismissed', 'actioned'], 'pending'),
    reportTargetType: pickAdminFilter(url.searchParams, 'report_target_type', ['all', 'post', 'comment']),
    postStatus: pickAdminFilter(url.searchParams, 'post_status', ['all', 'published', 'hidden', 'removed', 'deleted']),
    commentStatus: pickAdminFilter(url.searchParams, 'comment_status', ['all', 'published', 'hidden', 'removed', 'deleted']),
    signalStatus: pickAdminFilter(url.searchParams, 'signal_status', ['all', 'clean', 'needs_review', 'high_risk', 'blocked_pending_review']),
    signalTargetType: pickAdminFilter(url.searchParams, 'signal_target_type', ['all', 'post', 'comment']),
    jobStatus: pickAdminFilter(url.searchParams, 'job_status', ['all', 'running', 'dry_run', 'completed', 'partial_failed', 'failed']),
    jobTargetType: pickAdminFilter(url.searchParams, 'job_target_type', ['all', 'post', 'comment', 'report'])
  };

  const [reportsResult, postsResult, commentsResult, signalsResult, bulkJobsResult] = await Promise.allSettled([
    adminApi.socialReports(fetch, { limit: 50, status: apiFilter(filters.reportStatus), target_type: apiFilter(filters.reportTargetType) }, context),
    adminApi.socialPosts(fetch, { limit: 50, status: apiFilter(filters.postStatus) }, context),
    adminApi.socialComments(fetch, { limit: 50, status: apiFilter(filters.commentStatus) }, context),
    adminApi.mlSignals(fetch, { limit: 50, status: apiFilter(filters.signalStatus), target_type: apiFilter(filters.signalTargetType) }, context),
    adminSocialOpsApi.bulkJobs(fetch, { limit: 25, status: apiFilter(filters.jobStatus), target_type: apiFilter(filters.jobTargetType) }, context)
  ]);

  return {
    filters,
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
}

export async function runModerationScan(event: { request: Request; fetch: typeof fetch; cookies: { get(name: string): string | undefined } }) {
  const { request, fetch } = event;
  const context = await requireAdminAccess(event, 'ml_moderation_manage');
  const formData = await request.formData();
  const targetType = textFromAdminForm(formData, 'target_type');
  const targetId = textFromAdminForm(formData, 'target_id');
  if (!targetType || !targetId) return fail(400, { error: 'Target type and target ID are required.' });

  try {
    const response = await adminApi.mlScan(
      fetch,
      {
        target_type: targetType,
        target_id: targetId,
        use_local_ai: checkedAdminForm(formData, 'use_local_ai'),
        use_external_fallback: checkedAdminForm(formData, 'use_external_fallback'),
        note: textFromAdminForm(formData, 'note')
      },
      context
    );
    return { success: `ML signal created for ${response.data.signal.target_type} ${response.data.signal.target_id}. Status: ${response.data.signal.status}.`, signalId: response.data.signal.id };
  } catch (error) {
    return fail(400, { error: adminErrorMessage(error) });
  }
}

export async function markModerationSignalReviewed(event: { request: Request; fetch: typeof fetch; cookies: { get(name: string): string | undefined } }) {
  const { request, fetch } = event;
  const context = await requireAdminAccess(event, 'ml_moderation_manage');
  const formData = await request.formData();
  const signalId = textFromAdminForm(formData, 'signal_id');
  if (!signalId) return fail(400, { error: 'Signal ID is required.' });

  try {
    await adminApi.markMlSignalReviewed(fetch, signalId, { note: textFromAdminForm(formData, 'note') }, context);
    return { success: 'ML moderation signal marked as reviewed.' };
  } catch (error) {
    return fail(400, { error: adminErrorMessage(error) });
  }
}

export async function runBulkModeration(event: { request: Request; fetch: typeof fetch; cookies: { get(name: string): string | undefined } }, targetType: 'post' | 'comment' | 'report') {
  const { request, fetch } = event;
  const context = await requireAdminAccess(event, 'moderation_bulk');
  const formData = await request.formData();
  const targetIds = idsFromAdminForm(formData);
  if (!targetIds.length) return fail(400, { error: `Select at least one ${targetType}.` });

  const action = textFromAdminForm(formData, 'action') || (targetType === 'report' ? 'mark_reviewed' : 'hide');
  try {
    const response = await adminApi.bulkModeration(
      fetch,
      {
        target_type: targetType,
        action,
        target_ids: targetIds,
        reason: textFromAdminForm(formData, 'reason'),
        dry_run: checkedAdminForm(formData, 'dry_run'),
        idempotency_key: `ui-${targetType}-${action}-${Date.now()}`,
        payload: { source: 'admin_ui_pass_19c' }
      },
      context
    );
    return { success: `Bulk ${targetType} job ${response.data.job.status}: ${response.data.job.applied_count} applied, ${response.data.job.would_apply_count} would apply, ${response.data.job.skipped_count} skipped, ${response.data.job.failed_count} failed.`, bulkJobId: response.data.job.id };
  } catch (error) {
    return fail(400, { error: adminErrorMessage(error) });
  }
}

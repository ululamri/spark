<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data, form } = $props();

  const filters = $derived(data.filters);
  const signalItems = $derived(data.signals?.items ?? []);
  const postItems = $derived(data.posts?.items ?? []);
  const commentItems = $derived(data.comments?.items ?? []);
  const reportItems = $derived(data.reports?.items ?? []);
  const bulkJobItems = $derived(data.bulkJobs?.items ?? []);
  const pendingSignalCount = $derived(signalItems.filter((item) => !item.reviewed_at && item.status !== 'clean').length);
  const highRiskCount = $derived(signalItems.filter((item) => item.status === 'high_risk' || item.status === 'blocked_pending_review').length);
  const pendingReportCount = $derived(reportItems.filter((item) => item.status === 'pending').length);
  const failedBulkJobCount = $derived(bulkJobItems.filter((item) => item.status === 'failed' || item.status === 'partial_failed').length);

  const metrics = $derived([
    { id: 'ml-signals', label: 'ML signals', value: signalItems.length, detail: 'Latest signal rows from the backend ML moderation pipeline.', state: 'available' as const },
    { id: 'high-risk-signals', label: 'High-risk signals', value: highRiskCount, detail: 'Signals marked high_risk or blocked_pending_review.', state: 'available' as const },
    { id: 'reports', label: 'Pending reports', value: pendingReportCount, detail: 'User reports waiting for moderation handling.', state: 'available' as const },
    { id: 'bulk-jobs', label: 'Bulk jobs', value: bulkJobItems.length, detail: `Recent moderation jobs; ${failedBulkJobCount} need attention.`, state: 'available' as const }
  ]);

  function tone(status: string) {
    if (['clean', 'allow', 'published', 'completed', 'dry_run', 'reviewed', 'dismissed', 'available'].includes(status)) return 'success' as const;
    if (['needs_review', 'pending', 'hidden', 'high_risk', 'review', 'running', 'partial_failed'].includes(status)) return 'warning' as const;
    if (['blocked_pending_review', 'block', 'removed', 'deleted', 'failed'].includes(status)) return 'danger' as const;
    return 'neutral' as const;
  }

  function shortId(value: string) {
    return value ? value.slice(0, 8) : '—';
  }

  function preview(value: string, max = 150) {
    if (!value) return '—';
    return value.length > max ? value.slice(0, max).trim() + '…' : value;
  }
</script>

<svelte:head><title>Social moderation - Karyra Spark Admin</title></svelte:head>

<AdminHeader
  title="Social moderation"
  description="Human-in-the-loop moderation queue for reports, ML signals, bulk actions, and operations history."
>
  {#snippet actions()}
    <a class="admin-button--secondary" href="/komunitas" target="_blank" rel="noreferrer">Open community</a>
  {/snippet}
</AdminHeader>

{#if form?.success}
  <div class="admin-note admin-note--success">{form.success}</div>
{:else if form?.error}
  <div class="admin-note admin-note--danger">{form.error}</div>
{/if}

{#if data.apiError}
  <AdminEmptyState state="error" title="Moderation API warning" detail={data.apiError} />
{/if}

<div class="admin-stat-grid">
  {#each metrics as metric}
    <AdminStatCard {...metric} />
  {/each}
</div>

<AdminSectionCard eyebrow="Workflow" title="Filter moderation queues" description="Filters are stored in the URL, so reload and shared links keep the same operator view.">
  <form class="admin-moderation-form" method="GET" action="/admin/moderation">
    <div class="admin-filter-row">
      <label>
        ML status
        <select name="signal_status">
          <option value="all" selected={filters.signalStatus === 'all'}>All signals</option>
          <option value="clean" selected={filters.signalStatus === 'clean'}>Clean</option>
          <option value="needs_review" selected={filters.signalStatus === 'needs_review'}>Needs review</option>
          <option value="high_risk" selected={filters.signalStatus === 'high_risk'}>High risk</option>
          <option value="blocked_pending_review" selected={filters.signalStatus === 'blocked_pending_review'}>Blocked pending review</option>
        </select>
      </label>
      <label>
        ML target
        <select name="signal_target_type">
          <option value="all" selected={filters.signalTargetType === 'all'}>All targets</option>
          <option value="post" selected={filters.signalTargetType === 'post'}>Post</option>
          <option value="comment" selected={filters.signalTargetType === 'comment'}>Comment</option>
        </select>
      </label>
      <label>
        Job status
        <select name="job_status">
          <option value="all" selected={filters.jobStatus === 'all'}>All jobs</option>
          <option value="running" selected={filters.jobStatus === 'running'}>Running</option>
          <option value="dry_run" selected={filters.jobStatus === 'dry_run'}>Dry-run</option>
          <option value="completed" selected={filters.jobStatus === 'completed'}>Completed</option>
          <option value="partial_failed" selected={filters.jobStatus === 'partial_failed'}>Partial failed</option>
          <option value="failed" selected={filters.jobStatus === 'failed'}>Failed</option>
        </select>
      </label>
      <label>
        Job target
        <select name="job_target_type">
          <option value="all" selected={filters.jobTargetType === 'all'}>All targets</option>
          <option value="post" selected={filters.jobTargetType === 'post'}>Post</option>
          <option value="comment" selected={filters.jobTargetType === 'comment'}>Comment</option>
          <option value="report" selected={filters.jobTargetType === 'report'}>Report</option>
        </select>
      </label>
    </div>
    <div class="admin-filter-row">
      <label>
        Report status
        <select name="report_status">
          <option value="all" selected={filters.reportStatus === 'all'}>All reports</option>
          <option value="pending" selected={filters.reportStatus === 'pending'}>Pending</option>
          <option value="reviewed" selected={filters.reportStatus === 'reviewed'}>Reviewed</option>
          <option value="dismissed" selected={filters.reportStatus === 'dismissed'}>Dismissed</option>
          <option value="actioned" selected={filters.reportStatus === 'actioned'}>Actioned</option>
        </select>
      </label>
      <label>
        Report target
        <select name="report_target_type">
          <option value="all" selected={filters.reportTargetType === 'all'}>All targets</option>
          <option value="post" selected={filters.reportTargetType === 'post'}>Post</option>
          <option value="comment" selected={filters.reportTargetType === 'comment'}>Comment</option>
        </select>
      </label>
      <label>
        Post status
        <select name="post_status">
          <option value="all" selected={filters.postStatus === 'all'}>All posts</option>
          <option value="published" selected={filters.postStatus === 'published'}>Published</option>
          <option value="hidden" selected={filters.postStatus === 'hidden'}>Hidden</option>
          <option value="removed" selected={filters.postStatus === 'removed'}>Removed</option>
          <option value="deleted" selected={filters.postStatus === 'deleted'}>Deleted</option>
        </select>
      </label>
      <label>
        Comment status
        <select name="comment_status">
          <option value="all" selected={filters.commentStatus === 'all'}>All comments</option>
          <option value="published" selected={filters.commentStatus === 'published'}>Published</option>
          <option value="hidden" selected={filters.commentStatus === 'hidden'}>Hidden</option>
          <option value="removed" selected={filters.commentStatus === 'removed'}>Removed</option>
          <option value="deleted" selected={filters.commentStatus === 'deleted'}>Deleted</option>
        </select>
      </label>
    </div>
    <div class="admin-filter-row">
      <button class="admin-button" type="submit">Apply filters</button>
      <a class="admin-button--secondary" href="/admin/moderation">Reset filters</a>
    </div>
  </form>
</AdminSectionCard>

<div class="admin-card-grid">
  <AdminSectionCard eyebrow="ML moderation" title="Scan target" description="Create a new ML/rule signal for one post or comment. This does not hide, remove, or restore content.">
    <form class="admin-moderation-form" method="POST" action="?/scanTarget">
      <label>
        Target type
        <select name="target_type" required>
          <option value="post">Post</option>
          <option value="comment">Comment</option>
        </select>
      </label>
      <label>
        Target ID
        <input name="target_id" placeholder="UUID" required />
      </label>
      <label>
        Operator note
        <input name="note" placeholder="Why this scan is being created" />
      </label>
      <div class="admin-checkbox-row">
        <label><input type="checkbox" name="use_local_ai" /> Use local AI if enabled</label>
        <label><input type="checkbox" name="use_external_fallback" /> Use external fallback</label>
      </div>
      <button class="admin-button" type="submit">Create ML signal</button>
    </form>
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Safety boundary" title="No automatic action" description="PASS 17J adds queue filters without changing the human approval model.">
    <ul class="admin-checklist">
      <li>ML signal scan does not mutate content status.</li>
      <li>Bulk actions require explicit checkbox selection and form submit.</li>
      <li>Operations history and job detail are read-only views over persisted backend jobs.</li>
    </ul>
  </AdminSectionCard>
</div>

<AdminSectionCard eyebrow="Operations" title="Recent bulk moderation jobs" description="Read-only operational history for PASS 17E bulk moderation jobs. Open a job to inspect each target result.">
  {#if bulkJobItems.length}
    <AdminTable caption="Recent bulk moderation jobs" columns={['Job', 'Target', 'Result', 'Actor', 'Created']}>
      {#each bulkJobItems as job}
        <tr>
          <td>
            <a href={'/admin/moderation/jobs/' + job.id}><strong>{shortId(job.id)}</strong></a><br />
            <span class="admin-muted">{job.action} · {job.dry_run ? 'dry-run' : 'live action'}</span>
          </td>
          <td>
            <span class="admin-code">{job.target_type}</span><br />
            <span class="admin-muted">{job.total_count} targets</span>
          </td>
          <td>
            <AdminStatusBadge label={job.status} tone={tone(job.status)} />
            <div class="admin-muted">
              {job.applied_count} applied · {job.would_apply_count} would apply · {job.skipped_count} skipped · {job.failed_count} failed
            </div>
          </td>
          <td>
            {job.actor_kind}<br />
            <span class="admin-muted">{job.actor_user_id ? shortId(job.actor_user_id) : 'legacy root'}</span>
          </td>
          <td>
            {job.created_at}<br />
            <span class="admin-muted">{job.completed_at || 'not completed'}</span>
          </td>
        </tr>
      {/each}
    </AdminTable>
  {:else}
    <AdminEmptyState title="No bulk jobs match filters" detail="Adjust filters or run a dry-run bulk action from this page." />
  {/if}
</AdminSectionCard>

<AdminSectionCard eyebrow="ML queue" title="Moderation signals" description="Signals generated by rules/local AI/external moderation. Marking reviewed only records human review; it does not apply content action.">
  {#if signalItems.length}
    <AdminTable caption="ML moderation signals" columns={['Signal', 'Target', 'Risk', 'Summary', 'Review']}>
      {#each signalItems as signal}
        <tr>
          <td>
            <strong>{shortId(signal.id)}</strong><br />
            <span class="admin-muted">{signal.created_at}</span>
          </td>
          <td>
            <span class="admin-code">{signal.target_type}</span><br />
            <span class="admin-muted">{shortId(signal.target_id)}</span>
          </td>
          <td>
            <AdminStatusBadge label={signal.status} tone={tone(signal.status)} />
            <div class="admin-muted">{signal.decision} · {signal.severity} · {Math.round(signal.score * 100)}%</div>
            {#if signal.categories.length}<div class="admin-muted">{signal.categories.join(', ')}</div>{/if}
          </td>
          <td>
            <strong>{signal.recommendation}</strong><br />
            <span class="admin-muted">{preview(signal.summary, 180)}</span>
          </td>
          <td>
            {#if signal.reviewed_at}
              <AdminStatusBadge label="reviewed" tone="success" />
              <div class="admin-muted">{signal.reviewed_at}</div>
            {:else}
              <form class="admin-inline-form" method="POST" action="?/markSignalReviewed">
                <input type="hidden" name="signal_id" value={signal.id} />
                <input name="note" placeholder="Review note" />
                <button class="admin-button admin-button--secondary" type="submit">Mark reviewed</button>
              </form>
            {/if}
          </td>
        </tr>
      {/each}
    </AdminTable>
  {:else}
    <AdminEmptyState title="No ML signals match filters" detail="Adjust filters or create a signal from the scan form." />
  {/if}
</AdminSectionCard>

<AdminSectionCard eyebrow="Bulk action" title="Post moderation" description="Select posts and run the PASS 17E bulk engine. Use dry-run first for validation.">
  {#if postItems.length}
    <form method="POST" action="?/bulkPosts">
      <div class="admin-filter-row">
        <label>
          Action
          <select name="action">
            <option value="hide">Hide</option>
            <option value="remove">Remove</option>
            <option value="restore">Restore</option>
          </select>
        </label>
        <label>
          Reason
          <input name="reason" placeholder="Reason for audit log" />
        </label>
        <label class="admin-checkbox-label"><input type="checkbox" name="dry_run" checked /> Dry-run only</label>
        <button class="admin-button" type="submit">Run selected posts</button>
      </div>
      <AdminTable caption="Post moderation table" columns={['Select', 'Post', 'Author', 'Status', 'Signals']}>
        {#each postItems as post}
          <tr>
            <td><input type="checkbox" name="target_ids" value={post.id} aria-label={'Select post ' + post.id} /></td>
            <td><strong>{preview(post.body, 130)}</strong><br /><span class="admin-muted">{shortId(post.id)} · {post.kind}</span></td>
            <td>{post.author_display_name}<br /><span class="admin-muted">{shortId(post.author_user_id)}</span></td>
            <td><AdminStatusBadge label={post.status} tone={tone(post.status)} /></td>
            <td>{post.reports_count} reports · {post.comments_count} comments</td>
          </tr>
        {/each}
      </AdminTable>
    </form>
  {:else}
    <AdminEmptyState title="No posts match filters" detail="Adjust post status filters or wait for new community activity." />
  {/if}
</AdminSectionCard>

<AdminSectionCard eyebrow="Bulk action" title="Comment moderation" description="Select comments and run the same bulk moderation engine.">
  {#if commentItems.length}
    <form method="POST" action="?/bulkComments">
      <div class="admin-filter-row">
        <label>
          Action
          <select name="action">
            <option value="hide">Hide</option>
            <option value="remove">Remove</option>
            <option value="restore">Restore</option>
          </select>
        </label>
        <label>
          Reason
          <input name="reason" placeholder="Reason for audit log" />
        </label>
        <label class="admin-checkbox-label"><input type="checkbox" name="dry_run" checked /> Dry-run only</label>
        <button class="admin-button" type="submit">Run selected comments</button>
      </div>
      <AdminTable caption="Comment moderation table" columns={['Select', 'Comment', 'Author', 'Status', 'Reports']}>
        {#each commentItems as comment}
          <tr>
            <td><input type="checkbox" name="target_ids" value={comment.id} aria-label={'Select comment ' + comment.id} /></td>
            <td><strong>{preview(comment.body, 130)}</strong><br /><span class="admin-muted">{shortId(comment.id)} · post {shortId(comment.post_id)}</span></td>
            <td>{comment.author_display_name}<br /><span class="admin-muted">{shortId(comment.author_user_id)}</span></td>
            <td><AdminStatusBadge label={comment.status} tone={tone(comment.status)} /></td>
            <td>{comment.reports_count}</td>
          </tr>
        {/each}
      </AdminTable>
    </form>
  {:else}
    <AdminEmptyState title="No comments match filters" detail="Adjust comment status filters or wait for new discussion replies." />
  {/if}
</AdminSectionCard>

<AdminSectionCard eyebrow="Reports" title="Reports" description="Select report rows to mark reviewed or dismiss through the bulk engine.">
  {#if reportItems.length}
    <form method="POST" action="?/bulkReports">
      <div class="admin-filter-row">
        <label>
          Action
          <select name="action">
            <option value="mark_reviewed">Mark reviewed</option>
            <option value="dismiss_report">Dismiss report</option>
          </select>
        </label>
        <label>
          Reason
          <input name="reason" placeholder="Reason for audit log" />
        </label>
        <label class="admin-checkbox-label"><input type="checkbox" name="dry_run" checked /> Dry-run only</label>
        <button class="admin-button" type="submit">Run selected reports</button>
      </div>
      <AdminTable caption="Social reports" columns={['Select', 'Report', 'Target', 'Reporter', 'Status']}>
        {#each reportItems as report}
          <tr>
            <td><input type="checkbox" name="target_ids" value={report.id} aria-label={'Select report ' + report.id} /></td>
            <td><strong>{report.reason}</strong><br /><span class="admin-muted">{preview(report.details, 130)}</span></td>
            <td><span class="admin-code">{report.target_type}</span><br /><span class="admin-muted">{shortId(report.target_id)}</span></td>
            <td>{report.reporter_display_name}<br /><span class="admin-muted">{shortId(report.reporter_user_id)}</span></td>
            <td><AdminStatusBadge label={report.status} tone={tone(report.status)} /></td>
          </tr>
        {/each}
      </AdminTable>
    </form>
  {:else}
    <AdminEmptyState title="No reports match filters" detail="Adjust report filters or wait for new user reports." />
  {/if}
</AdminSectionCard>

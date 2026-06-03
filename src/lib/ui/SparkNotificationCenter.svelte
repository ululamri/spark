<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import SparkIcon from './SparkIcon.svelte';
  import { createSparkNotifications } from '$lib/messaging/spark-messaging-model';
  import { markAllNotificationsRead, markNotificationRead, messageState } from '$state/message-state.svelte';
  import { betaSession } from '$state/beta-session-state.svelte';
  import { gatewayState } from '$state/gateway-state.svelte';
  import { getCompletedLessonCount, getLearningProgressPercent, getReadinessScore, learningState } from '$state/learning-state.svelte';
  import { pushToast } from '$state/app-state.svelte';

  let open = $state(false);

  const notifications = $derived(
    createSparkNotifications({
      readiness: getReadinessScore(),
      learningProgress: getLearningProgressPercent(),
      completedLessons: getCompletedLessonCount(),
      completedLabs: learningState.completedLabIds.length,
      registeredWorkshops: gatewayState.registeredWorkshopIds.length,
      userName: betaSession.user?.name
    })
  );

  const unreadCount = $derived(notifications.filter((item) => !messageState.readNotificationIds.includes(item.id)).length);
  const primaryNotification = $derived(notifications[0]);
  const secondaryNotifications = $derived(notifications.slice(1, 4));

  function closePanel() {
    open = false;
  }

  function readAll() {
    markAllNotificationsRead(notifications.map((item) => item.id));
    pushToast({ title: 'Pemberitahuan dibaca', copy: 'Semua update singkat sudah ditandai dibaca.', tone: 'success' });
  }

  function openNotification(id: string) {
    markNotificationRead(id);
    closePanel();
  }
</script>

<div class="spark-notification-center production-notification-center">
  <button class="spark-icon-btn notification-trigger" type="button" aria-label="Pemberitahuan" aria-expanded={open} onclick={() => (open = !open)}>
    <SparkIcon name="bell" size={18} />
    {#if unreadCount > 0}<span class="notification-count">{unreadCount}</span>{:else}<span class="notification-dot"></span>{/if}
  </button>

  {#if open}
    <button class="production-notification-scrim" transition:fade type="button" aria-label="Tutup pemberitahuan" onclick={closePanel}></button>
    <div class="production-notification-panel" role="dialog" aria-label="Pemberitahuan" transition:fly={{ y: -6, duration: 150 }}>
      <div class="production-notification-head">
        <div>
          <span class="spark-eyebrow">Pemberitahuan</span>
          <h2>Update singkat</h2>
          <p>{unreadCount > 0 ? `${unreadCount} update baru` : 'Semua update sudah dibaca'}</p>
        </div>
        <button type="button" aria-label="Tutup pemberitahuan" onclick={closePanel}><SparkIcon name="x" size={17} /></button>
      </div>

      {#if primaryNotification}
        <a class="production-notification-focus" href={primaryNotification.href} onclick={() => openNotification(primaryNotification.id)}>
          <span class={`production-notification-focus-icon ${primaryNotification.tone}`}><SparkIcon name={primaryNotification.icon} size={17} /></span>
          <div>
            <small>Prioritas</small>
            <strong>{primaryNotification.title}</strong>
            <p>{primaryNotification.copy}</p>
          </div>
        </a>
      {/if}

      <div class="production-notification-tools">
        <span>Notifikasi memberi update cepat. Pesan lengkap ada di Inbox.</span>
        <button type="button" onclick={readAll} disabled={unreadCount === 0}>Tandai dibaca</button>
      </div>

      <div class="production-notification-list">
        {#each secondaryNotifications as item}
          {@const read = messageState.readNotificationIds.includes(item.id)}
          <a href={item.href} class={`production-notification-item ${item.tone}`} class:read onclick={() => openNotification(item.id)}>
            <span><SparkIcon name={item.icon} size={15} /></span>
            <div>
              <small>{item.kind}{#if !read} · Baru{/if}</small>
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
            </div>
            <em>{item.status}</em>
          </a>
        {/each}
      </div>

      <a class="production-notification-inbox-link" href="/inbox" onclick={closePanel}>
        Buka Inbox untuk membaca pesan lengkap
        <SparkIcon name="chevron-right" size={15} />
      </a>
    </div>
  {/if}
</div>

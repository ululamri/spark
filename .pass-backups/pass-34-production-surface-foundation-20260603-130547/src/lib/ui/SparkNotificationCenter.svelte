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

  function closePanel() {
    open = false;
  }

  function readAll() {
    markAllNotificationsRead(notifications.map((item) => item.id));
    pushToast({ title: 'Pesan dibaca', copy: 'Semua arahan sudah ditandai dibaca.', tone: 'success' });
  }

  function openNotification(id: string) {
    markNotificationRead(id);
    closePanel();
  }
</script>

<div class="spark-notification-center">
  <button class="spark-icon-btn notification-trigger" type="button" aria-label="Pemberitahuan" aria-expanded={open} onclick={() => (open = !open)}>
    <SparkIcon name="bell" size={18} />
    {#if unreadCount > 0}<span class="notification-count">{unreadCount}</span>{:else}<span class="notification-dot"></span>{/if}
  </button>

  {#if open}
    <button class="notification-scrim pass32-notification-scrim" transition:fade type="button" aria-label="Tutup pemberitahuan" onclick={closePanel}></button>
    <div class="notification-panel pass32-notification-panel" role="dialog" aria-label="Pesan Spark" transition:fly={{ y: -6, duration: 150 }}>
      <div class="notification-panel-head pass32-notification-head">
        <div>
          <span class="spark-eyebrow">Pesan Spark</span>
          <h2>Arahan singkat</h2>
          <p>{unreadCount > 0 ? `${unreadCount} pesan baru untuk dicek` : 'Semua arahan sudah dibaca'}</p>
        </div>
        <button type="button" aria-label="Tutup pemberitahuan" onclick={closePanel}><SparkIcon name="x" size={17} /></button>
      </div>

      {#if primaryNotification}
        <a class="pass32-notification-focus" href={primaryNotification.href} onclick={() => openNotification(primaryNotification.id)}>
          <span><SparkIcon name={primaryNotification.icon} size={17} /></span>
          <div>
            <small>Fokus sekarang</small>
            <strong>{primaryNotification.title}</strong>
            <p>{primaryNotification.copy}</p>
          </div>
        </a>
      {/if}

      <div class="notification-tools pass32-notification-tools">
        <span>{notifications.length} arahan</span>
        <button type="button" onclick={readAll} disabled={unreadCount === 0}>Tandai semua dibaca</button>
      </div>

      <div class="notification-feed pass32-notification-feed">
        {#each notifications as item}
          {@const read = messageState.readNotificationIds.includes(item.id)}
          <a href={item.href} class={`notification-item pass32-notification-item ${item.tone} ${item.priority}`} class:read onclick={() => openNotification(item.id)}>
            <span class={`notification-item-icon ${item.tone}`}><SparkIcon name={item.icon} size={15} /></span>
            <span class="notification-copy"><small>{item.kind}</small><strong>{item.title}</strong><em>{item.copy}</em></span>
            <span class="notification-meta">{#if !read}<i>Baru</i>{/if}<b>{item.status}</b></span>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>

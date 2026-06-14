<script lang="ts">
  import { onMount } from 'svelte';
  import SparkButton from './SparkButton.svelte';
  import SparkIcon from './SparkIcon.svelte';
  import SparkTrustBadge from './SparkTrustBadge.svelte';
  import { uploadPublicMediaFile } from '$lib/api/spark-media-api';
  import { getBackendProfile, setBackendProfileAvatar, updateBackendProfile } from '$lib/api/spark-profile-api';
  import { pushToast } from '$state/app-state.svelte';
  import { betaSession, getModeLabel } from '$state/beta-session-state.svelte';
  import {
    applyBackendProfileSnapshot,
    createProfileUpdatePayload,
    profileState,
    restoreProfileState,
    setAvatarImageData,
    updateProfileIdentity,
    type SparkProfileVisibility
  } from '$state/profile-state.svelte';

  let editOpen = $state(false);
  let editName = $state('');
  let editHandle = $state('');
  let editBio = $state('');
  let editLocation = $state('');
  let editVisibility = $state<SparkProfileVisibility>('community');
  let loading = $state(false);
  let saving = $state(false);
  let avatarUploading = $state(false);
  let error = $state('');

  onMount(() => {
    restoreProfileState();
    void hydrateProfile();
  });

  const displayName = $derived(profileState.displayName || betaSession.user?.name || 'Pengguna Karyra');
  const handle = $derived(profileState.handle || betaSession.user?.handle || '@karyra');
  const bio = $derived(profileState.bio || 'Belajar blockchain dan Starknet secara bertahap.');
  const location = $derived(profileState.location || 'Komunitas lokal');
  const modeLabel = $derived(betaSession.user ? getModeLabel(betaSession.user.mode) : 'Pemula');
  const visibilityText = $derived(profileState.visibility === 'private' ? 'Pribadi' : profileState.visibility === 'public' ? 'Publik' : 'Komunitas');

  async function hydrateProfile() {
    loading = true;
    error = '';
    try {
      const profile = await getBackendProfile();
      if (profile) applyBackendProfileSnapshot(profile);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Profil belum bisa dibaca dari Spark API.';
    } finally {
      loading = false;
    }
  }

  function openEditor() {
    editName = displayName;
    editHandle = handle;
    editBio = bio;
    editLocation = location;
    editVisibility = profileState.visibility;
    editOpen = true;
  }

  async function saveEditor() {
    saving = true;
    error = '';
    updateProfileIdentity({ displayName: editName, handle: editHandle, bio: editBio, location: editLocation, visibility: editVisibility });
    try {
      const profile = await updateBackendProfile(createProfileUpdatePayload());
      applyBackendProfileSnapshot(profile);
      editOpen = false;
      pushToast({ title: 'Profil diperbarui', copy: 'Perubahan profil sudah disimpan ke akun kamu.', tone: 'success' });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Profil belum bisa disimpan ke Spark API.';
      pushToast({ title: 'Profil belum tersimpan', copy: error, tone: 'warning' });
    } finally {
      saving = false;
    }
  }

  async function uploadAvatar(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    avatarUploading = true;
    error = '';
    try {
      const asset = await uploadPublicMediaFile(file, 'avatar');
      const profile = await setBackendProfileAvatar(asset.id);
      applyBackendProfileSnapshot(profile);
      if (profile.avatar_url) setAvatarImageData(profile.avatar_url);
      pushToast({ title: 'Foto profil tersimpan', copy: 'Foto profil sudah tersimpan permanen dan akan muncul di perangkat lain.', tone: 'success' });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Foto profil belum bisa diunggah.';
      pushToast({ title: 'Foto profil belum tersimpan', copy: error, tone: 'warning' });
    } finally {
      avatarUploading = false;
      input.value = '';
    }
  }
</script>

<section class="profile-persistent">
  <div class="profile-card hero-card">
    <div class="avatar-box">
      {#if profileState.avatarImageData}
        <img src={profileState.avatarImageData} alt={`Foto profil ${displayName}`} />
      {:else}
        <span>{displayName.slice(0, 1)}</span>
      {/if}
      <label aria-label="Unggah foto profil" class:busy={avatarUploading}>
        <SparkIcon name={avatarUploading ? 'clock' : 'camera'} size={14} />
        <input type="file" accept="image/png,image/jpeg,image/webp" onchange={uploadAvatar} disabled={avatarUploading} />
      </label>
    </div>
    <div>
      <SparkTrustBadge label="Profil" tone="beta" />
      <h1>{displayName}</h1>
      <p>{handle} · {visibilityText}</p>
      {#if loading}<small>Sedang memuat profil akun...</small>{/if}
      {#if avatarUploading}<small>Mengunggah foto profil ke storage...</small>{/if}
      {#if error}<small class="profile-error">{error}</small>{/if}
    </div>
  </div>

  <div class="profile-grid">
    <article class="profile-card">
      <span><SparkIcon name="user-round" size={20} /></span>
      <strong>Akun pribadi</strong>
      <p>Foto dan identitas profil sekarang tersimpan di backend akun, bukan hanya di perangkat ini.</p>
      <div class="actions"><SparkButton onclick={openEditor}>Edit profil</SparkButton><SparkButton href="/passport" variant="secondary">Passport</SparkButton></div>
    </article>
    <article class="profile-card"><small>Email</small><strong>{betaSession.user?.email ?? 'Belum tersedia'}</strong></article>
    <article class="profile-card"><small>Ritme belajar</small><strong>{modeLabel}</strong></article>
    <article class="profile-card"><small>Lokasi komunitas</small><strong>{location}</strong></article>
  </div>

  <section class="profile-card bio-card">
    <span class="spark-eyebrow">Tentang kamu</span>
    <h2>Profil singkat</h2>
    <p>{bio}</p>
  </section>
</section>

{#if editOpen}
  <button class="modal-scrim" type="button" aria-label="Tutup dialog" onclick={() => (editOpen = false)}></button>
  <div class="profile-dialog" role="dialog" aria-modal="true" aria-label="Edit profil">
    <header><h2>Edit identitas akun</h2><button type="button" onclick={() => (editOpen = false)}><SparkIcon name="x" size={17} /></button></header>
    {#if error}<p class="profile-error">{error}</p>{/if}
    <label><span>Nama</span><input bind:value={editName} /></label>
    <label><span>Handle</span><input bind:value={editHandle} /></label>
    <label><span>Lokasi</span><input bind:value={editLocation} /></label>
    <label><span>Bio singkat</span><textarea bind:value={editBio}></textarea></label>
    <label><span>Visibilitas</span><select bind:value={editVisibility}><option value="private">Pribadi</option><option value="community">Komunitas</option><option value="public">Publik</option></select></label>
    <footer><SparkButton variant="ghost" onclick={() => (editOpen = false)}>Batal</SparkButton><SparkButton onclick={() => void saveEditor()} loading={saving} disabled={saving}>Simpan perubahan</SparkButton></footer>
  </div>
{/if}

<style>
  .profile-persistent{display:grid;gap:14px}.profile-card{border:1px solid var(--spark-line);border-radius:24px;background:var(--spark-card);box-shadow:0 12px 30px rgba(5,9,78,.06);padding:clamp(16px,4vw,28px)}.hero-card{display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;align-items:center}.avatar-box{position:relative;display:grid;place-items:center;width:96px;height:96px;border-radius:28px;overflow:hidden;color:#fff;background:linear-gradient(135deg,var(--spark-blue-strong),#ff7a1a)}.avatar-box img{width:100%;height:100%;object-fit:cover}.avatar-box span{font-size:38px;font-weight:840}.avatar-box label{position:absolute;right:8px;bottom:8px;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;color:var(--spark-blue-strong);background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.16);cursor:pointer}.avatar-box label.busy{opacity:.78;cursor:wait}.avatar-box input{display:none}.profile-card h1{margin:8px 0 4px;color:var(--spark-navy);font-size:clamp(30px,6vw,48px);letter-spacing:-.045em}.profile-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.profile-card strong,.profile-card small{display:block}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.bio-card h2{margin:6px 0;color:var(--spark-navy)}.profile-error{display:block;margin-top:8px;padding:10px 12px;border:1px solid rgba(239,68,68,.22);border-radius:14px;color:#991b1b;background:rgba(254,226,226,.72);font-size:13px}.modal-scrim{position:fixed;inset:0;z-index:60;border:0;background:rgba(15,23,42,.36);backdrop-filter:blur(5px)}.profile-dialog{position:fixed;left:50%;top:50%;z-index:61;display:grid;gap:12px;width:min(520px,calc(100% - 28px));max-height:calc(100dvh - 28px);overflow:auto;transform:translate(-50%,-50%);padding:18px;border:1px solid var(--spark-line);border-radius:24px;background:var(--spark-card);box-shadow:0 28px 80px rgba(15,23,42,.28)}.profile-dialog header,.profile-dialog footer{display:flex;align-items:center;justify-content:space-between;gap:12px}.profile-dialog label{display:grid;gap:6px}.profile-dialog input,.profile-dialog textarea,.profile-dialog select{width:100%;border:1px solid var(--spark-line);border-radius:14px;padding:10px 12px;background:var(--spark-surface);color:var(--spark-navy)}.profile-dialog textarea{min-height:96px;resize:vertical}:global([data-theme='dark']) .profile-card h1,:global([data-theme='dark']) .profile-card strong,:global([data-theme='dark']) .bio-card h2,:global([data-theme='dark']) .profile-dialog h2{color:#fff}@media(max-width:780px){.hero-card{grid-template-columns:1fr}.profile-grid{grid-template-columns:1fr}}
</style>

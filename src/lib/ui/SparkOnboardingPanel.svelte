<script lang="ts">
  import SparkButton from './SparkButton.svelte';
  import { completeOnboarding, learningState, setExperience } from '$state/learning-state.svelte';
  import { pushToast } from '$state/app-state.svelte';

  const modes = [
    {
      key: 'beginner',
      title: 'Saya benar-benar baru',
      copy: 'Spark akan memakai bahasa sederhana, contoh lokal, glossary, dan jembatan sebelum praktik.'
    },
    {
      key: 'guided',
      title: 'Saya sudah punya sedikit dasar',
      copy: 'Spark akan memberi jalur lebih ringkas tetapi tetap menjaga checklist keamanan.'
    },
    {
      key: 'explorer',
      title: 'Saya ingin menjelajah teknis',
      copy: 'Spark akan membuka konteks Starknet, testnet, dan Cairo dengan peringatan sebelum bagian teknis.'
    }
  ] as const;

  function choose(mode: (typeof modes)[number]) {
    setExperience(mode.key);
    completeOnboarding();
    pushToast({
      title: 'Mode belajar disimpan',
      copy: `${mode.title} dipakai sebagai estimasi awal. Ini bisa berubah dari perilaku belajar.`,
      tone: 'success'
    });
  }
</script>

{#if !learningState.onboardingComplete}
  <section class="spark-onboarding">
    <div>
      <span class="spark-eyebrow">Mulai dari level yang nyaman</span>
      <h2>Seberapa familiar kamu dengan blockchain?</h2>
      <p>
        Pilihan ini hanya estimasi awal, bukan jalur permanen. Spark tetap memakai satu jalur belajar utama
        dan menyesuaikan rekomendasi dari progress, checkpoint, dan praktik.
      </p>
    </div>

    <div class="spark-onboarding-grid">
      {#each modes as mode}
        <button type="button" onclick={() => choose(mode)}>
          <strong>{mode.title}</strong>
          <small>{mode.copy}</small>
        </button>
      {/each}
    </div>

    <SparkButton variant="ghost" onclick={() => { completeOnboarding(); pushToast({ title: 'Onboarding dilewati', copy: 'Spark akan memulai dari Fondasi Blockchain.', tone: 'info' }); }}>
      Lewati dulu
    </SparkButton>
  </section>
{/if}

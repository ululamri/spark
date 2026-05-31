<script lang="ts">
  import type { PageData } from './$types';
  import SparkButton from '$ui/SparkButton.svelte';
  import SparkCard from '$ui/SparkCard.svelte';
  import SparkCheckpoint from '$ui/SparkCheckpoint.svelte';
  import SparkLearningToolkit from '$ui/SparkLearningToolkit.svelte';
  import SparkLessonNavigator from '$ui/SparkLessonNavigator.svelte';
  import SparkIcon from '$ui/SparkIcon.svelte';
  import { getLessonProgressPercent } from '$lib/learning/lesson-navigation';

  let { data }: { data: PageData } = $props();

  const module = $derived(data.module);
  const lesson = $derived(data.lesson);
  const progress = $derived(getLessonProgressPercent(lesson.slug));
</script>

<svelte:head>
  <title>{lesson.title} — Karyra Spark</title>
</svelte:head>

<section class="spark-lesson-workspace">
  <article class="spark-lesson-main">
    <div class="lesson-breadcrumb">
      <a href="/core"><SparkIcon name="book-open" size={15} /> Core</a>
      <span>/</span>
      <span>{module.title}</span>
    </div>

    <span class="spark-eyebrow">{module.title}</span>
    <h1>{lesson.title}</h1>
    <p class="lesson-summary">{lesson.summary}</p>

    <div class="lesson-meta-row">
      <span>{lesson.estimatedMinutes} menit</span>
      <span>{module.subtitle}</span>
      <span>{lesson.modeHint.join(' · ')}</span>
      <span>{progress}% path</span>
    </div>

    <div class="lesson-reading-progress" aria-hidden="true">
      <span style={`width: ${progress}%`}></span>
    </div>

    <div class="lesson-block">
      <h2>Inti Pelajaran</h2>
      {#each lesson.body as paragraph}
        <p>{paragraph}</p>
      {/each}
    </div>

    <SparkCheckpoint {lesson} />
  </article>

  <aside class="spark-lesson-sidebar">
    <SparkCard>
      <h3>Outline</h3>
      <p>{lesson.estimatedMinutes} menit · {module.subtitle}</p>
      <SparkButton href="/core" variant="secondary">Kembali ke Core</SparkButton>
    </SparkCard>

    <SparkLessonNavigator slug={lesson.slug} />

    <SparkLearningToolkit lessonSlug={lesson.slug} lessonTitle={lesson.title} terms={lesson.glossaryTerms ?? []} />
  </aside>
</section>

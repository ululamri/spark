<script lang="ts">
  import SparkProfileIdentityCenterPersistent from '$ui/SparkProfileIdentityCenterPersistent.svelte';
  import SparkProtectedRoute from '$ui/SparkProtectedRoute.svelte';
</script>

<SparkProtectedRoute title="Masuk untuk membuka Profil" copy="Profil berisi identitas akun pribadi kamu di Spark.">
  <SparkProfileIdentityCenterPersistent />
</SparkProtectedRoute>

import { sparkEnv } from './spark-env';

export type SparkServiceKey = 'spark' | 'api' | 'hub' | 'docs' | 'status';

export type SparkService = {
  key: SparkServiceKey;
  label: string;
  url: string;
  description: string;
  public: boolean;
};

export const sparkServices: SparkService[] = [
  {
    key: 'spark',
    label: 'Spark Frontend',
    url: sparkEnv.PUBLIC_SPARK_APP_URL,
    description: 'Aplikasi utama untuk belajar, praktik, komunitas, profil, dan passport.',
    public: true
  },
  {
    key: 'api',
    label: 'Spark API',
    url: sparkEnv.PUBLIC_SPARK_API_URL,
    description: 'Backend API untuk auth, progress, readiness, workshop, hub bridge, dan integrasi masa depan.',
    public: false
  },
  {
    key: 'hub',
    label: 'Spark Hub',
    url: sparkEnv.PUBLIC_SPARK_HUB_URL,
    description: 'Gateway eksplorasi resource, apps, tools, games, komunitas, dan misi ekosistem.',
    public: true
  },
  {
    key: 'docs',
    label: 'Docs',
    url: 'https://docs.karyra.id',
    description: 'Dokumentasi produk, developer, dan grant-readable docs.',
    public: true
  },
  {
    key: 'status',
    label: 'Status',
    url: 'https://status.karyra.id',
    description: 'Status, changelog, uptime, dan transparency log.',
    public: true
  }
];

export function getService(key: SparkServiceKey) {
  return sparkServices.find((service) => service.key === key);
}

export function getHubUrl(path = '/') {
  const base = getService('hub')?.url ?? sparkEnv.PUBLIC_SPARK_HUB_URL;
  return new URL(path, base).toString();
}

export function getApiUrl(path = '/') {
  const base = getService('api')?.url ?? sparkEnv.PUBLIC_SPARK_API_URL;
  return new URL(path, base).toString();
}

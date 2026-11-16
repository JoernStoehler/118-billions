/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OBITUARY_FOLDER: 'production' | 'development' | 'discarded';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

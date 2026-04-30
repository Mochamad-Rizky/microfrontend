# Micro Frontend — Module Federation

Repository ini adalah implementasi **Micro Frontend** menggunakan **Module Federation** dengan stack React + Vite + TypeScript + Zustand.

> GitHub: [https://github.com/Mochamad-Rizky/microfrontend](https://github.com/Mochamad-Rizky/microfrontend)

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [Design System](#design-system)
- [Konsep Kunci](#konsep-kunci)
- [Struktur Folder](#struktur-folder)
- [Instalasi & Menjalankan](#instalasi--menjalankan)

---

## Arsitektur

Proyek ini terdiri dari **2 aplikasi terpisah** yang berjalan secara independen namun saling terhubung:

```
┌──────────────────────────────────────────────────────┐
│                     repo-2 (Host)                    │
│                  localhost:5174                       │
│                                                      │
│   ┌──────────────────┐   ┌──────────────────────┐    │
│   │   BoxButton      │   │     BoxButton2       │    │
│   │  (dari repo-1)   │   │   (lokal repo-2)     │    │
│   └──────────────────┘   └──────────────────────┘    │
│             │                        │               │
│             └──────────┬─────────────┘               │
│                        │                             │
│               useCountStore (shared)                 │
│               state counter sinkron                  │
└──────────────────────────────────────────────────────┘
                         ▲
                         │ remoteEntry.js
┌──────────────────────────────────────────────────────┐
│                    repo-1 (Remote)                   │
│                  localhost:5173                       │
│                                                      │
│   Exposes:                                           │
│   • ./BoxButton  → komponen UI                       │
│   • ./useCountStore  → global state (Zustand)        │
└──────────────────────────────────────────────────────┘
```

| Aplikasi | Peran   | Port   | Deskripsi                                    |
|----------|---------|--------|----------------------------------------------|
| `repo-1` | Remote  | `5173` | Menyediakan komponen dan state yang di-share |
| `repo-2` | Host    | `5174` | Mengonsumsi komponen dari repo-1             |

---

## Design System

Kedua aplikasi menggunakan design system yang **seragam dan konsisten**.

### Komponen Utama: `BoxButton`

Komponen `BoxButton` adalah komponen UI inti yang merepresentasikan sebuah card interaktif. Komponen ini di-definisikan di **repo-1** lalu di-consume oleh **repo-2**.

```
┌──────────────────────────────┐
│   [ Title ]                  │
│   [ Description ]            │
│                              │
│  [ Increment ] [ Decrement ] │
│                              │
│      Count: 0                │
└──────────────────────────────┘
```

**Props:**

| Prop          | Type     | Deskripsi                  |
|---------------|----------|----------------------------|
| `title`       | `string` | Judul pada card            |
| `description` | `string` | Deskripsi pada card        |

### Global State: `useCountStore`

State counter dikelola oleh **Zustand** dan di-share antar aplikasi. Karena Zustand dikonfigurasi sebagai `singleton`, kedua komponen (`BoxButton` di repo-1 dan `BoxButton2` di repo-2) **berbagi state yang sama** — ketika counter di-increment dari salah satu komponen, komponen lainnya ikut berubah.

```ts
interface CountStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}
```

### Teknologi

| Teknologi                  | Versi     | Fungsi                             |
|----------------------------|-----------|------------------------------------|
| React                      | ^19.2.5   | UI library                         |
| Vite                       | ^8.0.10   | Build tool & dev server            |
| TypeScript                 | ~6.0.2    | Type safety                        |
| Zustand                    | ^5.0.12   | Global state management            |
| @module-federation/vite    | ^1.15.0   | Module Federation plugin untuk Vite|

---

## Konsep Kunci

### Federation

**Federation** (Module Federation) adalah teknik yang memungkinkan beberapa aplikasi JavaScript yang berjalan terpisah untuk **berbagi kode secara dinamis di runtime** — bukan saat build time. Setiap aplikasi bisa meng-expose modul (komponen, fungsi, store) dan aplikasi lain bisa langsung menggunakannya tanpa perlu install sebagai package.

```ts
// repo-1/vite.config.ts
federation({
  name: 'repo1',
  filename: 'remoteEntry.js', // file entry point yang akan di-load oleh host
  exposes: {
    './BoxButton': './src/components/BoxButton.tsx',
    './useCountStore': './src/store/useCountStore.ts',
  },
})
```

> `remoteEntry.js` adalah manifest file yang berisi daftar semua modul yang di-expose oleh remote.

---

### Remotes

**Remotes** adalah konfigurasi di sisi **host** untuk mendeklarasikan dari mana modul eksternal akan di-load. Host akan mengambil `remoteEntry.js` dari URL yang didaftarkan.

```ts
// repo-2/vite.config.ts
federation({
  name: 'repo2',
  remotes: {
    'repo1': {
      name: 'repo1',
      entry: 'http://localhost:5173/remoteEntry.js', // URL remote saat development
      type: 'module',
    },
  },
})
```

Setelah dikonfigurasi, repo-2 bisa langsung import dari repo-1 seperti ini:

```ts
import BoxButton from 'repo1/BoxButton';
import { useCountStore } from 'repo1/useCountStore';
```

---

### DTS (TypeScript Type Generation)

**DTS** adalah fitur untuk menghasilkan dan mengonsumsi **TypeScript type definition** secara otomatis antar aplikasi.

```ts
// repo-1 → GENERATE types (karena dia yang expose)
dts: {
  tsConfigPath: './tsconfig.app.json',
  generateTypes: true,   // hasilkan file .d.ts dari semua exposed modules
  consumeTypes: false,
}

// repo-2 → CONSUME types (karena dia yang menggunakan)
dts: {
  generateTypes: false,
  consumeTypes: { family: 6 }, // download & gunakan types dari remote
}
```

Types yang di-generate tersimpan di `dist/@mf-types/` dan dikonsumsi di `@mf-types/repo1/`.

---

### Shared

**Shared** adalah konfigurasi untuk menghindari duplikasi library yang sama di-load dua kali. Dengan `singleton: true`, React, React-DOM, dan Zustand hanya akan di-load **satu instance** meskipun ada di repo-1 dan repo-2.

```ts
shared: {
  react: {
    singleton: true,             // hanya 1 instance React di seluruh aplikasi
    requiredVersion: '^19.2.5',  // versi yang kompatibel
  },
  'react-dom': { singleton: true, requiredVersion: '^19.2.5' },
  'zustand': { singleton: true, requiredVersion: '^5.0.12' },
}
```

> Tanpa `singleton: true`, Zustand store di repo-1 dan repo-2 akan menjadi dua instance berbeda dan state tidak akan tersinkronisasi.

---

## Struktur Folder

```
micro-frontend/
├── repo-1/                      # Remote Application (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   └── BoxButton.tsx    # Komponen yang di-expose
│   │   └── store/
│   │       └── useCountStore.ts # Global state yang di-expose
│   ├── vite.config.ts           # Konfigurasi federation (exposes)
│   └── package.json
│
└── repo-2/                      # Host Application (Port 5174)
    ├── src/
    │   ├── App.tsx              # Mengonsumsi BoxButton dari repo-1
    │   └── components/
    │       └── BoxButton2.tsx   # Komponen lokal, menggunakan shared store
    ├── @mf-types/               # Type definitions dari repo-1 (auto-generated)
    │   └── repo1/
    ├── vite.config.ts           # Konfigurasi federation (remotes)
    └── package.json
```

---

## Instalasi & Menjalankan

> Pastikan **Node.js** sudah terinstall di komputer Anda.

### Langkah 1 — Clone repository

```bash
git clone https://github.com/Mochamad-Rizky/microfrontend.git
cd microfrontend
```

### Langkah 2 — Install dependencies repo-1

```bash
cd repo-1
npm install
```

### Langkah 3 — Install dependencies repo-2

```bash
cd ../repo-2
npm install
```

### Langkah 4 — Jalankan repo-1 (Remote) terlebih dahulu

> **Penting:** repo-1 harus berjalan lebih dulu sebelum repo-2, karena repo-2 mengambil `remoteEntry.js` dari repo-1.

```bash
cd ../repo-1
npm run dev
```

repo-1 akan berjalan di → `http://localhost:5173`

### Langkah 5 — Jalankan repo-2 (Host)

Buka **terminal baru**, lalu:

```bash
cd repo-2
npm run dev
```

repo-2 akan berjalan di → `http://localhost:5174`

### Langkah 6 — Buka di browser

Buka `http://localhost:5174` di browser. Anda akan melihat:

- **BoxButton** (dari repo-1) — komponen yang di-load secara remote
- **BoxButton2** (dari repo-2) — komponen lokal
- Keduanya berbagi **state counter yang sama** berkat shared Zustand store

---

## Ringkasan Alur Kerja

```
1. repo-1 dev server berjalan  →  expose BoxButton & useCountStore via remoteEntry.js
2. repo-2 dev server berjalan  →  load remoteEntry.js dari repo-1
3. repo-2 render BoxButton     →  komponen di-load secara runtime dari repo-1
4. user klik Increment          →  useCountStore (singleton) update state
5. kedua BoxButton update       →  karena berbagi store yang sama
```

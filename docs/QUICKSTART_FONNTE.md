# 🚀 Quick Start Guide - Fonnte Setup

Panduan singkat untuk setup Fonnte dalam 5 menit!

---

## ⚡ Langkah Singkat

### 1. Daftar Fonnte (1 menit)
1. Buka: https://fonnte.com/register
2. Isi form pendaftaran
3. Verifikasi email

### 2. Hubungkan WhatsApp (1 menit)
1. Login: https://app.fonnte.com/
2. Menu **Device** → **Tambah Device**
3. Scan QR Code dengan WhatsApp HP

### 3. Ambil Token (1 menit)
1. Menu **Settings** → **API**
2. Copy **API Token**

### 4. Setup di APEL (1 menit)
Edit file `.env`:
```env
FONNTE_TOKEN=PASTE_API_TOKEN_DISINI
```

### 5. Test (1 menit)
Buka browser:
```
https://apel-pa-penajam.test/fonnte/test
```

---

## 📋 Konfigurasi .env Lengkap

```env
# ===========================================
# FONNTE WHATSAPP CONFIGURATION
# ===========================================

# Token dari dashboard Fonnte
FONNTE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Paste dari dashboard

# Target Group ID (opsional - jika kosong akan kirim ke semua grup)
# FONNTE_TARGET_GROUP=
```

---

## 🔍 Cara Menemukan Token

```
Dashboard Fonnte
│
├── Settings → API
│   └── API Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
│
└── Device
    ├── Status: ✅ Online
    └── Nomor: 628xxxxxx
```

---

## ✅ Cara Penggunaan

### Generate Jadwal
1. Login ke aplikasi
2. Buka **Jadwal Apel**
3. Pilih tanggal mulai & selesai
4. Klik **Generate Jadwal**

### Broadcast ke WhatsApp
1. Di kartu jadwal, klik tombol **WhatsApp**
2. Konfirmasi
3. Selesai! Pesan terkirim ke grup

---

## 🧪 Test Koneksi

| URL | Hasil |
|-----|-------|
| `/fonnte/test` | ✅ Koneksi berhasil / ❌ Gagal |
| `/fonnte/quota` | 📊 Sisa Kuota: XX/XX pesan |

---

## 📊 Estimasi Penggunaan

| Broadcast/Minggu | Pesan/Bulan | Sisa Kuota 50 |
|------------------|-------------|---------------|
| 2 (Senin + Jumat) | ~8 | 42 |

**50 pesan free trial = ~6 bulan gratis!**

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Token tidak valid" | Copy ulang dari dashboard |
| "Device offline" | Scan QR Code lagi |
| "Gagal terkirim" | Tunggu 1 menit, coba lagi |
| Kuota habis | Beli paket di dashboard |

---

## 📞 Support

| Channel | Kontak |
|---------|--------|
| WhatsApp Fonnte | +62 812-5000-9000 |
| Website | https://fonnte.com |
| Dashboard | https://app.fonnte.com |

---

## 🎯 Checklist

- [ ] Daftar di Fonnte
- [ ] Verifikasi email
- [ ] Hubungkan WhatsApp (scan QR)
- [ ] Copy API Token
- [ ] Update .env
- [ ] Test koneksi `/fonnte/test`
- [ ] Test broadcast

---

**Selesai!** 🎉

Hubungi jika ada kendala.
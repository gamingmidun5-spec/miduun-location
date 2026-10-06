MIDUUN NETLIFY LOCATION REQUEST
================================

FUNGSI:
Nomor HP target -> target harus online -> target menerima permintaan
-> target pilih IZINKAN/TOLAK -> jika IZINKAN, browser meminta izin GPS
-> lokasi dikirim ke peminta -> peminta bisa membuka koordinat di Google Maps.

DEPLOY KE NETLIFY:
1. Upload folder ini ke GitHub.
2. Di Netlify: Add new project / Import an existing project.
3. Pilih repository.
4. Netlify akan membaca netlify.toml.
5. Deploy.
6. Buka URL HTTPS Netlify dari dua perangkat.

CATATAN:
- Netlify Functions dipakai sebagai backend.
- Netlify Blobs dipakai sebagai penyimpanan demo.
- Target harus sudah mendaftarkan nomor HP dan halaman target tetap terbuka.
- Saat target menekan IZINKAN, browser juga akan meminta izin lokasi.
- Untuk pengujian, halaman target harus tetap terbuka/aktif. Browser mobile bisa
  menghentikan polling ketika tab benar-benar ditinggalkan atau perangkat tidur.
- Versi ini belum memverifikasi kepemilikan nomor HP dengan OTP. Untuk produksi,
  wajib tambahkan OTP/verifikasi dan autentikasi yang lebih kuat.

ALUR TEST:
A. Perangkat Target
   1. Buka URL Netlify.
   2. Pilih tab "Target".
   3. Masukkan nomor target.
   4. Klik "Daftarkan Perangkat".
   5. Biarkan halaman tetap terbuka.

B. Perangkat Peminta
   1. Buka URL yang sama.
   2. Pilih tab "Peminta".
   3. Masukkan nomor peminta.
   4. Klik "Daftarkan Perangkat".
   5. Masukkan nomor target.
   6. Klik "Kirim Permintaan".

C. Perangkat Target
   1. Akan muncul permintaan.
   2. Klik "Izinkan".
   3. Browser meminta izin lokasi -> pilih Allow/Izinkan.
   4. Lokasi mulai dibagikan.

D. Perangkat Peminta
   1. Koordinat akan muncul.
   2. Klik "Buka di Google Maps".

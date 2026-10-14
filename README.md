# FireSentry — Antarmuka Informasi Karhutla

Tampilan website FireSentry dengan warna hijau gelap, aksen oranye, kartu putih, formulir unggah foto, cara kerja, fitur, dan ringkasan informasi.

## Cara menjalankan
1. Ekstrak ZIP.
2. Buka folder `firesentry-desain-referensi` di VS Code.
3. Pasang ekstensi **Live Server** jika belum ada.
4. Klik kanan `index.html` → **Open with Live Server**.

## Fungsi yang tersedia
- Navigasi responsif.
- Memilih atau drag-and-drop gambar JPG/PNG/WEBP (maksimal 5 MB) dan menampilkan pratinjau.
- Meminta koordinat GPS melalui izin browser.
- Validasi formulir dan ringkasan input yang dipilih.

## Integrasi yang masih diperlukan untuk hasil faktual
- Model AI yang benar-benar menganalisis foto.
- API cuaca dan curah hujan dari sumber terverifikasi.
- Data titik panas satelit beserta waktu pengamatan.
- Data tutupan lahan/gambut dan metode penilaian risiko yang tervalidasi.
- Penyimpanan laporan ke Supabase serta kebijakan RLS.

Halaman ini tidak membuat skor risiko palsu. Sampai integrasi di atas tersedia, status risiko akan menyatakan belum dapat ditentukan. Jangan menaruh `service_role` key atau token rahasia di frontend.


## Data faktual yang terhubung
- Cuaca terkini dan akumulasi curah hujan harian 7 hari melalui Open-Meteo Forecast API, berdasarkan koordinat GPS browser.
- Data cuaca menampilkan nilai dan waktu yang dikembalikan layanan, serta mencantumkan sumbernya.
- Cuaca bukan bukti terjadinya kebakaran. Belum ada integrasi hotspot satelit NASA FIRMS, model deteksi api/asap, atau model prediksi risiko yang tervalidasi.
- Website memerlukan koneksi internet dan izin lokasi browser. Buka melalui localhost atau HTTPS agar geolocation dapat digunakan.
- Jangan menyatakan angka risiko sebagai hasil AI sebelum model dan metode penilaiannya benar-benar diintegrasikan dan divalidasi.

API yang digunakan: https://api.open-meteo.com/v1/forecast
Dokumentasi: https://open-meteo.com/en/docs

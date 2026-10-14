const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const photoInput = document.getElementById("photoInput");
const uploadZone = document.getElementById("uploadZone");
const fileName = document.getElementById("fileName");
const gpsButton = document.getElementById("gpsButton");
const locationTitle = document.getElementById("locationTitle");
const locationText = document.getElementById("locationText");
const riskForm = document.getElementById("riskForm");
const toast = document.getElementById("toast");
let selectedPhoto = null;
let gpsPosition = null;
let toastTimer;
let weatherData = null;

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
navLinks?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
}

function handleFile(file) {
  if (!file) return;
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    showToast("Pilih gambar JPG, PNG, atau WEBP.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("Ukuran gambar maksimal 5 MB.");
    return;
  }
  selectedPhoto = file;
  fileName.textContent = `Dipilih: ${file.name}`;
  uploadZone.classList.add("has-file");
  let preview = document.getElementById("photoPreview");
  if (!preview) {
    preview = document.createElement("img");
    preview.id = "photoPreview";
    preview.alt = "Pratinjau foto yang dipilih";
    preview.style.cssText = "display:block;max-width:100%;max-height:130px;object-fit:contain;border-radius:12px;margin:0 auto 10px;";
    uploadZone.insertBefore(preview, uploadZone.querySelector(".upload-icon"));
  }
  if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
  const objectUrl = URL.createObjectURL(file);
  preview.src = objectUrl;
  preview.dataset.objectUrl = objectUrl;
  showToast("Foto berhasil dipilih.");
}
photoInput?.addEventListener("change", event => handleFile(event.target.files[0]));

["dragenter", "dragover"].forEach(eventName => {
  uploadZone?.addEventListener(eventName, event => {
    event.preventDefault();
    uploadZone.classList.add("dragover");
  });
});
["dragleave", "drop"].forEach(eventName => {
  uploadZone?.addEventListener(eventName, event => {
    event.preventDefault();
    uploadZone.classList.remove("dragover");
  });
});
uploadZone?.addEventListener("drop", event => {
  const file = event.dataTransfer?.files?.[0];
  handleFile(file);
});

gpsButton?.addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    showToast("Browser ini tidak mendukung GPS. Silakan lanjut tanpa GPS.");
    return;
  }
  gpsButton.disabled = true;
  gpsButton.textContent = "Mencari…";
  navigator.geolocation.getCurrentPosition(position => {
    gpsPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    weatherData = null;
    fetchWeather(gpsPosition.latitude, gpsPosition.longitude);
    locationTitle.textContent = "2. Lokasi GPS berhasil didapat";
    locationText.textContent = `${gpsPosition.latitude.toFixed(5)}, ${gpsPosition.longitude.toFixed(5)}`;
    gpsButton.textContent = "GPS aktif";
    gpsButton.disabled = false;
    showToast("Lokasi berhasil dibaca di browser.");
  }, error => {
    const message = error.code === 1
      ? "Izin lokasi ditolak. Aktifkan izin lokasi pada browser."
      : "Lokasi belum ditemukan. Coba lagi atau lanjut tanpa GPS.";
    showToast(message);
    gpsButton.textContent = "Coba lagi";
    gpsButton.disabled = false;
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
});


// Mengambil kondisi cuaca aktual dari Open-Meteo berdasarkan koordinat.
// Ini adalah data cuaca, bukan hasil deteksi kebakaran atau penilaian risiko AI.
async function fetchWeather(latitude, longitude) {
  const warning = document.getElementById("sampleWarning");
  warning.textContent = "Mengambil data cuaca dari Open-Meteo…";
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code&daily=precipitation_sum&past_days=7&forecast_days=1&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Layanan cuaca tidak merespons.");
    const data = await response.json();
    if (!data.current) throw new Error("Data cuaca terkini tidak tersedia.");
    weatherData = data;
    renderWeather(data);
    warning.textContent = "Data cuaca diambil dari Open-Meteo. Data ini bukan deteksi hotspot dan tidak membuktikan ada atau tidaknya kebakaran. Foto belum dianalisis oleh model AI.";
  } catch (error) {
    weatherData = null;
    const panel = document.getElementById("weatherPanel");
    if (panel) panel.innerHTML = "<strong>Data cuaca belum tersedia.</strong><p>Periksa koneksi internet lalu coba gunakan GPS lagi.</p>";
    warning.textContent = "Data cuaca tidak berhasil diambil. Tingkat risiko belum ditentukan; foto juga belum dianalisis oleh model AI.";
  }
}

function renderWeather(data) {
  const panel = document.getElementById("weatherPanel");
  if (!panel) return;
  const c = data.current;
  const daily = data.daily;
  const recentRain = daily?.precipitation_sum?.slice(0, 7).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const items = [
    ["Suhu", `${c.temperature_2m} ${data.current_units?.temperature_2m || "°C"}`],
    ["Kelembapan", `${c.relative_humidity_2m} ${data.current_units?.relative_humidity_2m || "%"}`],
    ["Curah hujan saat ini", `${c.precipitation} ${data.current_units?.precipitation || "mm"}`],
    ["Kecepatan angin", `${c.wind_speed_10m} ${data.current_units?.wind_speed_10m || "km/jam"}`],
    ["Akumulasi hujan 7 hari", `${recentRain?.toFixed(1) ?? "—"} mm`]
  ];
  panel.replaceChildren();
  const heading = document.createElement("strong");
  heading.textContent = "Cuaca berdasarkan koordinat";
  panel.appendChild(heading);
  const grid = document.createElement("div");
  grid.className = "weather-grid";
  items.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "weather-item";
    const name = document.createElement("span");
    name.textContent = label;
    const val = document.createElement("strong");
    val.textContent = value;
    item.append(name, val);
    grid.appendChild(item);
  });
  panel.appendChild(grid);
  const meta = document.createElement("p");
  meta.className = "weather-meta";
  meta.textContent = `Waktu data: ${c.time || "tidak tersedia"} (${data.timezone || "zona waktu lokal"}). Sumber: Open-Meteo.`;
  panel.appendChild(meta);
}

// Ringkasan informasi berdasarkan input pengguna. Tidak menghasilkan skor risiko
// karena data cuaca, hotspot, dan model klasifikasi belum dihubungkan.
function renderFactors(factors) {
  const container = document.getElementById("factorTags");
  container.replaceChildren();
  factors.forEach(factor => {
    const tag = document.createElement("span");
    tag.textContent = factor;
    container.appendChild(tag);
  });
}

riskForm?.addEventListener("submit", event => {
  event.preventDefault();
  const landType = document.getElementById("landType").value;
  const rainfall = document.getElementById("rainfall").value;

  if (!selectedPhoto) {
    showToast("Silakan unggah foto lahan atau asap terlebih dahulu.");
    photoInput.focus();
    return;
  }
  if (!landType || !rainfall) {
    showToast("Lengkapi pilihan jenis lahan dan hujan terakhir.");
    return;
  }

  if (!gpsPosition) {
    showToast("Gunakan GPS agar data cuaca sesuai lokasi lahan.");
    gpsButton.focus();
    return;
  }
  if (!weatherData) {
    fetchWeather(gpsPosition.latitude, gpsPosition.longitude);
  }
  const factors = [`Jenis lahan yang dipilih (input pengguna): ${landType}`];
  const rainText = rainfall === "Tidak diketahui"
    ? "Riwayat hujan belum diketahui"
    : `Hujan terakhir menurut input: ${rainfall}`;
  factors.push(rainText);
  factors.push(`Koordinat GPS: ${gpsPosition.latitude.toFixed(5)}, ${gpsPosition.longitude.toFixed(5)}`);
  if (weatherData?.current) {
    factors.push(`Suhu aktual dari Open-Meteo: ${weatherData.current.temperature_2m} °C`);
    factors.push(`Kelembapan aktual dari Open-Meteo: ${weatherData.current.relative_humidity_2m}%`);
    factors.push(`Curah hujan saat ini: ${weatherData.current.precipitation} mm`);
  } else {
    factors.push("Data cuaca aktual belum berhasil diambil");
  }

  document.getElementById("riskTitle").textContent = "Belum dapat ditentukan";
  document.getElementById("riskTitle").style.color = "#173528";
  document.getElementById("riskPercent").textContent = "—";
  document.getElementById("adviceText").textContent = "Data formulir berhasil dirangkum, tetapi tingkat risiko faktual belum dapat ditentukan tanpa data cuaca terverifikasi, data titik panas, dan metode penilaian yang tervalidasi. Hindari pembakaran terbuka. Jika melihat api atau asap, menjauh ke tempat aman dan laporkan kepada BPBD atau petugas setempat.";
  document.getElementById("sampleWarning").textContent = weatherData
    ? "Data cuaca berasal dari Open-Meteo dan koordinat dari GPS browser. Jenis lahan serta kondisi hujan yang dipilih adalah input pengguna. Data hotspot satelit dan analisis foto AI belum terhubung, sehingga tingkat risiko belum dapat ditentukan."
    : "Jenis lahan dan hujan berasal dari input pengguna. Data cuaca belum tersedia, data hotspot satelit belum terhubung, dan foto belum dianalisis oleh model AI.";
  renderFactors(factors);
  document.getElementById("resultCard").scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("Ringkasan informasi berhasil dibuat.");
});

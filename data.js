/* Data contoh (fiktif). Nanti bisa diganti dengan data dari database cloud. */

const KATEGORI = [
  "Food & Beverage", "Otomotif", "Kecantikan", "Kesehatan",
  "Pendidikan", "Daily Needs", "Hobi"
];

const MODEL_BISNIS = ["Franchise", "Kemitraan", "Peluang Usaha"];

const BATAS_MODAL = [
  { label: "Semua modal", nilai: 0 },
  { label: "Sampai Rp 25 juta", nilai: 25000000 },
  { label: "Sampai Rp 50 juta", nilai: 50000000 },
  { label: "Sampai Rp 100 juta", nilai: 100000000 },
  { label: "Sampai Rp 250 juta", nilai: 250000000 }
];

const FRANCHISES = [
  { id: "kopi-senja-kita", nama: "Kopi Senja Kita", kategori: "Food & Beverage", model: "Kemitraan",
    tagline: "Kopi keliling dengan sepeda motor", modal: 28000000, bep: 8, roi: 16,
    outlet: 120, berdiri: 2019, pengelolaan: "Self Managed", halal: true },
  { id: "es-teh-tepi-jalan", nama: "Es Teh Tepi Jalan", kategori: "Food & Beverage", model: "Franchise",
    tagline: "Es teh harga pelajar, gerai ringkas", modal: 8000000, bep: 3, roi: 40,
    outlet: 210, berdiri: 2020, pengelolaan: "Self Managed", halal: true },
  { id: "martabak-malam-minggu", nama: "Martabak Malam Minggu", kategori: "Food & Beverage", model: "Kemitraan",
    tagline: "Martabak artisan dengan sistem autopilot", modal: 120000000, bep: 8, roi: 13,
    outlet: 8, berdiri: 2023, pengelolaan: "Self Managed & Autopilot", halal: true },
  { id: "laundry-kilat-kita", nama: "Laundry Kilat Kita", kategori: "Daily Needs", model: "Kemitraan",
    tagline: "Laundry koin untuk area kos dan apartemen", modal: 120000000, bep: 16, roi: 12,
    outlet: 24, berdiri: 2021, pengelolaan: "Autopilot", halal: false },
  { id: "bimbel-cerdas-mandiri", nama: "Bimbel Cerdas Mandiri", kategori: "Pendidikan", model: "Franchise",
    tagline: "Bimbel SD dan SMP dengan modul siap pakai", modal: 75000000, bep: 18, roi: 25,
    outlet: 29, berdiri: 2018, pengelolaan: "Self Managed", halal: false },
  { id: "klinik-gigi-senyum", nama: "Klinik Gigi Senyum", kategori: "Kesehatan", model: "Kemitraan",
    tagline: "Klinik gigi dengan tarif terjangkau", modal: 250000000, bep: 30, roi: 10,
    outlet: 9, berdiri: 2022, pengelolaan: "Autopilot", halal: false },
  { id: "barber-rapi", nama: "Barber Rapi", kategori: "Kecantikan", model: "Franchise",
    tagline: "Barbershop dengan standar layanan seragam", modal: 60000000, bep: 11, roi: 33,
    outlet: 13, berdiri: 2016, pengelolaan: "Self Managed", halal: false },
  { id: "bengkel-motor-cepat", nama: "Bengkel Motor Cepat", kategori: "Otomotif", model: "Peluang Usaha",
    tagline: "Servis ringan motor tanpa antre lama", modal: 180000000, bep: 14, roi: 18,
    outlet: 6, berdiri: 2020, pengelolaan: "Self Managed", halal: false },
  { id: "sewa-sepeda-wisata", nama: "Sewa Sepeda Wisata", kategori: "Hobi", model: "Peluang Usaha",
    tagline: "Rental sepeda di kawasan wisata", modal: 45000000, bep: 12, roi: 20,
    outlet: 4, berdiri: 2022, pengelolaan: "Self Managed", halal: false }
];

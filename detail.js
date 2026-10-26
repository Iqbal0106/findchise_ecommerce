/* Logika halaman detail: menampilkan satu franchise berdasarkan parameter ?id= */

const idFranchise = new URLSearchParams(window.location.search).get("id");
const daftarFranchise = typeof FRANCHISES !== "undefined" ? FRANCHISES : [];
const franchise = daftarFranchise.find((f) => f.id === idFranchise) || null;

function barisInfo(label, nilai) {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(nilai)}</dd></div>`;
}

function tampilkanTidakDitemukan() {
  document.getElementById("judul-detail").textContent = "Franchise tidak ditemukan";
  document.getElementById("sub-detail").textContent =
    "Brand yang Anda cari tidak ada di katalog. Silakan pilih brand lain dari daftar.";
  document.getElementById("isi-detail").innerHTML =
    '<p class="empty">Data brand tidak ditemukan. <a class="link" href="index.html#franchise">Kembali ke katalog franchise</a>.</p>';
}

function tampilkanDetail(f) {
  document.title = f.nama + " - Findchisee";
  document.getElementById("judul-detail").textContent = f.nama;
  document.getElementById("sub-detail").textContent = f.tagline;

  const modalRingan = f.modal <= 50000000;

  document.getElementById("isi-detail").innerHTML = `
    <div class="dash-grid">
      <section class="panel span-4">
        <div class="panel-head">
          <div class="card-top">
            <span class="logo-tile" aria-hidden="true">${escapeHtml(f.nama.charAt(0))}</span>
            <div>
              <h2>${escapeHtml(f.nama)}</h2>
              <p class="card-kategori">${escapeHtml(f.kategori)}</p>
            </div>
          </div>
          <div class="badges">
            <span class="badge">${escapeHtml(f.model)}</span>
            ${f.halal ? '<span class="badge badge-halal">Halal</span>' : ""}
            <span class="badge">${escapeHtml(f.pengelolaan)}</span>
          </div>
        </div>
        <p class="card-tagline">${escapeHtml(f.tagline)}</p>
      </section>

      <section class="panel span-2">
        <h2>Estimasi investasi</h2>
        <p class="panel-desc">Angka berikut adalah data contoh yang bisa berubah sewaktu-waktu.</p>
        <dl class="detail-list">
          ${barisInfo("Modal mulai dari", formatRupiah(f.modal))}
          ${barisInfo("Perkiraan balik modal", f.bep + " bulan")}
          ${barisInfo("Estimasi ROI per tahun", f.roi + "%")}
          ${barisInfo("Kategori", f.kategori)}
          ${barisInfo("Model bisnis", f.model)}
          ${barisInfo("Sistem pengelolaan", f.pengelolaan)}
        </dl>
      </section>

      <section class="panel span-2">
        <h2>Profil brand</h2>
        <p class="panel-desc">Rekam jejak singkat brand di jaringan Findchisee.</p>
        <dl class="detail-list">
          ${barisInfo("Jumlah outlet", String(f.outlet))}
          ${barisInfo("Mulai beroperasi", String(f.berdiri))}
          ${barisInfo("Sertifikasi halal", f.halal ? "Sudah bersertifikat" : "Belum bersertifikat")}
          ${barisInfo("Skala modal", modalRingan ? "Ringan (di bawah Rp 50 juta)" : "Menengah ke atas")}
        </dl>
        <div class="pintasan">
          <a class="btn btn-solid" href="index.html#franchise">Bandingkan brand lain</a>
          <a class="btn btn-outline" href="dashboard.html">Buka dashboard</a>
        </div>
      </section>
    </div>`;
}

if (franchise) tampilkanDetail(franchise);
else tampilkanTidakDitemukan();

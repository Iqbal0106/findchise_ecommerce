/* Logika dashboard: tampilan berbeda untuk franchisee, franchisor, dan admin. */

function kartuStatistik(label, nilai, catatan, idNilai) {
  const id = idNilai ? ` id="${idNilai}"` : "";
  const idCatatan = idNilai ? ` id="${idNilai}-catatan"` : "";
  return `
    <article class="stat-card">
      <p class="stat-label">${escapeHtml(label)}</p>
      <p class="stat-nilai"${id}>${escapeHtml(nilai)}</p>
      ${catatan ? `<p class="stat-catatan"${idCatatan}>${escapeHtml(catatan)}</p>` : ""}
    </article>`;
}

function ringkasKatalog() {
  const daftar = typeof FRANCHISES !== "undefined" ? FRANCHISES : [];
  const modalTermurah = daftar.reduce((min, f) => Math.min(min, f.modal), Infinity);
  const kategori = new Set(daftar.map((f) => f.kategori));
  return {
    jumlah: daftar.length,
    modalTermurah: Number.isFinite(modalTermurah) ? modalTermurah : 0,
    kategori: kategori.size
  };
}

function daftarAkunHTML(pengguna) {
  return `
    <dl class="detail-list">
      <div><dt>Nama lengkap</dt><dd>${escapeHtml(pengguna.nama)}</dd></div>
      <div><dt>Email</dt><dd>${escapeHtml(pengguna.email)}</dd></div>
      <div><dt>Jenis akun</dt><dd>${escapeHtml(ROLE_LABEL[pengguna.role])}</dd></div>
      <div><dt>Status akun</dt><dd><span class="pill pill-${pengguna.status}">${escapeHtml(STATUS_LABEL[pengguna.status])}</span></dd></div>
      <div><dt>Terdaftar sejak</dt><dd>${escapeHtml(formatTanggal(pengguna.terdaftar))}</dd></div>
      <div><dt>ID akun</dt><dd class="mono">${escapeHtml(pengguna.id)}</dd></div>
    </dl>`;
}

/* ---------- Franchisee ---------- */

function renderFranchisee(pengguna) {
  const katalog = ringkasKatalog();
  document.getElementById("isi-dashboard").innerHTML = `
    <div class="dash-grid">
      ${kartuStatistik("Status akun", STATUS_LABEL[pengguna.status], "Akun calon franchisee aktif otomatis.")}
      ${kartuStatistik("Franchise di katalog", String(katalog.jumlah), "Siap dibandingkan")}
      ${kartuStatistik("Modal terendah", formatRupiah(katalog.modalTermurah), "Pilihan paling ringan")}
      ${kartuStatistik("Kategori tersedia", String(katalog.kategori), "Dari makanan sampai hobi")}

      <section class="panel span-2">
        <h2>Ringkasan akun</h2>
        <p class="panel-desc">Data akun yang Anda pakai untuk masuk ke Findchisee.</p>
        ${daftarAkunHTML(pengguna)}
      </section>

      <section class="panel span-2">
        <h2>Pintasan katalog</h2>
        <p class="panel-desc">Lanjutkan pencarian franchise sesuai modal Anda.</p>
        <div class="pintasan">
          <a class="btn btn-solid" href="index.html#franchise">Lihat semua franchise</a>
          <a class="btn btn-outline" href="index.html#franchise">Filter modal sampai Rp 25 juta</a>
          <a class="btn btn-outline" href="index.html#franchise">Cari brand kategori makanan</a>
        </div>
        <ul class="tips">
          <li>Gunakan filter <strong>Modal maksimal</strong> agar hasil sesuai kemampuan Anda.</li>
          <li>Buka <strong>Lihat detail</strong> pada kartu brand untuk melihat balik modal dan jumlah outlet.</li>
          <li>Simpan beberapa kandidat sebelum menghubungi franchisor.</li>
        </ul>
      </section>
    </div>`;
}

/* ---------- Franchisor ---------- */

function renderFranchisor(pengguna) {
  const statusPengelolaan = {
    pending: "Menunggu verifikasi admin",
    aktif: "Terverifikasi",
    nonaktif: "Ditangguhkan"
  }[pengguna.status];

  const catatanVerifikasi = {
    pending: "Tim admin sedang memeriksa data brand Anda. Selama menunggu, Anda tetap bisa melihat katalog.",
    aktif: "Brand Anda sudah terverifikasi dan dapat dikelola dari dashboard.",
    nonaktif: "Akun brand dinonaktifkan sementara. Hubungi admin Findchisee untuk aktivasi."
  }[pengguna.status];

  document.getElementById("isi-dashboard").innerHTML = `
    <div class="dash-grid">
      ${kartuStatistik("Status akun", STATUS_LABEL[pengguna.status], "Hasil verifikasi admin")}
      ${kartuStatistik("Pengelolaan brand", statusPengelolaan, "Status pendaftaran brand")}
      ${kartuStatistik("Terdaftar sejak", formatTanggal(pengguna.terdaftar), "Tanggal registrasi")}
      ${kartuStatistik("Jenis akun", ROLE_LABEL[pengguna.role], "Pemilik franchise")}

      <section class="panel span-2">
        <h2>Ringkasan profil bisnis</h2>
        <p class="panel-desc">Profil yang dipakai untuk mendaftarkan brand Anda.</p>
        ${daftarAkunHTML(pengguna)}
      </section>

      <section class="panel span-2">
        <h2>Status pengelolaan brand</h2>
        <p class="panel-desc">${escapeHtml(catatanVerifikasi)}</p>
        <ol class="langkah">
          <li class="${pengguna.status !== "pending" ? "selesai" : "aktif"}">Pendaftaran akun franchisor</li>
          <li class="${pengguna.status === "aktif" ? "selesai" : pengguna.status === "pending" ? "aktif" : ""}">Verifikasi data brand oleh admin</li>
          <li class="${pengguna.status === "aktif" ? "aktif" : ""}">Pengelolaan brand di katalog</li>
        </ol>
        <div class="pintasan">
          <a class="btn btn-solid" href="index.html#franchise">Lihat katalog brand</a>
          <a class="btn btn-outline" href="dashboard.html">Segarkan status</a>
        </div>
        <p class="hint">
          Penambahan data brand baru akan tersedia setelah terhubung ke backend. Versi demo ini
          belum menyimpan data brand dari sisi pengguna.
        </p>
      </section>
    </div>`;
}

/* ---------- Admin ---------- */

const filterAdmin = { cari: "", status: "", role: "" };

function penggunaTersaring() {
  return bacaPengguna().filter((u) =>
    (u.nama.toLowerCase().includes(filterAdmin.cari.toLowerCase()) ||
      u.email.toLowerCase().includes(filterAdmin.cari.toLowerCase())) &&
    (!filterAdmin.status || u.status === filterAdmin.status) &&
    (!filterAdmin.role || u.role === filterAdmin.role)
  );
}

function barisPengguna(u, adminSekarang) {
  const diriSendiri = u.id === adminSekarang.id;
  return `
    <tr>
      <td data-label="Nama">
        <span class="nama-user">${escapeHtml(u.nama)}</span>
        ${diriSendiri ? '<span class="badge">Anda</span>' : ""}
      </td>
      <td data-label="Email" class="mono">${escapeHtml(u.email)}</td>
      <td data-label="Jenis akun">${escapeHtml(ROLE_LABEL[u.role] || u.role)}</td>
      <td data-label="Status"><span class="pill pill-${u.status}">${escapeHtml(STATUS_LABEL[u.status] || u.status)}</span></td>
      <td data-label="Terdaftar">${escapeHtml(formatTanggal(u.terdaftar))}</td>
      <td data-label="Aksi">
        <select class="select-status" data-id="${escapeHtml(u.id)}" ${diriSendiri ? "disabled" : ""}
          aria-label="Ubah status ${escapeHtml(u.nama)}">
          ${Object.keys(STATUS).map((kunci) => {
            const nilai = STATUS[kunci];
            return `<option value="${nilai}" ${u.status === nilai ? "selected" : ""}>${escapeHtml(STATUS_LABEL[nilai])}</option>`;
          }).join("")}
        </select>
      </td>
    </tr>`;
}

function renderTabelAdmin(adminSekarang) {
  const daftar = penggunaTersaring();
  const badan = document.getElementById("badan-tabel-user");
  const kosong = document.getElementById("tabel-kosong");
  if (!badan) return;

  badan.innerHTML = daftar.map((u) => barisPengguna(u, adminSekarang)).join("");
  kosong.hidden = daftar.length > 0;

  const jumlah = document.getElementById("jumlah-user");
  if (jumlah) jumlah.textContent = `${daftar.length} dari ${bacaPengguna().length} pengguna`;
}

function renderAdmin(pengguna) {
  const stat = statistikPengguna();
  document.getElementById("isi-dashboard").innerHTML = `
    <div class="dash-grid">
      ${kartuStatistik("Total pengguna", String(stat.total), "Seluruh akun terdaftar", "stat-total")}
      ${kartuStatistik("Calon franchisee", String(stat.franchisee), "Pencari franchise", "stat-franchisee")}
      ${kartuStatistik("Pemilik franchise", String(stat.franchisor), `${stat.pending} menunggu verifikasi`, "stat-franchisor")}
      ${kartuStatistik("Admin", String(stat.admin), "Pengelola platform", "stat-admin")}

      <section class="panel span-4">
        <div class="panel-head">
          <div>
            <h2>Manajemen user</h2>
            <p class="panel-desc">Kelola status akun dan telusuri pengguna Findchisee.</p>
          </div>
          <p class="result-count" id="jumlah-user"></p>
        </div>

        <div class="toolbar">
          <div class="field field-wide">
            <label for="cari-user">Cari pengguna</label>
            <input type="search" id="cari-user" placeholder="Cari nama atau email">
          </div>
          <div class="field">
            <label for="filter-status">Status akun</label>
            <select id="filter-status">
              <option value="">Semua status</option>
              ${Object.keys(STATUS).map((kunci) =>
                `<option value="${STATUS[kunci]}">${escapeHtml(STATUS_LABEL[STATUS[kunci]])}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="filter-role">Jenis akun</label>
            <select id="filter-role">
              <option value="">Semua jenis</option>
              ${Object.values(ROLE).map((nilai) =>
                `<option value="${nilai}">${escapeHtml(ROLE_LABEL[nilai])}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="table-wrap">
          <table class="tabel-user">
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Email</th>
                <th scope="col">Jenis akun</th>
                <th scope="col">Status</th>
                <th scope="col">Terdaftar</th>
                <th scope="col">Ubah status</th>
              </tr>
            </thead>
            <tbody id="badan-tabel-user"></tbody>
          </table>
        </div>
        <p class="empty" id="tabel-kosong" hidden>Tidak ada pengguna yang cocok dengan pencarian atau filter ini.</p>

        <p class="hint">
          Status akun hanya bisa diubah admin. Peran admin tidak dapat dibuat lewat form registrasi
          dan tidak ada kredensial admin tetap di dalam kode.
        </p>
      </section>
    </div>`;

  renderTabelAdmin(pengguna);

  document.getElementById("cari-user").addEventListener("input", (e) => {
    filterAdmin.cari = e.target.value;
    renderTabelAdmin(pengguna);
  });
  document.getElementById("filter-status").addEventListener("change", (e) => {
    filterAdmin.status = e.target.value;
    renderTabelAdmin(pengguna);
  });
  document.getElementById("filter-role").addEventListener("change", (e) => {
    filterAdmin.role = e.target.value;
    renderTabelAdmin(pengguna);
  });

  document.getElementById("badan-tabel-user").addEventListener("change", (e) => {
    const pilihan = e.target.closest(".select-status");
    if (!pilihan) return;
    try {
      ubahStatusPengguna(pilihan.dataset.id, pilihan.value);
      renderTabelAdmin(pengguna);

      const statBaru = statistikPengguna();
      document.getElementById("stat-total").textContent = String(statBaru.total);
      document.getElementById("stat-franchisee").textContent = String(statBaru.franchisee);
      document.getElementById("stat-franchisor").textContent = String(statBaru.franchisor);
      document.getElementById("stat-franchisor-catatan").textContent = `${statBaru.pending} menunggu verifikasi`;
      document.getElementById("stat-admin").textContent = String(statBaru.admin);
    } catch (kesalahan) {
      window.alert(kesalahan.message);
    }
  });
}

/* ---------- Mulai ---------- */

function mulaiDashboard() {
  const pengguna = wajibMasuk();
  if (!pengguna) return;

  document.getElementById("label-peran").textContent = "Dashboard " + ROLE_LABEL[pengguna.role];
  document.getElementById("sapaan").textContent = "Halo, " + pengguna.nama;
  document.getElementById("sub-sapaan").textContent =
    pengguna.role === ROLE.ADMIN
      ? "Pantau pengguna dan status akun platform Findchisee."
      : pengguna.role === ROLE.FRANCHISOR
        ? "Pantau status verifikasi dan pengelolaan brand Anda."
        : "Ringkasan akun Anda dan pintasan menuju katalog franchise.";

  if (pengguna.role === ROLE.ADMIN) renderAdmin(pengguna);
  else if (pengguna.role === ROLE.FRANCHISOR) renderFranchisor(pengguna);
  else renderFranchisee(pengguna);
}

mulaiDashboard();

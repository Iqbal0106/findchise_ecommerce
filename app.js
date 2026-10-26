/* Logika halaman beranda: render filter, filter data, render kartu. */

const state = { cari: "", model: "", modalMaks: 0, kategori: "" };

const el = {
  chips: document.getElementById("chips"),
  cari: document.getElementById("cari"),
  model: document.getElementById("model"),
  modal: document.getElementById("modal"),
  daftar: document.getElementById("daftar-merchant"),
  jumlah: document.getElementById("jumlah-hasil"),
  kosong: document.getElementById("kosong")
};

function renderChips() {
  const semua = ["Semua", ...KATEGORI];
  el.chips.innerHTML = semua.map((nama) => {
    const nilai = nama === "Semua" ? "" : nama;
    const aktif = state.kategori === nilai;
    return `<button type="button" class="chip" data-kategori="${nilai}" aria-pressed="${aktif}">${nama}</button>`;
  }).join("");
}

function renderSelects() {
  el.model.innerHTML = `<option value="">Semua model</option>` +
    MODEL_BISNIS.map((m) => `<option value="${m}">${m}</option>`).join("");
  el.modal.innerHTML = BATAS_MODAL
    .map((b) => `<option value="${b.nilai}">${b.label}</option>`).join("");
}

/* ---------- Filter & render kartu ---------- */

function getHasil() {
  return FRANCHISES.filter((f) =>
    f.nama.toLowerCase().includes(state.cari.toLowerCase()) &&
    (!state.kategori || f.kategori === state.kategori) &&
    (!state.model || f.model === state.model) &&
    (!state.modalMaks || f.modal <= state.modalMaks)
  );
}

function kartuHTML(f) {
  return `
    <article class="card">
      <div class="card-top">
        <span class="logo-tile" aria-hidden="true">${f.nama.charAt(0)}</span>
        <div>
          <h3>${f.nama}</h3>
          <p class="card-kategori">${f.kategori}</p>
        </div>
      </div>
      <p class="card-tagline">${f.tagline}</p>
      <div class="badges">
        <span class="badge">${f.model}</span>
        ${f.halal ? '<span class="badge badge-halal">Halal</span>' : ""}
      </div>
      <p class="modal-label">Modal mulai dari</p>
      <p class="modal-nilai">${formatRupiah(f.modal)}</p>
      <dl class="stats">
        <div><dt>Balik modal</dt><dd>${f.bep} bulan</dd></div>
        <div><dt>ROI</dt><dd>${f.roi}%</dd></div>
        <div><dt>Outlet</dt><dd>${f.outlet}</dd></div>
        <div><dt>Berdiri</dt><dd>${f.berdiri}</dd></div>
      </dl>
      <div class="card-bottom">
        <span class="pengelolaan">${f.pengelolaan}</span>
        <a class="btn btn-outline" href="detail.html?id=${f.id}">Lihat detail</a>
      </div>
    </article>`;
}

function render() {
  const hasil = getHasil();
  el.daftar.innerHTML = hasil.map(kartuHTML).join("");
  el.jumlah.textContent = `${hasil.length} dari ${FRANCHISES.length} franchise`;
  el.kosong.hidden = hasil.length > 0;
}

/* ---------- Event ---------- */

el.chips.addEventListener("click", (e) => {
  const tombol = e.target.closest(".chip");
  if (!tombol) return;
  state.kategori = tombol.dataset.kategori;
  renderChips();
  render();
});

el.cari.addEventListener("input", (e) => { state.cari = e.target.value; render(); });
el.model.addEventListener("change", (e) => { state.model = e.target.value; render(); });
el.modal.addEventListener("change", (e) => { state.modalMaks = Number(e.target.value); render(); });
document.getElementById("filter-form").addEventListener("submit", (e) => e.preventDefault());

/* ---------- Mulai ---------- */

renderSelects();
renderChips();
render();

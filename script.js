// ==========================================
// 1. NEON CURSOR GLOW EFFECT
// ==========================================
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
  if (cursorGlow) {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  }
});

// ==========================================
// 2. MODAL & TAB SYSTEM
// ==========================================
function openMenu(tabId) {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'flex';

  // Sembunyikan semua section tab
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Tampilkan tab yang dipilih
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // Render ulang grafik atau data spesifik jika dibutuhkan
  if (tabId === 'tabungan') renderTabungan();
  if (tabId === 'kalori') renderKalori();
  if (tabId === 'catatan') {
    renderNotes();
    renderGallery();
    initCanvas();
  }
}

function closeMenu() {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'none';
}

// Close modal saat klik di luar area modal container
window.addEventListener('click', (e) => {
  const overlay = document.getElementById('modal-overlay');
  if (e.target === overlay) {
    closeMenu();
  }
});

// ==========================================
// 3. E-WALLET (DANA)
// ==========================================
function saveSaldoDana() {
  const input = document.getElementById('dana-saldo');
  const val = parseFloat(input.value) || 0;
  localStorage.setItem('wiber_dana_saldo', val);
  displayDana();
  input.value = '';
}

function displayDana() {
  const val = parseFloat(localStorage.getItem('wiber_dana_saldo')) || 0;
  const display = document.getElementById('display-dana');
  if (display) {
    display.textContent = 'Rp ' + val.toLocaleString('id-ID');
  }
}

// ==========================================
// 4. TABUNGAN & CHART.JS
// ==========================================
let tabunganChart = null;

function addTransaksiTabungan() {
  const alasan = document.getElementById('tab-alasan').value.trim();
  const nominal = parseFloat(document.getElementById('tab-nominal').value) || 0;
  const tipe = document.getElementById('tab-tipe').value;
  const bulan = document.getElementById('tab-bulan').value;

  if (!alasan || nominal <= 0) {
    alert('Mohon isi alasan dan nominal dengan benar!');
    return;
  }

  const list = JSON.parse(localStorage.getItem('wiber_tabungan')) || [];
  list.push({ alasan, nominal, tipe, bulan, id: Date.now() });
  localStorage.setItem('wiber_tabungan', JSON.stringify(list));

  document.getElementById('tab-alasan').value = '';
  document.getElementById('tab-nominal').value = '';
  renderTabungan();
}

function deleteTabungan(id) {
  let list = JSON.parse(localStorage.getItem('wiber_tabungan')) || [];
  list = list.filter(item => item.id !== id);
  localStorage.setItem('wiber_tabungan', JSON.stringify(list));
  renderTabungan();
}

function renderTabungan() {
  const list = JSON.parse(localStorage.getItem('wiber_tabungan')) || [];
  const filterBulan = document.getElementById('filter-bulan').value;
  const ul = document.getElementById('list-tabungan');
  ul.innerHTML = '';

  let totalSaldo = 0;
  const monthlyData = {};

  list.forEach(item => {
    // Hitung total saldo akumulasi
    if (item.tipe === 'setor') totalSaldo += item.nominal;
    else totalSaldo -= item.nominal;

    // Rekap per bulan untuk chart
    if (!monthlyData[item.bulan]) monthlyData[item.bulan] = 0;
    if (item.tipe === 'setor') monthlyData[item.bulan] += item.nominal;
    else monthlyData[item.bulan] -= item.nominal;

    // Filter daftar li
    if (filterBulan === 'Semua' || item.bulan === filterBulan) {
      const li = document.createElement('li');
      li.style.margin = '5px 0';
      const color = item.tipe === 'setor' ? '#2ecc71' : '#e74c3c';
      const prefix = item.tipe === 'setor' ? '+' : '-';
      li.innerHTML = `[${item.bulan}] <strong>${item.alasan}</strong>: <span style="color:${color}">${prefix}Rp ${item.nominal.toLocaleString('id-ID')}</span> 
      <button onclick="deleteTabungan(${item.id})" style="background:#e74c3c; padding:2px 6px; font-size:10px; margin-left:10px;">X</button>`;
      ul.appendChild(li);
    }
  });

  document.getElementById('total-tabungan').textContent = 'Rp ' + totalSaldo.toLocaleString('id-ID');

  // Render Chart.js
  const ctx = document.getElementById('chartTabungan').getContext('2d');
  const labels = Object.keys(monthlyData);
  const dataValues = Object.values(monthlyData);

  if (tabunganChart) tabunganChart.destroy();
  tabunganChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Net Tabungan (Rp)',
        data: dataValues,
        backgroundColor: 'rgba(0, 255, 255, 0.5)',
        borderColor: 'rgba(0, 255, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ==========================================
// 5. CATATAN & CANVAS MENGGAMBAR
// ==========================================
function saveNote() {
  const title = document.getElementById('note-title').value.trim();
  const body = document.getElementById('note-body').value.trim();

  if (!title || !body) {
    alert('Isi judul dan isi catatan!');
    return;
  }

  const notes = JSON.parse(localStorage.getItem('wiber_notes')) || [];
  notes.push({ title, body, id: Date.now() });
  localStorage.setItem('wiber_notes', JSON.stringify(notes));

  document.getElementById('note-title').value = '';
  document.getElementById('note-body').value = '';
  renderNotes();
}

function deleteNote(id) {
  let notes = JSON.parse(localStorage.getItem('wiber_notes')) || [];
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem('wiber_notes', JSON.stringify(notes));
  renderNotes();
}

function renderNotes() {
  const notes = JSON.parse(localStorage.getItem('wiber_notes')) || [];
  const container = document.getElementById('notes-list');
  container.innerHTML = '';

  notes.forEach(n => {
    const div = document.createElement('div');
    div.style.background = 'rgba(0,0,0,0.3)';
    div.style.padding = '10px';
    div.style.borderRadius = '6px';
    div.style.marginTop = '10px';
    div.innerHTML = `
      <h4 style="margin:0 0 5px 0;">${n.title}</h4>
      <p style="margin:0; font-size:14px; color:#ccc;">${n.body}</p>
      <button onclick="deleteNote(${n.id})" style="background:#e74c3c; font-size:11px; padding:3px 8px; margin-top:5px;">Hapus</button>
    `;
    container.appendChild(div);
  });
}

// CANVAS PAINTING
let canvas, ctx, painting = false;

function initCanvas() {
  canvas = document.getElementById('paintCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  canvas.onmousedown = startPosition;
  canvas.onmouseup = finishedPosition;
  canvas.onmousemove = draw;
}

function startPosition(e) {
  painting = true;
  draw(e);
}

function finishedPosition() {
  painting = false;
  ctx.beginPath();
}

function draw(e) {
  if (!painting) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.lineWidth = document.getElementById('brush-size').value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = document.getElementById('brush-color').value;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function setEraser() {
  document.getElementById('brush-color').value = '#ffffff';
}

function clearCanvas() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ==========================================
// 6. GALERI FOTO (MAKS 100 FOTO)
// ==========================================
function uploadPhoto() {
  const fileInput = document.getElementById('photo-input');
  const captionInput = document.getElementById('photo-caption-input');
  const gallery = JSON.parse(localStorage.getItem('wiber_gallery')) || [];

  if (gallery.length >= 100) {
    alert('Batas maksimal 100 foto telah tercapai!');
    return;
  }

  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const base64Image = e.target.result;
      gallery.push({
        id: Date.now(),
        image: base64Image,
        caption: captionInput.value.trim() || 'Tanpa keterangan'
      });

      try {
        localStorage.setItem('wiber_gallery', JSON.stringify(gallery));
        fileInput.value = '';
        captionInput.value = '';
        renderGallery();
      } catch (err) {
        alert('Gagal menyimpan foto! Kemungkinan ukuran file terlalu besar untuk LocalStorage.');
      }
    };

    reader.readAsDataURL(file);
  } else {
    alert('Silakan pilih foto terlebih dahulu!');
  }
}

function deletePhoto(id) {
  let gallery = JSON.parse(localStorage.getItem('wiber_gallery')) || [];
  gallery = gallery.filter(photo => photo.id !== id);
  localStorage.setItem('wiber_gallery', JSON.stringify(gallery));
  renderGallery();
}

function editPhotoCaption(id) {
  let gallery = JSON.parse(localStorage.getItem('wiber_gallery')) || [];
  const photo = gallery.find(p => p.id === id);

  if (photo) {
    const newCaption = prompt('Ubah keterangan foto:', photo.caption);
    if (newCaption !== null) {
      photo.caption = newCaption.trim() || 'Tanpa keterangan';
      localStorage.setItem('wiber_gallery', JSON.stringify(gallery));
      renderGallery();
    }
  }
}

function renderGallery() {
  const gallery = JSON.parse(localStorage.getItem('wiber_gallery')) || [];
  const galleryContainer = document.getElementById('photo-gallery');
  const countSpan = document.getElementById('photo-count');

  if (countSpan) countSpan.textContent = gallery.length;
  if (!galleryContainer) return;

  galleryContainer.innerHTML = '';

  gallery.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.innerHTML = `
      <img src="${photo.image}" alt="Foto">
      <div class="photo-caption">${photo.caption}</div>
      <div class="photo-actions">
        <button class="btn-edit" onclick="editPhotoCaption(${photo.id})">Edit</button>
        <button class="btn-delete" onclick="deletePhoto(${photo.id})">Hapus</button>
      </div>
    `;
    galleryContainer.appendChild(card);
  });
}

// ==========================================
// 7. TRACK KALORI & CHART
// ==========================================
let kaloriChart = null;

function addFood() {
  const name = document.getElementById('food-name').value.trim();
  const cal = parseFloat(document.getElementById('food-cal').value) || 0;
  const reason = document.getElementById('food-reason').value.trim();

  if (!name || cal <= 0) {
    alert('Isi nama makanan dan jumlah kalori!');
    return;
  }

  const list = JSON.parse(localStorage.getItem('wiber_kalori')) || [];
  list.push({ name, cal, reason, id: Date.now() });
  localStorage.setItem('wiber_kalori', JSON.stringify(list));

  document.getElementById('food-name').value = '';
  document.getElementById('food-cal').value = '';
  document.getElementById('food-reason').value = '';
  renderKalori();
}

function deleteFood(id) {
  let list = JSON.parse(localStorage.getItem('wiber_kalori')) || [];
  list = list.filter(item => item.id !== id);
  localStorage.setItem('wiber_kalori', JSON.stringify(list));
  renderKalori();
}

function renderKalori() {
  const list = JSON.parse(localStorage.getItem('wiber_kalori')) || [];
  const ul = document.getElementById('list-makanan');
  ul.innerHTML = '';

  const freqMap = {};

  list.forEach(item => {
    freqMap[item.name] = (freqMap[item.name] || 0) + 1;

    const li = document.createElement('li');
    li.style.margin = '5px 0';
    li.innerHTML = `<strong>${item.name}</strong> - ${item.cal} kcal (${item.reason || 'Tanpa catatan'})
    <button onclick="deleteFood(${item.id})" style="background:#e74c3c; padding:2px 6px; font-size:10px; margin-left:10px;">X</button>`;
    ul.appendChild(li);
  });

  const ctx = document.getElementById('chartKalori').getContext('2d');
  const labels = Object.keys(freqMap);
  const dataValues = Object.values(freqMap);

  if (kaloriChart) kaloriChart.destroy();
  kaloriChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: [
          '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#9966ff'
        ]
      }]
    },
    options: { responsive: true }
  });
}

// ==========================================
// 8. KUSTOMISASI TAMPILAN
// ==========================================
function changeBg(url) {
  document.body.style.backgroundImage = `url('${url}')`;
  localStorage.setItem('wiber_bg', url);
}

function changeBlur(val) {
  document.documentElement.style.setProperty('--blur-val', `${val}px`);
  localStorage.setItem('wiber_blur', val);
}

function changeGlowColor(color) {
  document.documentElement.style.setProperty('--glow-color', color);
  localStorage.setItem('wiber_glow', color);
}

function changeFont(fontFamily) {
  document.body.style.fontFamily = fontFamily;
  localStorage.setItem('wiber_font', fontFamily);
}

// Load kustomisasi tersimpan saat web dibuka
window.addEventListener('DOMContentLoaded', () => {
  displayDana();

  const savedBg = localStorage.getItem('wiber_bg');
  if (savedBg) document.body.style.backgroundImage = `url('${savedBg}')`;

  const savedBlur = localStorage.getItem('wiber_blur');
  if (savedBlur) {
    document.documentElement.style.setProperty('--blur-val', `${savedBlur}px`);
    const slider = document.getElementById('blur-range');
    if (slider) slider.value = savedBlur;
  }

  const savedGlow = localStorage.getItem('wiber_glow');
  if (savedGlow) {
    document.documentElement.style.setProperty('--glow-color', savedGlow);
    const picker = document.getElementById('glow-color');
    if (picker) picker.value = savedGlow;
  }

  const savedFont = localStorage.getItem('wiber_font');
  if (savedFont) document.body.style.fontFamily = savedFont;
});

// Modal Overlay Navigation System
function openMenu(menuId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(menuId).classList.add('active');
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeMenu() {
  document.getElementById('modal-overlay').style.display = 'none';
}

// Close modal when clicking outside of container
window.onclick = function(event) {
  const modal = document.getElementById('modal-overlay');
  if (event.target === modal) {
    closeMenu();
  }
};

// Cursor Light Track Effect
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

// 1. E-Wallet DANA Logic
function saveSaldoDana() {
  const val = document.getElementById('dana-saldo').value;
  localStorage.setItem('dana_saldo', val);
  renderDana();
}
function renderDana() {
  const val = localStorage.getItem('dana_saldo') || '0';
  document.getElementById('display-dana').innerText = 'Rp ' + Number(val).toLocaleString('id-ID');
}
renderDana();

// 2. Tabungan System
let dataTabungan = JSON.parse(localStorage.getItem('tabungan_data')) || [];
let chartTabunganInstance = null;

function addTransaksiTabungan() {
  const alasan = document.getElementById('tab-alasan').value;
  const nominal = parseFloat(document.getElementById('tab-nominal').value);
  const tipe = document.getElementById('tab-tipe').value;
  const bulan = document.getElementById('tab-bulan').value;

  if (!alasan || isNaN(nominal)) return alert('Isi data dengan benar');

  dataTabungan.push({ alasan, nominal, tipe, bulan, date: new Date().toLocaleDateString() });
  localStorage.setItem('tabungan_data', JSON.stringify(dataTabungan));
  renderTabungan();
}

function renderTabungan() {
  const filter = document.getElementById('filter-bulan').value;
  const list = document.getElementById('list-tabungan');
  list.innerHTML = '';
  let total = 0;

  const filtered = filter === 'Semua' ? dataTabungan : dataTabungan.filter(x => x.bulan === filter);

  filtered.forEach(item => {
    total += item.tipe === 'setor' ? item.nominal : -item.nominal;
    const li = document.createElement('li');
    li.innerText = `[${item.bulan}] ${item.tipe.toUpperCase()}: Rp ${item.nominal.toLocaleString()} - ${item.alasan}`;
    list.appendChild(li);
  });

  document.getElementById('total-tabungan').innerText = 'Rp ' + total.toLocaleString('id-ID');
  renderTabunganChart(filtered);
}

function renderTabunganChart(data) {
  const ctx = document.getElementById('chartTabungan').getContext('2d');
  if (chartTabunganInstance) chartTabunganInstance.destroy();

  let runningTotal = 0;
  const labels = data.map((_, i) => `Trx ${i + 1}`);
  const points = data.map(item => {
    runningTotal += item.tipe === 'setor' ? item.nominal : -item.nominal;
    return runningTotal;
  });

  chartTabunganInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{ label: 'Perkembangan Saldo', data: points, borderColor: '#00ffff', fill: false }]
    }
  });
}
renderTabungan();

// 3. Catatan & Drawing
let notes = JSON.parse(localStorage.getItem('notes_data')) || [];
function saveNote() {
  const title = document.getElementById('note-title').value;
  const body = document.getElementById('note-body').value;
  notes.push({ title, body });
  localStorage.setItem('notes_data', JSON.stringify(notes));
  renderNotes();
}
function renderNotes() {
  const div = document.getElementById('notes-list');
  div.innerHTML = '';
  notes.forEach((n, i) => {
    div.innerHTML += `<div><h4>${n.title}</h4><p>${n.body}</p></div>`;
  });
}
renderNotes();

// Canvas Logic
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineWidth = document.getElementById('brush-size').value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = document.getElementById('brush-color').value;

  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function setEraser() { document.getElementById('brush-color').value = '#ffffff'; }
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

// Photo Upload, Edit, & Delete Logic (Maks 100 Foto)
let photos = JSON.parse(localStorage.getItem('user_photos')) || [];

function uploadPhoto() {
  if (photos.length >= 100) return alert('Batas 100 foto tersimpan sudah tercapai!');
  
  const fileInput = document.getElementById('photo-input');
  const captionInput = document.getElementById('photo-caption-input');
  const file = fileInput.files[0];

  if (!file) return alert('Pilih foto terlebih dahulu!');

  const reader = new FileReader();
  reader.onloadend = () => {
    photos.push({
      id: Date.now(),
      src: reader.result,
      caption: captionInput.value || 'Tanpa Keterangan'
    });
    localStorage.setItem('user_photos', JSON.stringify(photos));
    fileInput.value = '';
    captionInput.value = '';
    renderPhotos();
  };
  reader.readAsDataURL(file);
}

function renderPhotos() {
  const gallery = document.getElementById('photo-gallery');
  gallery.innerHTML = '';

  photos.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'photo-card';

    card.innerHTML = `
      <img src="${item.src}" alt="Foto">
      <div class="photo-caption">${item.caption}</div>
      <div class="photo-actions">
        <button class="btn-edit" onclick="editPhoto(${index})">Edit</button>
        <button class="btn-delete" onclick="deletePhoto(${index})">Hapus</button>
      </div>
    `;

    gallery.appendChild(card);
  });

  document.getElementById('photo-count').innerText = photos.length;
}

function deletePhoto(index) {
  if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
    photos.splice(index, 1);
    localStorage.setItem('user_photos', JSON.stringify(photos));
    renderPhotos();
  }
}

function editPhoto(index) {
  const newCaption = prompt('Edit keterangan foto:', photos[index].caption);
  if (newCaption !== null) {
    photos[index].caption = newCaption;
    
    if (confirm('Apakah kamu juga ingin mengganti gambar foto ini?')) {
      const tempInput = document.createElement('input');
      tempInput.type = 'file';
      tempInput.accept = 'image/*';
      tempInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            photos[index].src = reader.result;
            localStorage.setItem('user_photos', JSON.stringify(photos));
            renderPhotos();
          };
          reader.readAsDataURL(file);
        }
      };
      tempInput.click();
    } else {
      localStorage.setItem('user_photos', JSON.stringify(photos));
      renderPhotos();
    }
  }
}

renderPhotos();

// 4. Kalori & Makanan System
let foodData = JSON.parse(localStorage.getItem('food_data')) || [];
let chartKaloriInstance = null;

function addFood() {
  const name = document.getElementById('food-name').value;
  const cal = parseFloat(document.getElementById('food-cal').value);
  const reason = document.getElementById('food-reason').value;

  if (!name || isNaN(cal)) return alert('Isi data makanan');
  foodData.push({ name, cal, reason });
  localStorage.setItem('food_data', JSON.stringify(foodData));
  renderFood();
}

function renderFood() {
  const list = document.getElementById('list-makanan');
  list.innerHTML = '';
  const counts = {};

  foodData.forEach(item => {
    counts[item.name] = (counts[item.name] || 0) + 1;
    const li = document.createElement('li');
    li.innerText = `${item.name} (${item.cal} kcal) - Note: ${item.reason}`;
    list.appendChild(li);
  });

  renderFoodChart(counts);
}

function renderFoodChart(counts) {
  const ctx = document.getElementById('chartKalori').getContext('2d');
  if (chartKaloriInstance) chartKaloriInstance.destroy();

  chartKaloriInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{ label: 'Jumlah Dibeli', data: Object.values(counts), backgroundColor: '#00ffff' }]
    }
  });
}
renderFood();

// 5. Tampilan Customization
function changeBg(url) { document.body.style.backgroundImage = `url('${url}')`; }
function changeBlur(val) { document.documentElement.style.setProperty('--blur-val', val + 'px'); }
function changeGlowColor(color) { document.documentElement.style.setProperty('--glow-color', color); }
function changeFont(font) { document.body.style.fontFamily = font; }

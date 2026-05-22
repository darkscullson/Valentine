/* =============================================
   VALENTINE SITE — app.js
   Shared data store & utilities
   ============================================= */

// ---- DATA STORE (localStorage) ----

const STORE_MSGS = 'val_messages';
const STORE_IMGS = 'val_images';
const STORE_VIDS = 'val_videos';

function getMessages() {
  try {
    return JSON.parse(localStorage.getItem(STORE_MSGS) || '[]');
  } catch { return []; }
}

function saveMessage(msg) {
  const msgs = getMessages();
  msg.id = Date.now();
  msg.date = new Date().toLocaleDateString('fr-FR');
  msgs.unshift(msg);
  localStorage.setItem(STORE_MSGS, JSON.stringify(msgs));
  return msg;
}

function getImages() {
  try {
    return JSON.parse(localStorage.getItem(STORE_IMGS) || '[]');
  } catch { return []; }
}

function saveImage(img) {
  const imgs = getImages();
  img.id = Date.now();
  img.date = new Date().toLocaleDateString('fr-FR');
  imgs.unshift(img);
  localStorage.setItem(STORE_IMGS, JSON.stringify(imgs));
}

function getVideos() {
  try {
    return JSON.parse(localStorage.getItem(STORE_VIDS) || '[]');
  } catch { return []; }
}

function saveVideo(vid) {
  const vids = getVideos();
  vid.id = Date.now();
  vid.date = new Date().toLocaleDateString('fr-FR');
  vids.unshift(vid);
  localStorage.setItem(STORE_VIDS, JSON.stringify(vids));
}

// ---- GROUPS CONFIG ----
const GROUPS = [
  { id: 'rochefort', label: 'Rochefort', icon: '⚓' },
  { id: 'poitiers', label: 'Poitiers', icon: '🏛️' },
  { id: 'famille', label: 'Famille', icon: '🏠' },
  { id: 'fac', label: 'Fac / École', icon: '🎓' },
  { id: 'sport', label: 'Sport', icon: '🏃' },
  { id: 'voyage', label: 'Voyages', icon: '✈️' },
  { id: 'landsat', label: 'Landsat / SIG', icon: '🛰️' },
  { id: 'autre', label: 'Autre', icon: '💫' },
];

function getGroupLabel(id) {
  const g = GROUPS.find(g => g.id === id);
  return g ? g.label : id;
}

function getGroupIcon(id) {
  const g = GROUPS.find(g => g.id === id);
  return g ? g.icon : '💫';
}

// ---- SAMPLE DATA (seeded on first load) ----
function seedData() {
  if (localStorage.getItem('val_seeded')) return;

  const msgs = [
    { name: 'Marie', city: 'Rochefort', group: 'rochefort', text: 'Tu es aussi précieuse qu\'une image rare capturée depuis l\'espace. On est tellement fiers de toi !', date: '15/05/2025' },
    { name: 'Thomas', city: 'Poitiers', group: 'poitiers', text: 'Chaque couche de données te ressemble : complexe, belle et pleine de sens. Bonne fête Valentine !', date: '14/05/2025' },
    { name: 'Maman & Papa', city: '', group: 'famille', text: 'On est si fiers de ce que tu accomplis. Ce cadeau depuis l\'espace, c\'est un peu comme notre amour pour toi : infini.', date: '13/05/2025' },
    { name: 'Lucie', city: 'Poitiers', group: 'fac', text: 'Binôme de SIG préférée ! Tu m\'as appris à voir la Terre autrement. Merci pour tout ❤', date: '12/05/2025' },
    { name: 'Le club de rando', city: 'Rochefort', group: 'rochefort', text: 'Nos sorties en nature, c\'est encore plus beau depuis qu\'on les voit aussi depuis l\'espace avec toi 😄', date: '11/05/2025' },
  ];

  msgs.forEach((m, i) => { m.id = 1000 + i; });
  localStorage.setItem(STORE_MSGS, JSON.stringify(msgs));

  const vids = [
    { title: 'Soirée Rochefort été 2024', group: 'rochefort', url: '', type: 'upload', thumb: '', date: '01/06/2024' },
    { title: 'Soutenance de projet SIG', group: 'fac', url: '', type: 'upload', thumb: '', date: '10/04/2024' },
    { title: 'Vacances en famille', group: 'famille', url: '', type: 'upload', thumb: '', date: '15/08/2024' },
  ];
  vids.forEach((v, i) => { v.id = 2000 + i; });
  localStorage.setItem(STORE_VIDS, JSON.stringify(vids));

  localStorage.setItem('val_seeded', '1');
}

seedData();

// ---- TICKER LIVE UPDATES ----
function updateTopTicker() {
  const el = document.getElementById('ticker-top');
  if (!el) return;
  const msgs = getMessages().slice(0, 5);
  if (msgs.length === 0) return;
  const parts = msgs.map(m => `<span>« ${m.text.slice(0, 55)}${m.text.length > 55 ? '…' : ''} » — ${m.name}</span><span class="heart-red">♥</span>`).join('');
  el.innerHTML = parts + parts;
}

// ---- MSG PEEK (index page) ----
function renderMsgPeek(containerId, count) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const msgs = getMessages().slice(0, count);
  if (msgs.length === 0) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Soyez le premier à laisser un message !</div>';
    return;
  }
  el.innerHTML = msgs.map(m => `
    <div class="msg-card fade-in">
      « ${m.text} »
      <div class="msg-author-small">— ${m.name}${m.city ? ', ' + m.city : ''} &nbsp;·&nbsp; ${getGroupIcon(m.group)} ${getGroupLabel(m.group)}</div>
    </div>
  `).join('');
}

// ---- INITIALS AVATAR ----
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ---- NAV MOBILE ----
function toggleMenu() {
  document.getElementById('nav-mobile').classList.toggle('open');
}

// ---- LIGHTBOX ----
function openLightbox(src, caption) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.querySelector('.lightbox-img').src = src;
  lb.querySelector('.lightbox-caption').textContent = caption || '';
  lb.classList.add('open');
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeVideoModal(); }
});

// ---- VIDEO MODAL ----
function openVideoModal(vid) {
  const modal = document.getElementById('video-modal');
  if (!modal) return;
  modal.querySelector('.video-modal-title').textContent = vid.title;
  const embed = modal.querySelector('.video-embed');
  if (vid.url && vid.url.includes('youtube')) {
    const id = vid.url.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1];
    embed.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe>`;
  } else if (vid.url && vid.url.includes('youtu.be')) {
    const id = vid.url.split('/').pop();
    embed.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe>`;
  } else {
    embed.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3);font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;flex-direction:column;gap:1rem;"><i class="fa fa-film" style="font-size:2rem"></i>Vidéo à uploader<br><span style="font-size:9px;opacity:0.5">${vid.title}</span></div>`;
  }
  modal.classList.add('open');
}

function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  if (!modal) return;
  modal.querySelector('.video-embed').innerHTML = '';
  modal.classList.remove('open');
}

// ---- YOUTUBE THUMBNAIL ----
function getYtThumb(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}

// Init ticker on load
window.addEventListener('DOMContentLoaded', () => {
  updateTopTicker();
});

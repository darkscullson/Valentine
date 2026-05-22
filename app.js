/* =============================================
   VALENTINE SITE — SUPABASE
============================================= */

const SUPABASE_URL = "https://ospciieqvkopxzeilrnc.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zcGNpaWVxdmtvcHh6ZWlscm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDU4ODQsImV4cCI6MjA5NTAyMTg4NH0.7_YTNPyvINLlxK9KwxXzg6DsRjMIt93evfkU56iU8VA";

const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

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

// ---- MESSAGES ----
async function getMessages() {
  const { data, error } = await sb
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(m => ({
    id: m.id,
    name: m.name,
    city: m.city,
    group: m.group_name,
    text: m.text,
    date: new Date(m.created_at).toLocaleDateString('fr-FR')
  }));
}

async function saveMessage(msg) {
  const { error } = await sb
    .from('messages')
    .insert({
      name: msg.name,
      city: msg.city,
      group_name: msg.group,
      text: msg.text
    });

  if (error) console.error(error);
}

// ---- PHOTOS ----
async function getImages() {
  const { data, error } = await sb
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(i => ({
    id: i.id,
    src: i.image_url,
    title: i.title,
    group: i.group_name,
    date: new Date(i.created_at).toLocaleDateString('fr-FR')
  }));
}

async function saveImage(file, title, group) {

  const fileName =
    Date.now() + "_" + file.name.replace(/\s/g, "_");

  const { error: uploadError } = await sb
    .storage
    .from('photos')
    .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    return;
  }

  const { data } = sb
    .storage
    .from('photos')
    .getPublicUrl(fileName);

  await sb
    .from('photos')
    .insert({
      title,
      group_name: group,
      image_url: data.publicUrl
    });
}

// ---- VIDEOS ----
async function getVideos() {
  const { data, error } = await sb
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(v => ({
    id: v.id,
    title: v.title,
    group: v.group_name,
    url: v.url,
    type: 'youtube',
    date: new Date(v.created_at).toLocaleDateString('fr-FR')
  }));
}

async function saveVideo(vid) {
  const { error } = await sb
    .from('videos')
    .insert({
      title: vid.title,
      group_name: vid.group,
      url: vid.url
    });

  if (error) console.error(error);
}

// ---- UTILS ----
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function toggleMenu() {
  document.getElementById('nav-mobile').classList.toggle('open');
}

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
  } else {
    embed.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3);font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;flex-direction:column;gap:1rem;"><i class="fa fa-film" style="font-size:2rem"></i>Vidéo à uploader</div>`;
  }

  modal.classList.add('open');
}

function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  if (!modal) return;
  modal.querySelector('.video-embed').innerHTML = '';
  modal.classList.remove('open');
}

function getYtThumb(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}

// ---- TICKER ----
async function updateTopTicker() {
  const el = document.getElementById('ticker-top');
  if (!el) return;

  const msgs = await getMessages();

  if (msgs.length === 0) return;

  const parts = msgs.slice(0, 5)
    .map(m => `<span>« ${m.text.slice(0, 55)}${m.text.length > 55 ? '…' : ''} » — ${m.name}</span><span class="heart-red">♥</span>`)
    .join('');

  el.innerHTML = parts + parts;
}

async function renderMsgPeek(containerId, count) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const msgs = await getMessages();

  if (msgs.length === 0) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Soyez le premier à laisser un message !</div>';
    return;
  }

  el.innerHTML = msgs.slice(0, count).map(m => `
    <div class="msg-card fade-in">
      « ${m.text} »
      <div class="msg-author-small">— ${m.name}${m.city ? ', ' + m.city : ''}</div>
    </div>
  `).join('');
}

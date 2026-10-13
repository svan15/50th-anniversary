// All website behavior is here. Edit event details in config.js.
const $ = (id) => document.getElementById(id);
const config = window.INVITATION;

$('openEnvelope').addEventListener('click', () => {
  $('openEnvelope').classList.add('open');
  setTimeout(() => { $('intro').hidden = true; $('letterScreen').hidden = false; }, 800);
});
$('enterSite').addEventListener('click', () => {
  $('letterScreen').hidden = true;
  $('mainSite').hidden = false;
  window.scrollTo(0, 0);
});

$('dateLabel').textContent = config.dateLabel;
$('timeLabel').textContent = config.timeLabel;
$('venueLabel').textContent = config.venue;
$('addressLabel').textContent = config.address;
$('attireLabel').textContent = config.attire;
if (config.mapsUrl) { $('mapLink').href = config.mapsUrl; $('mapLink').hidden = false; }
function updateCountdown() {
  if (!config.dateISO) return;
  const diff = Math.max(0, new Date(config.dateISO).getTime() - Date.now());
  if (!Number.isFinite(diff)) return;
  $('days').textContent = Math.floor(diff / 86400000);
  $('hours').textContent = String(Math.floor(diff / 3600000) % 24).padStart(2, '0');
  $('minutes').textContent = String(Math.floor(diff / 60000) % 60).padStart(2, '0');
  $('seconds').textContent = String(Math.floor(diff / 1000) % 60).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

$('couplePhoto').addEventListener('error', () => { $('couplePhoto').hidden = true; $('coupleFallback').hidden = false; });
for (let i = 1; i <= 6; i++) {
  const tile = document.createElement('div');
  tile.className = 'gallery-item';
  const img = document.createElement('img');
  img.src = `assets/photos/memory-${i}.jpg`;
  img.alt = `Victor and Perlita memory ${i}`;
  img.addEventListener('error', () => { img.remove(); tile.textContent = `Memory ${String(i).padStart(2, '0')}`; });
  img.addEventListener('click', () => { $('largePhoto').src = img.src; $('photoModal').hidden = false; });
  tile.append(img);
  $('galleryGrid').append(tile);
}
$('closePhoto').addEventListener('click', () => { $('photoModal').hidden = true; });
$('photoModal').addEventListener('click', (event) => { if (event.target === $('photoModal')) $('photoModal').hidden = true; });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') $('photoModal').hidden = true; });

function showStatus(type, name = '') {
  const titles = { loading: 'Sending Your RSVP', success: 'RSVP Received', error: 'Unable to Send' };
  const messages = {
    loading: 'Please wait while we save your response.',
    success: `Thank you, ${name}! Your RSVP has been successfully saved.`,
    error: 'We could not confirm your RSVP. Please try again or contact the host.'
  };
  $('statusOverlay').hidden = false;
  $('statusTitle').textContent = titles[type];
  $('statusMessage').textContent = messages[type];
  $('statusSymbol').textContent = type === 'success' ? '✓' : type === 'error' ? '!' : '';
  $('statusSymbol').classList.toggle('spinning', type === 'loading');
  $('statusClose').hidden = type === 'loading';
}
$('statusClose').addEventListener('click', () => { $('statusOverlay').hidden = true; });

// Netlify Function responds with verified JSON. Do not use no-cors.
$('rsvpForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const attendance = String(data.get('attendance'));
  const guests = attendance === 'Regretfully declines' ? 0 : Number(data.get('guests'));
  if (!['Joyfully accepts', 'Regretfully declines'].includes(attendance) ||
      (attendance === 'Joyfully accepts' && (!Number.isInteger(guests) || guests < 1 || guests > 20))) {
    showStatus('error');
    return;
  }
  const payload = { name: String(data.get('name')).trim(), attendance, guests, message: String(data.get('message') || '') };
  const submit = $('submitRsvp');
  submit.disabled = true;
  showStatus('loading');
  try {
    const result = await fetch('/.netlify/functions/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const response = await result.json();
    if (!result.ok || response.success !== true) throw new Error(response.error || 'Unable to confirm save');
    showStatus('success', payload.name);
    form.reset();
  } catch (error) {
    console.error('RSVP error:', error);
    showStatus('error');
  } finally {
    submit.disabled = false;
  }
});

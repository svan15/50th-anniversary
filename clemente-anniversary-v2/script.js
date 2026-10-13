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

/* Responsive 3D Photo Carousel */
const memoryTrack = document.getElementById('galleryGrid');
const memoryDots = document.getElementById('memoryDots');
const memoryStage = document.getElementById('memoryStage');

let activeMemory = 0;
const memoryCount = 6;

for (let i = 0; i < memoryCount; i++) {
  const slide = document.createElement('button');
  slide.type = 'button';
  slide.className = 'memory-slide';
  slide.setAttribute('aria-label', `View memory ${i + 1}`);

  const img = document.createElement('img');
  img.src = `assets/photos/memory-${i + 1}.jpg`;
  img.alt = `Victor and Perlita memory ${i + 1}`;
  img.draggable = false;

  img.addEventListener('error', () => {
    img.hidden = true;
    slide.classList.add('memory-missing');
  });

  const caption = document.createElement('span');
  caption.className = 'memory-number';
  caption.textContent =
    `MEMORY ${String(i + 1).padStart(2, '0')}`;

  slide.append(img, caption);

  slide.addEventListener('click', () => {
    if (activeMemory !== i) {
      activeMemory = i;
      renderMemories();
    } else {
      document.getElementById('largePhoto').src = img.src;
      document.getElementById('photoModal').hidden = false;
    }
  });

  memoryTrack.append(slide);

  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'memory-dot';
  dot.setAttribute('aria-label', `Go to photo ${i + 1}`);

  dot.addEventListener('click', () => {
    activeMemory = i;
    renderMemories();
  });

  memoryDots.append(dot);
}

function renderMemories() {
  [...memoryTrack.children].forEach((slide, i) => {
    let distance = i - activeMemory;

    if (distance > memoryCount / 2) distance -= memoryCount;
    if (distance < -memoryCount / 2) distance += memoryCount;

    slide.dataset.offset =
      Math.abs(distance) > 2 ? 'hidden' : String(distance);

    slide.setAttribute(
      'aria-current',
      i === activeMemory ? 'true' : 'false'
    );

    slide.tabIndex = Math.abs(distance) <= 1 ? 0 : -1;
  });

  [...memoryDots.children].forEach((dot, i) => {
    dot.classList.toggle('active', i === activeMemory);
    dot.setAttribute('aria-pressed', String(i === activeMemory));
  });

  document.getElementById('memoryCounter').textContent =
    `${String(activeMemory + 1).padStart(2, '0')} / 06`;
}

function changeMemory(step) {
  activeMemory =
    (activeMemory + step + memoryCount) % memoryCount;
  renderMemories();
}

document.getElementById('memoryPrev')
  .addEventListener('click', () => changeMemory(-1));

document.getElementById('memoryNext')
  .addEventListener('click', () => changeMemory(1));

document.getElementById('memoryCarousel')
  .addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeMemory(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeMemory(1);
    }
  });

let memoryTouchX = null;

memoryStage.addEventListener('touchstart', event => {
  memoryTouchX = event.touches[0].clientX;
}, { passive: true });

memoryStage.addEventListener('touchend', event => {
  if (memoryTouchX === null) return;

  const delta =
    event.changedTouches[0].clientX - memoryTouchX;

  if (Math.abs(delta) > 35) {
    changeMemory(delta < 0 ? 1 : -1);
  }

  memoryTouchX = null;
}, { passive: true });

renderMemories();

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



/* Anniversary Background Music */
const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");

backgroundMusic.volume = 0.3;

function updateMusicButton() {
  const playing = !backgroundMusic.paused;

  musicToggle.classList.toggle("playing", playing);
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicToggle.setAttribute(
    "aria-label",
    playing ? "Pause background music" : "Play background music"
  );

  musicIcon.textContent = playing ? "♫" : "♪";
}

async function playAnniversaryMusic() {
  try {
    await backgroundMusic.play();
  } catch (error) {
    // Browser may require a direct user interaction.
  }

  updateMusicButton();
}

musicToggle.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    await playAnniversaryMusic();
  } else {
    backgroundMusic.pause();
    updateMusicButton();
  }
});

backgroundMusic.addEventListener("play", updateMusicButton);
backgroundMusic.addEventListener("pause", updateMusicButton);

// Start music on the guest's first interaction with the envelope.
const envelope = document.querySelector("#openEnvelope");

if (envelope) {
  envelope.addEventListener("click", playAnniversaryMusic, {
    once: true
  });
}

updateMusicButton();

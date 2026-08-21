<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  Clock3,
  Compass,
  Gift,
  MapPin,
  Navigation,
  PartyPopper,
  Share2,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-vue-next'

const eventDate = new Date('2026-08-23T10:00:00+07:00')
const opened = ref(false)
const scrollY = ref(0)
const attending = ref(false)
const showConfetti = ref(false)
const isMusicPlaying = ref(false)
const countdown = ref({ days: '00', hours: '00', minutes: '00', seconds: '00' })
const reduceMotion = ref(false)

const rawGuest = new URLSearchParams(window.location.search).get('to')?.trim()
const guestName = rawGuest || 'Teman Kecil Eijaz'

let timer
let animationFrame
let observer
let audioContext
let musicTimer
let musicStep = 0

const dinoMelody = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 698.46, 783.99, 880,
  783.99, 659.25, 587.33, 523.25,
  659.25, 783.99, 1046.5, 783.99,
]

const heroMediaStyle = computed(() => {
  if (reduceMotion.value) return {}
  const offset = Math.min(scrollY.value * 0.16, 120)
  const scale = Math.min(1.08 + scrollY.value * 0.0001, 1.17)
  return { transform: `translate3d(0, ${offset}px, 0) scale(${scale})` }
})

const heroCopyStyle = computed(() => {
  if (reduceMotion.value) return {}
  return {
    transform: `translate3d(0, ${Math.min(scrollY.value * 0.06, 48)}px, 0)`,
    opacity: Math.max(1 - scrollY.value / 850, 0.18),
  }
})

const parallaxStyle = computed(() => {
  if (reduceMotion.value) return {}
  return {
    transform: `translate3d(0, ${Math.max(-80, 48 - scrollY.value * 0.045)}px, 0) scale(1.14)`,
  }
})

function updateCountdown() {
  const distance = Math.max(eventDate.getTime() - Date.now(), 0)
  const days = Math.floor(distance / 86400000)
  const hours = Math.floor((distance / 3600000) % 24)
  const minutes = Math.floor((distance / 60000) % 60)
  const seconds = Math.floor((distance / 1000) % 60)
  countdown.value = {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}

function onScroll() {
  if (animationFrame) return
  animationFrame = requestAnimationFrame(() => {
    scrollY.value = window.scrollY
    animationFrame = null
  })
}

function makeDinoTone(frequency, startTime, duration, type = 'triangle', volume = 0.055) {
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.018)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.03)
}

function playNextDinoNote() {
  if (!audioContext || audioContext.state !== 'running') return
  const now = audioContext.currentTime
  const note = dinoMelody[musicStep % dinoMelody.length]

  makeDinoTone(note, now, 0.19)
  if (musicStep % 4 === 0) makeDinoTone(note / 4, now, 0.34, 'sine', 0.045)
  if (musicStep % 8 === 6) makeDinoTone(note * 2, now + 0.07, 0.085, 'square', 0.014)
  musicStep += 1
}

async function startMusic() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return
  if (!audioContext) audioContext = new AudioContext()
  if (audioContext.state === 'suspended') await audioContext.resume()
  if (musicTimer) window.clearInterval(musicTimer)

  isMusicPlaying.value = true
  playNextDinoNote()
  musicTimer = window.setInterval(playNextDinoNote, 230)
}

function stopMusic() {
  if (musicTimer) window.clearInterval(musicTimer)
  musicTimer = null
  isMusicPlaying.value = false
  audioContext?.suspend()
}

function toggleMusic() {
  if (isMusicPlaying.value) stopMusic()
  else startMusic()
}

function handleVisibility() {
  if (!audioContext || !isMusicPlaying.value) return
  if (document.hidden) audioContext.suspend()
  else audioContext.resume()
}

async function openInvitation() {
  await startMusic()
  opened.value = true
  document.body.classList.add('invitation-open')
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'instant' })
}

function scrollToEvent() {
  document.querySelector('#acara')?.scrollIntoView({ behavior: reduceMotion.value ? 'auto' : 'smooth' })
}

function celebrate() {
  attending.value = true
  showConfetti.value = false
  requestAnimationFrame(() => {
    showConfetti.value = true
    window.setTimeout(() => (showConfetti.value = false), 2600)
  })
}

function addToCalendar() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eijaz Birthday//ID',
    'BEGIN:VEVENT',
    'UID:eijaz-ketapang-23082026@birthday.local',
    'DTSTAMP:20260820T010000Z',
    'DTSTART:20260823T030000Z',
    'DTEND:20260823T050000Z',
    'SUMMARY:Ulang Tahun Eijaz — Ketapang Dongkal',
    'DESCRIPTION:Datang dan rayakan hari bahagia Eijaz Nafii Arrahman bersama petualangan dino!',
    'LOCATION:Ketapang Dongkal',
    'URL:https://maps.app.goo.gl/ujSgp5isUNfCQ8QM8',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:eijaz-poris-23082026@birthday.local',
    'DTSTAMP:20260820T010000Z',
    'DTSTART:20260823T090000Z',
    'DTEND:20260823T110000Z',
    'SUMMARY:Ulang Tahun Eijaz — Poris Plawad Utara',
    'DESCRIPTION:Petualangan ulang tahun Eijaz berlanjut di lokasi kedua!',
    'LOCATION:Poris Plawad Utara',
    'URL:https://maps.app.goo.gl/GbeL4Bz9Hf8g7VZJ9',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'ulang-tahun-eijaz.ics'
  anchor.click()
  URL.revokeObjectURL(url)
}

function shareInvitation() {
  const text = `Rawr! 🦕 Ayo ikut petualangan ulang tahun Eijaz Nafii Arrahman, Minggu 23 Agustus 2026. Lokasi 1: Ketapang Dongkal pukul 10.00 WIB. Lokasi 2: Poris Plawad Utara pukul 16.00 WIB. ${window.location.href}`
  if (navigator.share) {
    navigator.share({ title: 'Ulang Tahun Eijaz', text }).catch(() => {})
    return
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  updateCountdown()
  timer = window.setInterval(updateCountdown, 1000)
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', handleVisibility)

  observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
    { threshold: 0.14 },
  )
  document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element))
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('visibilitychange', handleVisibility)
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (musicTimer) window.clearInterval(musicTimer)
  audioContext?.close()
  observer?.disconnect()
})
</script>

<template>
  <div class="invitation-shell" :class="{ 'is-open': opened }">
    <Transition name="gate-fade">
      <section v-if="!opened" class="invitation-gate" aria-label="Pembuka undangan">
        <div class="gate-art" aria-hidden="true">
          <img src="/dino-party-hero.png" alt="" />
        </div>
        <div class="gate-shade"></div>
        <div class="gate-card">
          <div class="mini-dino" aria-hidden="true">🦕</div>
          <p class="gate-kicker">A special adventure for</p>
          <h1>{{ guestName }}</h1>
          <div class="gate-rule"><span></span><Star :size="16" fill="currentColor" /><span></span></div>
          <p class="gate-copy">Ada petualangan seru dari zaman dinosaurus yang menunggumu! Buka undangan untuk menyalakan musik dino.</p>
          <button class="button button-sun gate-button" type="button" @click="openInvitation">
            <PartyPopper :size="20" />
            Buka Undangan
          </button>
          <p class="gate-date">23 · 08 · 2026</p>
        </div>
      </section>
    </Transition>

    <main :aria-hidden="!opened">
      <nav class="floating-nav" aria-label="Navigasi undangan">
        <a class="nav-brand" href="#home" aria-label="Kembali ke atas">
          <span class="brand-bubble">EJ</span>
          <span>23.08.26</span>
        </a>
        <div class="nav-actions">
          <button
            class="music-toggle"
            type="button"
            :aria-label="isMusicPlaying ? 'Matikan musik dino' : 'Putar musik dino'"
            :aria-pressed="isMusicPlaying"
            :title="isMusicPlaying ? 'Matikan musik dino' : 'Putar musik dino'"
            @click="toggleMusic"
          >
            <Volume2 v-if="isMusicPlaying" :size="18" />
            <VolumeX v-else :size="18" />
            <span class="music-waves" :class="{ active: isMusicPlaying }" aria-hidden="true"><i></i><i></i><i></i></span>
          </button>
          <button class="nav-action" type="button" @click="scrollToEvent">
            Detail Acara
            <Compass :size="17" />
          </button>
        </div>
      </nav>

      <section id="home" class="hero">
        <div class="hero-media" :style="heroMediaStyle">
          <img src="/dino-party-hero.png" alt="Tiga dinosaurus lucu berpesta di hutan prasejarah" />
        </div>
        <div class="hero-overlay"></div>
        <div class="sun-orb" aria-hidden="true"></div>
        <div class="floating-specks" aria-hidden="true">
          <i v-for="n in 10" :key="n" :style="{ '--i': n }"></i>
        </div>

        <div class="hero-content" :style="heroCopyStyle">
          <div class="eyebrow-chip"><Sparkles :size="16" /> Minggu yang penuh keajaiban</div>
          <p class="hero-overline">Ayo rayakan hari bahagia</p>
          <h1><span>Eijaz Nafii</span> Arrahman</h1>
          <p class="hero-lede">
            Pakai senyum paling lebar dan bersiaplah menjelajah dunia dinosaurus bersama kami!
          </p>
          <div class="hero-actions">
            <button class="button button-sun" type="button" @click="scrollToEvent">
              <MapPin :size="20" /> Lihat Petualangan
            </button>
            <button class="button button-glass" type="button" @click="addToCalendar">
              <CalendarPlus :size="20" /> Simpan Tanggal
            </button>
          </div>
        </div>

        <button class="scroll-cue" type="button" aria-label="Gulir ke bawah" @click="scrollToEvent">
          <span>Jelajahi</span>
          <ChevronDown :size="19" />
        </button>
      </section>

      <div class="ticker" aria-hidden="true">
        <div class="ticker-track">
          <span v-for="n in 2" :key="n">RAWR! <b>✦</b> TAWA <b>✦</b> KUE <b>✦</b> PETUALANGAN <b>✦</b> DINO PARTY <b>✦</b> </span>
        </div>
      </div>

      <section class="welcome-section section-pad">
        <div class="section-leaf leaf-one" aria-hidden="true"></div>
        <div class="section-leaf leaf-two" aria-hidden="true"></div>
        <div class="container welcome-grid">
          <div class="welcome-label" data-reveal>
            <span class="label-number">01</span>
            <span>Undangan kecil<br />untuk hari besar</span>
          </div>
          <div class="welcome-copy" data-reveal>
            <p class="kicker">Halo, {{ guestName }}!</p>
            <h2>Jejak kaki dinosaurus mengarah ke satu <em>pesta istimewa.</em></h2>
            <p>
              Dengan penuh rasa syukur dan bahagia, kami mengundang teman-teman dan keluarga untuk hadir, bermain, dan membuat kenangan seru bersama Eijaz.
            </p>
          </div>
        </div>
      </section>

      <section class="countdown-section">
        <div class="container countdown-wrap" data-reveal>
          <div class="countdown-intro">
            <span class="round-icon"><Clock3 :size="24" /></span>
            <div>
              <p class="kicker light">Petualangan dimulai dalam</p>
              <h2>Hitung mundur ke zaman dino!</h2>
            </div>
          </div>
          <div class="countdown-grid" aria-label="Hitung mundur menuju acara">
            <div><strong>{{ countdown.days }}</strong><span>Hari</span></div>
            <div><strong>{{ countdown.hours }}</strong><span>Jam</span></div>
            <div><strong>{{ countdown.minutes }}</strong><span>Menit</span></div>
            <div><strong>{{ countdown.seconds }}</strong><span>Detik</span></div>
          </div>
        </div>
      </section>

      <section id="acara" class="event-section section-pad">
        <div class="container">
          <div class="section-heading" data-reveal>
            <p class="kicker">Catat koordinatnya</p>
            <h2>Dua tempat untuk berkumpul,<br /><em>tertawa & bertualang.</em></h2>
          </div>

          <div class="event-grid">
            <article class="event-card card-date" data-reveal>
              <div class="card-topline">
                <span class="card-icon coral"><CalendarDays :size="24" /></span>
                <span class="card-index">01 — Kapan</span>
              </div>
              <div class="date-lockup">
                <strong>23</strong>
                <div><span>Agustus</span><span>2026</span></div>
              </div>
              <p>Satu hari penuh keceriaan bersama Eijaz dan dinosaurus kecil.</p>
            </article>

            <article class="event-card card-place location-one" data-reveal>
              <div class="card-topline">
                <span class="card-icon blue"><MapPin :size="24" /></span>
                <span class="card-index">01 — Lokasi pagi</span>
              </div>
              <div class="location-time"><Clock3 :size="19" /><strong>10.00</strong><span>WIB</span></div>
              <h3>Ketapang<br />Dongkal</h3>
              <p>Petualangan pertama dimulai saat para dino kecil bangun dan bermain.</p>
              <a class="text-link" href="https://maps.app.goo.gl/ujSgp5isUNfCQ8QM8" target="_blank" rel="noopener noreferrer">
                Buka lokasi pagi <Navigation :size="17" />
              </a>
            </article>

            <article class="event-card card-place location-two" data-reveal>
              <div class="card-topline">
                <span class="card-icon yellow"><MapPin :size="24" /></span>
                <span class="card-index">02 — Lokasi sore</span>
              </div>
              <div class="location-time"><Clock3 :size="19" /><strong>16.00</strong><span>WIB</span></div>
              <h3>Poris Plawad<br />Utara</h3>
              <p>Petualangan berlanjut saat matahari mulai turun. Jangan sampai tertinggal!</p>
              <a class="text-link" href="https://maps.app.goo.gl/GbeL4Bz9Hf8g7VZJ9" target="_blank" rel="noopener noreferrer">
                Buka lokasi sore <Navigation :size="17" />
              </a>
            </article>
          </div>

          <div class="event-actions" data-reveal>
            <button class="button button-forest" type="button" @click="addToCalendar">
              <CalendarPlus :size="20" /> Tambahkan ke Kalender
            </button>
            <a class="button button-outline" href="https://maps.app.goo.gl/ujSgp5isUNfCQ8QM8" target="_blank" rel="noopener noreferrer">
              <Navigation :size="20" /> Lokasi Pagi
            </a>
            <a class="button button-outline" href="https://maps.app.goo.gl/GbeL4Bz9Hf8g7VZJ9" target="_blank" rel="noopener noreferrer">
              <Navigation :size="20" /> Lokasi Sore
            </a>
          </div>
        </div>
      </section>

      <section class="adventure-window" aria-label="Pesan untuk tamu">
        <div class="window-media" :style="parallaxStyle">
          <img src="/dino-party-hero.png" alt="Pesta dinosaurus di tengah hutan hijau" />
        </div>
        <div class="window-overlay"></div>
        <div class="window-content" data-reveal>
          <span class="round-icon sun"><Gift :size="24" /></span>
          <p class="kicker light">Syarat masuk hutan dino</p>
          <h2>Bawa senyum, doa baik,<br />dan energi untuk bermain!</h2>
          <p>Kehadiranmu adalah hadiah paling menyenangkan untuk Eijaz.</p>
        </div>
      </section>

      <section class="response-section section-pad">
        <div class="container response-card" data-reveal>
          <div class="response-copy">
            <p class="kicker">Satu rawr sebelum berangkat</p>
            <h2>{{ attending ? 'Yeay! Sampai jumpa di hutan dino.' : 'Siap ikut petualangan bersama Eijaz?' }}</h2>
            <p>{{ attending ? 'Eijaz dan para dinosaurus kecil menunggumu!' : 'Tekan tombolnya dan biarkan confetti dinosaurus beterbangan.' }}</p>
          </div>
          <div class="response-actions">
            <button class="button button-coral" type="button" @click="celebrate">
              <PartyPopper :size="20" /> {{ attending ? 'Rawr! Aku Siap!' : 'Aku Akan Datang' }}
            </button>
            <button class="icon-button" type="button" aria-label="Bagikan undangan" @click="shareInvitation"><Share2 :size="22" /></button>
          </div>
          <div class="dino-stamp" aria-hidden="true"><span>🦖</span><small>RAWR!</small></div>
        </div>
      </section>

      <footer>
        <div class="container footer-inner">
          <div>
            <p class="footer-mark">Eijaz's Dino Day</p>
            <p>Minggu · 23 Agustus 2026 · 10.00 & 16.00 WIB</p>
          </div>
          <p>Dibuat dengan banyak cinta & sedikit rawr. 🦕</p>
        </div>
      </footer>
    </main>

    <div v-if="showConfetti" class="confetti-burst" aria-hidden="true">
      <i v-for="n in 44" :key="n" :style="{ '--n': n, '--x': `${((n * 47) % 100)}vw`, '--delay': `${(n % 8) * 0.04}s`, '--hue': `${(n * 41) % 360}` }"></i>
    </div>
  </div>
</template>

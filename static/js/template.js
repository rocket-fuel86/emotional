const video = document.getElementById('video');
const progress = document.getElementById('progress');

// Ждём загрузки метаданных видео, потом разрешаем скрабб
let videoReady = false;

video.addEventListener('loadedmetadata', () => {
    videoReady = true;
    // Сразу устанавливаем начальную позицию
    handleScrub();
});

// Принудительно начинаем загрузку
video.load();

function handleScrub() {
    const scrollMax = document.body.scrollHeight - window.innerHeight;
    if (scrollMax <= 0) return;

    const t = window.scrollY / scrollMax;

    if (videoReady && video.duration) {
    video.currentTime = t * video.duration;
    }

    progress.style.width = (t * 100) + '%';
}

// Скролл → позиция видео
window.addEventListener('scroll', handleScrub);

// Появление текста
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('show');
    });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
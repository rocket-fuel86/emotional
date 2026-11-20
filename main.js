document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const mainTitle = document.getElementById('main-title');
    const sectors = document.querySelectorAll('.sector');
    const langBtn = document.getElementById('lang-btn');
    const webcamRing = document.getElementById('webcam-ring');

    const translations = {
        uk: {
            default: 'Емоційний інтелект',
            webcam: 'СКАНЕР ЕМОЦІЙ',
            sectors: { '1': 'ЕМОЦІЇ', '2': 'САМОКОНТРОЛЬ', '3': 'ЕМПАТІЯ' },
            btnLabel: 'EN'
        },
        en: {
            default: 'Emotional intelligence',
            webcam: 'EMOTION SCANNER',
            sectors: { '1': 'EMOTIONS', '2': 'SELF-CONTROL', '3': 'EMPATHY' },
            btnLabel: 'UA'
        }
    };

    let currentLang = 'uk';
    let activeSector = null;
    let animationTimeout;

    function updateBackgroundWords(lang) {
        const wordsDict = translations[lang].bgWords;

        Object.keys(wordsDict).forEach(sectorId => {
            const spans = document.querySelectorAll(`.words-sector-${sectorId} span`);
            spans.forEach((span, index) => {
                span.textContent = wordsDict[sectorId][index] || '';
            });
        });
    }

    function updateTitle(title, isDefault = false) {
        clearTimeout(animationTimeout);

        mainTitle.classList.add('is-hidden');

        animationTimeout = setTimeout(() => {
            mainTitle.textContent = title;

            mainTitle.classList.toggle('default', isDefault);
            mainTitle.classList.remove('is-hidden');
        }, 180);
    }

    function applyLanguage(lang) {
        const dict = translations[lang];
        document.documentElement.lang = lang;
        langBtn.textContent = dict.btnLabel;

        updateBackgroundWords(lang);

        sectors.forEach(sector => {
            sector.setAttribute('aria-label', dict.sectors[sector.dataset.sector]);
        });

        if (activeSector) {
            updateTitle(dict.sectors[activeSector]);
        } else {
            updateTitle(dict.default, true);
        }

        webcamRing.setAttribute('aria-label', dict.webcam);

        if (activeSector === 'webcam') {
            updateTitle(dict.webcam);
        } else if (activeSector) {
            updateTitle(dict.sectors[activeSector]);
        } else {
            updateTitle(dict.default, true);
        }
    }

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'uk' ? 'en' : 'uk';
        applyLanguage(currentLang);
    });

    function activateSector(sector) {
        activeSector = sector.dataset.sector;

        body.setAttribute('data-active-sector', activeSector);
        updateTitle(translations[currentLang].sectors[activeSector]);
    }

    function deactivateSector() {
        activeSector = null;
        body.removeAttribute('data-active-sector');
        updateTitle(translations[currentLang].default, true);
    }

    function activateWebcamRing() {
        activeSector = 'webcam';
        body.removeAttribute('data-active-sector');
        updateTitle(translations[currentLang].webcam);
    }

    webcamRing.addEventListener('mouseover', event => {
        if (event.target === webcamRing) {
            activateWebcamRing();
        }
    });

    webcamRing.addEventListener('mouseleave', () => {
        if (activeSector === 'webcam') {
            deactivateSector();
        }
    });

    webcamRing.addEventListener('focus', () => {
        activateWebcamRing();
    });

    webcamRing.addEventListener('blur', () => {
        if (activeSector === 'webcam') {
            deactivateSector();
        }
    });

    webcamRing.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            webcamRing.click();
        }
    });

    webcamRing.addEventListener('click', event => {
        if (event.target === webcamRing) {
            window.location.href = 'webcam.html';
        }
    });

    sectors.forEach(sector => {
        sector.setAttribute('tabindex', '0');
        sector.setAttribute('role', 'button');

        sector.addEventListener('mouseenter', () => {
            activateSector(sector);
        });

        sector.addEventListener('mouseleave', () => {
            deactivateSector();
        });

        sector.addEventListener('focus', () => {
            activateSector(sector);
        });

        sector.addEventListener('blur', () => {
            deactivateSector();
        });

        sector.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                sector.click();
            }
        });

        sector.addEventListener('click', () => {
            window.location.href = 'BLANK';
        });
    });

    applyLanguage(currentLang);
});

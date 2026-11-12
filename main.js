
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const mainTitle = document.getElementById('main-title');
    const sectors = document.querySelectorAll('.sector');

    const defaultTitle = 'Emotional intelligence';

    let animationTimeout;

    function updateTitle(title, isDefault = false) {
        clearTimeout(animationTimeout);

        mainTitle.classList.add('is-hidden');

        animationTimeout = setTimeout(() => {
            mainTitle.textContent = title;

            mainTitle.classList.toggle('default', isDefault);
            mainTitle.classList.remove('is-hidden');
        }, 180);
    }

    function activateSector(sector) {
        const sectorId = sector.dataset.sector;

        body.setAttribute('data-active-sector', sectorId);
        updateTitle(sector.dataset.title);
    }

    function deactivateSector() {
        body.removeAttribute('data-active-sector');
        updateTitle(defaultTitle, true);
    }

    sectors.forEach(sector => {
        sector.setAttribute('tabindex', '0');
        sector.setAttribute('role', 'button');

        sector.setAttribute(
            'aria-label',
            sector.dataset.title
        );

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
});

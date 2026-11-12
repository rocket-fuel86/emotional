document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const mainTitle = document.getElementById('main-title');
    const defaultTitle = 'Emotional intelligence';
    const sectors = document.querySelectorAll('.sector');

    sectors.forEach(sector => {
        const sectorId = sector.getAttribute('data-sector');
        const sectorTitle = sector.getAttribute('data-title');

        // Переход при наведении
        sector.addEventListener('mouseenter', () => {
            body.setAttribute('data-active-sector', sectorId);

            mainTitle.classList.add('is-hidden');
            setTimeout(() => {
                mainTitle.textContent = sectorTitle;
                mainTitle.classList.remove('default');
                mainTitle.classList.remove('is-hidden');
            }, 180);
        });

        // Возврат при уходе курсора
        sector.addEventListener('mouseleave', () => {
            body.removeAttribute('data-active-sector');

            mainTitle.classList.add('is-hidden');
            setTimeout(() => {
                mainTitle.textContent = defaultTitle;
                mainTitle.classList.add('default');
                mainTitle.classList.remove('is-hidden');
            }, 180);
        });

        // Переход по клику на будущую страницу
        sector.addEventListener('click', () => {
            window.location.href = 'BLANK';
        });
    });
});
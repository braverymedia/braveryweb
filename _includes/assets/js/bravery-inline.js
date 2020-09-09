// Mobile nav
const triggerMenu = document.querySelector('.menu-trigger');

triggerMenu.addEventListener('click', e => {
    if (document.body.classList.contains('menu-open')) {
        document.body.classList.remove('menu-open');
    }
    else {
        document.body.classList.add('menu-open');
    }
});
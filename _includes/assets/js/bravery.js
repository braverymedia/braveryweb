const processForm = form => {
    const data = new FormData(form)
    data.append('form-name', 'contact');
    fetch('/', {
        method: 'POST',
        body: data
    })
        .then(() => {
            form.innerHTML = `<div class="confirmation"><p>Thanks for getting in touch. We'll reply to you shortly!</p></div>`;
        })
        .catch(error => {
            form.innerHTML = `<div class="form--error">Something went wrong, please email us! Error: ${error}</div>`;
        })
}

const contactForm = document.querySelector('#bravery-contact')
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        processForm(contactForm);
        // track form submission
        umami.trackEvent('Contact Submission', 'submission');
    })
}

// Nav back from contact form
const closeContact = document.querySelector('.trigger-navback');
let referrer = document.referrer;
if (closeContact) {
    closeContact.addEventListener('click', e => {
        if (referrer.match(/^https?:\/\/([^\/]+\.)?bravery\.co(\/|$)/i)) {
            window.location.replace(referrer)
        } else {
            window.location.replace('https://bravery.co?utm_source=contact_close')
        }
    })
}

// Lazy loading images
const images = document.querySelectorAll('img[data-src]');
const config = {
    rootMargin: '50px',
    threshold: 0
};
let observer = new IntersectionObserver(function (entries, self) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            preloadImage(entry.target);
            self.unobserve(entry.target);
        }
    });
}, config);

if ( images ) {
    images.forEach(image => { observer.observe(image); });
}


function preloadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) { return; }
    img.src = src;
    img.classList.add('lazy-loaded');
}

// Mobile nav
const triggerMenu = document.querySelector('.menu-trigger');

triggerMenu.addEventListener('click', e => {
    if ( document.body.dataset.menu === 'closed' ) {
        document.body.dataset.menu = 'open';
        e.currentTarget.setAttribute('aria-expanded', true);
    } else {
        document.body.dataset.menu = 'closed';
        e.currentTarget.setAttribute('aria-expanded', false);
    }
});

// scroll faux browser image
const fakeBrowser = document.querySelector('.faux-browser');
// Intersection Observer Configuration
const observerOptions = {
    root: null,
    rootMargin: '10px 0px 0px 0px', // important: needs units on all values
    threshold: 0
};
// Intersection Observer Constructor.
const fbObserver = new IntersectionObserver(
    handleIntersect,
    observerOptions
);


// Intersection Observer Callback Function
function handleIntersect(entry) {
    // If intersecting.
    if (entry[0].intersectionRatio > 0) {
        fakeBrowser.classList.add('in-view');
    } else {
        fakeBrowser.classList.remove('in-view');
    }
};

fbObserver.observe(fakeBrowser);

const articles = document.querySelectorAll('.article-list article');
if ( articles ) {
    articles.forEach( article => {
        const id = article.getAttribute('data-cover');
        if (!src) { return; }
        article.addEventListener('mouseover', (e) => {
            article.classList.add('active');
            document.querySelector("#" + id).classList.add('active');
        });
    });
}

document.body.addEventListener( 'click', (e) => {
    if ( ! e.target.dataset.umamiEvent )
        return;

    eventLabel = e.target.dataset.umamiEvent;

    // push event
    umami.trackEvent(eventLabel, 'cta-click' );

} );
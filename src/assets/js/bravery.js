const processForm = (form, message, formName) => {
    const data = new FormData(form)
    data.append('form-name', formName);
    fetch('/', {
        method: 'POST',
        body: data
    })
        .then(() => {
            form.innerHTML = `<div class="confirmation"><p>${message}</p></div>`;
        })
        .catch(error => {
            form.innerHTML = `<div class="form--error">Something went wrong, please email us! Error: ${error}</div>`;
        })
}

const validateEmail = email => {
	const re =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email.toLowerCase());
}

// Contact form
const contactForm = document.querySelector('#bravery-contact')
if (contactForm) {
    let emailField = contactForm.querySelector('input[type="email"]');
    emailField.addEventListener('blur', (e) => {
        let emailVal = emailField.value;

        if ( validateEmail(emailVal) ) {
            contactForm.classList.remove('error');
        } else {
            contactForm.classList.add('error');
        }
    } );
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        let formName = 'contact';
        let message = `Thanks for getting in touch. We'll reply to you shortly!`;
        processForm(contactForm, message, formName);
    })
}
// Subscription forms
const newsletterSubscribe = document.querySelectorAll("form.heht-subscribe");
if (newsletterSubscribe) {
    newsletterSubscribe.forEach(form => {
        let emailField = form.querySelector('input[type="email"]');
        let submitButton = form.querySelector(`button[type="submit"]`) ;
        emailField.addEventListener("blur", (e) => {
            let emailVal = emailField.value;
            if (validateEmail(emailVal)) {
                form.classList.remove("error");
                submitButton.disabled = false;
            } else {
                form.classList.add("error");
                submitButton.disabled = true;
            }
        });
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let formName = "newsletter";
            let message = `You're on the list!`;
            processForm(form, message, formName);
        });
    });
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
if ( fakeBrowser ) {
    fbObserver.observe(fakeBrowser);
}


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
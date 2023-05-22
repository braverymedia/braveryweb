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
// Contact form
const contactForm = document.querySelector('#bravery-contact')
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        let formName = 'contact';
        let message = `Thanks for getting in touch. We'll reply to you shortly!`;
        processForm(contactForm, message, formName);
    })
}
// Subscription forms
const newsletterSubscribe = document.querySelectorAll(".heht-subscribe");
if (newsletterSubscribe) {
    newsletterSubscribe.forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let formName = "newsletter";
            let message = `You're on the list!`;
            processForm(contactForm, message, formName);
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

// Cal.com
(function (C, A, L) {
	let p = function (a, ar) {
		a.q.push(ar);
	};
	let d = C.document;
	C.Cal =
		C.Cal ||
		function () {
			let cal = C.Cal;
			let ar = arguments;
			if (!cal.loaded) {
				cal.ns = {};
				cal.q = cal.q || [];
				d.head.appendChild(d.createElement("script")).src = A;
				cal.loaded = true;
			}
			if (ar[0] === L) {
				const api = function () {
					p(api, arguments);
				};
				const namespace = ar[1];
				api.q = api.q || [];
				typeof namespace === "string"
					? (cal.ns[namespace] = api) && p(api, ar)
					: p(cal, ar);
				return;
			}
			p(cal, ar);
		};
})(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", { origin: "https://app.cal.com" });

// Important: Make sure to add `data-cal-link="team/bravery/needs-assessment"` attribute to the element you want to open Cal on click
Cal("ui", {
	theme: "light",
	styles: { branding: { brandColor: "#FF00C7" } },
	hideEventTypeDetails: false,
});
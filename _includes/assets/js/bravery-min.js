const processForm=e=>{const r=new FormData(e);r.append("form-name","contact"),fetch("/",{method:"POST",body:r}).then((()=>{e.innerHTML='<div class="confirmation"><p>Thanks for getting in touch. We\'ll reply to you shortly!</p></div>'})).catch((r=>{e.innerHTML=`<div class="form--error">Something went wrong, please email us! Error: ${r}</div>`}))},contactForm=document.querySelector("#bravery-contact");contactForm&&contactForm.addEventListener("submit",(e=>{e.preventDefault(),processForm(contactForm)}));const closeContact=document.querySelector(".trigger-navback");let referrer=document.referrer;closeContact&&closeContact.addEventListener("click",(e=>{referrer.match(/^https?:\/\/([^\/]+\.)?bravery\.co(\/|$)/i)?window.location.replace(referrer):window.location.replace("https://bravery.co?utm_source=contact_close")}));const images=document.querySelectorAll("img[data-src]"),config={rootMargin:"50px",threshold:0};let observer=new IntersectionObserver((function(e,r){e.forEach((e=>{e.isIntersecting&&(preloadImage(e.target),r.unobserve(e.target))}))}),config);function preloadImage(e){const r=e.getAttribute("data-src");r&&(e.src=r,e.classList.add("lazy-loaded"))}images&&images.forEach((e=>{observer.observe(e)}));const triggerMenu=document.querySelector(".menu-trigger");triggerMenu.addEventListener("click",(e=>{document.body.classList.contains("menu-open")?(document.body.classList.remove("menu-open"),triggerMenu.setAttribute("aria-expanded","false")):(document.body.classList.add("menu-open"),triggerMenu.setAttribute("aria-expanded","true"))}));const fakeBrowser=document.querySelector(".faux-browser"),observerOptions={root:null,rootMargin:"10px 0px 0px 0px",threshold:0},fbObserver=new IntersectionObserver(handleIntersect,observerOptions);function handleIntersect(e){e[0].intersectionRatio>0?fakeBrowser.classList.add("in-view"):fakeBrowser.classList.remove("in-view")}fbObserver.observe(fakeBrowser);
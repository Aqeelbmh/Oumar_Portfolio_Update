// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    const siteNav = document.getElementById('siteNav');

    const setMenuState = (open) => {
        navLinks.classList.toggle('active', open);
        mobileMenuBtn.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('no-scroll', open);
        if (siteNav) siteNav.classList.toggle('menu-open', open);
    };

    mobileMenuBtn.addEventListener('click', () => {
        const open = !navLinks.classList.contains('active');
        setMenuState(open);
        // Add animation to hamburger icon
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            setMenuState(false);
            // Reset hamburger icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }

            // Remove active class from all links
            document.querySelectorAll('.nav-links a').forEach(navLink => {
                navLink.classList.remove('active');
            });

            // Add active class to clicked link
            link.classList.add('active');
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && navLinks.classList.contains('active')) {
            setMenuState(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !navLinks.classList.contains('active')) return;
        setMenuState(false);
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        mobileMenuBtn.focus();
    });
}

// Add active class to current section link
window.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const links = document.querySelectorAll('.nav-links a');
    if (!sections.length || !links.length) return;

    // Set active class for home link by default
    const homeLink = document.querySelector('.nav-links a[href="#home"]');
    if (homeLink) homeLink.classList.add('active');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;

            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
    });
}

function updateIcon(theme) {
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section:not(#home)').forEach(section => {
    observer.observe(section);
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // The skip link must keep native behaviour so focus lands on the content.
    if (anchor.classList.contains('skip-link')) return;

    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        navbar.classList.toggle('scrolled', currentScroll > 12);

        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
}

/* ------------------------------------------------------------------ content */

const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && typeof value === 'string') element.textContent = value;
};

const safeUrl = (value) => {
    if (typeof value !== 'string' || value.trim() === '') return null;
    try {
        const url = new URL(value, window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) return null;
        return url.href;
    } catch {
        return null;
    }
};

const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
};

const makeCertificateLink = (url) => {
    const href = safeUrl(url);
    if (!href) return null;
    const link = makeElement('a', 'btn secondary', 'View Certificate');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
};

const syncSection = (container, hasContent) => {
    if (!container) return;
    const section = container.closest('section');
    if (section) section.hidden = !hasContent;
};

async function loadSiteContent() {
    try {
        const response = await fetch('/api/content', { headers: { Accept: 'application/json' } });
        if (!response.ok) return;
        const data = await response.json();
        if (data && data.content) renderSiteContent(data.content);
    } catch (error) {
        // The HTML already contains the current copy, so the site still works.
        console.debug('Content API unavailable, using static content.');
    }
}

function renderSiteContent(content) {
    const profile = content.profile || {};
    const links = content.links || {};

    const portrait = document.querySelector('#heroImage');
    if (portrait) {
        if (profile.name) portrait.alt = profile.name;
        if (profile.image) portrait.src = profile.image;
    }

    if (profile.name) {
        document.title = `${profile.name} — ${profile.subtitle || 'Portfolio'}`;
        setText('#heroName', profile.name);
    }
    setText('#heroSubtitle', profile.subtitle);
    setText('#aboutHeading', profile.aboutHeading);
    setText('#aboutTitle', profile.aboutTitle);

    const cvLink = document.querySelector('#downloadCV');
    if (cvLink && safeUrl(profile.cvUrl)) {
        cvLink.href = profile.cvUrl;
        cvLink.setAttribute('download', profile.cvFilename || 'CV.pdf');
    }

    const paragraphs = document.querySelector('#aboutParagraphs');
    if (paragraphs && Array.isArray(profile.aboutParagraphs)) {
        paragraphs.replaceChildren(
            ...profile.aboutParagraphs.map(text => makeElement('p', '', text))
        );
    }

    const aboutSections = document.querySelector('#aboutSections');
    if (aboutSections && Array.isArray(profile.aboutSections)) {
        aboutSections.replaceChildren(
            ...profile.aboutSections.map(section => {
                const item = makeElement('div', 'about-section');
                item.append(makeElement('h3', '', section.title));
                item.append(makeElement('p', '', section.text));
                return item;
            })
        );
    }

    renderSkills(content.skills);
    renderEducation(content.education);
    renderExperience(content.experience);
    renderLanguages(content.languages);
    renderCertifications(content.certifications);
    renderLinks(links);
}

function renderSkills(skills) {
    const grid = document.querySelector('#skillsGrid');
    if (!grid || !Array.isArray(skills)) return;

    grid.replaceChildren(
        ...skills.map(category => {            const box = makeElement('div', 'skill-category');
            box.append(makeElement('h3', '', category.category));

            const items = makeElement('div', 'skill-items');
            for (const skill of category.items || []) {
                const row = makeElement('div', 'skill-item');
                const icon = document.createElement('i');
                icon.className = skill.icon || 'fas fa-star';
                row.append(icon);
                row.append(makeElement('span', '', skill.label));
                items.append(row);
            }

            box.append(items);
            return box;
        })
    );

    syncSection(grid, skills.length > 0);
}

function renderEducation(entries) {
    const timeline = document.querySelector('#educationTimeline');
    if (!timeline || !Array.isArray(entries)) return;

    timeline.replaceChildren(
        ...entries.map(entry => {
            const item = makeElement('div', 'education-item');
            item.append(makeElement('div', 'education-date', entry.dates));

            const body = makeElement('div', 'education-content');
            body.append(makeElement('h3', '', entry.degree));
            body.append(makeElement('p', 'institution', entry.institution));
            body.append(makeElement('p', 'location', entry.location));
            body.append(makeElement('p', 'description', entry.description));

            const link = makeCertificateLink(entry.certificateUrl);
            if (link) body.append(link);

            item.append(body);
            return item;
        })
    );

    syncSection(timeline, entries.length > 0);
}

function renderExperience(entries) {
    const timeline = document.querySelector('#experienceTimeline');
    if (!timeline || !Array.isArray(entries)) return;

    timeline.replaceChildren(
        ...entries.map(entry => {
            const item = makeElement('div', 'experience-item');
            item.append(makeElement('div', 'experience-date', entry.dates));

            const body = makeElement('div', 'experience-content');
            body.append(makeElement('h3', '', entry.role));
            body.append(makeElement('p', 'company', entry.company));
            body.append(makeElement('p', 'description', entry.description));

            const achievements = Array.isArray(entry.achievements)
                ? entry.achievements.filter(Boolean)
                : [];
            if (achievements.length) {
                const list = makeElement('ul', 'achievements');
                for (const text of achievements) list.append(makeElement('li', '', text));
                body.append(list);
            }

            item.append(body);
            return item;
        })
    );

    syncSection(timeline, entries.length > 0);
}

function renderLanguages(languages) {
    const grid = document.querySelector('#languagesGrid');
    if (!grid || !Array.isArray(languages)) return;

    const count = document.querySelector('#heroLanguageCount');
    if (count) {
        count.textContent = String(languages.length);
        const stat = count.closest('dd');
        if (stat) stat.hidden = languages.length === 0;
    }

    renderLanguageMarquee(languages);

    grid.replaceChildren(
        ...languages.map(language => {
            const card = makeElement('div', 'language-card');
            const icon = document.createElement('i');
            icon.className = 'fas fa-globe';
            card.append(icon);
            card.append(makeElement('h3', '', language.name));
            card.append(makeElement('span', 'level', language.level));
            card.append(makeElement('p', '', language.description));
            return card;
        })
    );

    syncSection(grid, languages.length > 0);
}

function renderLanguageMarquee(languages) {
    const track = document.querySelector('#languageMarquee');
    if (!track) return;

    const band = track.closest('.marquee');
    const names = languages.map(language => language.name).filter(Boolean);
    if (band) band.hidden = names.length === 0;
    if (!names.length) {
        track.replaceChildren();
        return;
    }

    const makeGroup = () => {
        const group = makeElement('div', 'marquee-group');
        for (const name of names) {
            group.append(makeElement('span', '', name));
            group.append(makeElement('span', 'marquee-sep', '✦'));
        }
        return group;
    };

    track.replaceChildren(makeGroup(), makeGroup());
    track.lastElementChild.setAttribute('aria-hidden', 'true');
}

function renderCertifications(certifications) {
    const grid = document.querySelector('#certificationsGrid');
    if (!grid || !Array.isArray(certifications)) return;

    grid.replaceChildren(
        ...certifications.map(certificate => {
            const card = makeElement('div', 'certification-card');
            card.append(makeElement('h3', '', certificate.title));
            card.append(makeElement('p', 'organization', certificate.organization));
            card.append(makeElement('p', 'year', certificate.year));
            card.append(makeElement('p', 'description', certificate.description));

            const link = makeCertificateLink(certificate.certificateUrl);
            if (link) card.append(link);
            return card;
        })
    );

    syncSection(grid, certifications.length > 0);
}

function renderLinks(links) {
    if (!links) return;

    setText('#footerAbout', links.footerAbout);
    setText('#copyrightName', links.copyright);

    const year = document.querySelector('#copyrightYear');
    if (year) year.textContent = String(new Date().getFullYear());

    const container = document.querySelector('#socialLinks');
    if (!container) return;

    const socials = [
        { url: links.whatsapp, icon: 'fab fa-whatsapp', title: 'Contact me on WhatsApp' },
        { url: links.instagram, icon: 'fab fa-instagram', title: 'Follow me on Instagram' },
        { url: links.facebook, icon: 'fab fa-facebook', title: 'Follow me on Facebook' },
        { url: links.telegram, icon: 'fab fa-telegram', title: 'Connect with me on Telegram' }
    ].filter(social => safeUrl(social.url));

    container.replaceChildren(
        ...socials.map(social => {
            const link = document.createElement('a');
            link.href = social.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.title = social.title;
            link.setAttribute('aria-label', social.title);
            const icon = document.createElement('i');
            icon.className = social.icon;
            icon.setAttribute('aria-hidden', 'true');
            link.append(icon);
            return link;
        })
    );
}

// Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const responseElement = document.querySelector('.form-response');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const formData = new FormData(contactForm);

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending…';
        }

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                    website: formData.get('website') || ''
                })
            });

            let data = {};
            try {
                data = await response.json();
            } catch (error) {
                data = {};
            }

            if (response.ok) {
                showFormResponse(responseElement, 'success', 'Thank you! Your message has been sent successfully.');
                contactForm.reset();
            } else {
                showFormResponse(
                    responseElement,
                    'error',
                    data.error || 'Oops! Something went wrong. Please try again later.'
                );
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormResponse(
                responseElement,
                'error',
                'Oops! Something went wrong. Please try again later.'
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Send';
            }
        }
    });
}

function showFormResponse(element, kind, message) {
    if (!element) return;
    const paragraph = document.createElement('p');
    paragraph.className = kind;
    paragraph.textContent = message;
    element.replaceChildren(paragraph);
    element.style.display = 'block';
}

// CV Download Handler
const downloadCVBtn = document.getElementById('downloadCV');
if (downloadCVBtn) {
    downloadCVBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const originalHTML = downloadCVBtn.innerHTML;
        try {
            downloadCVBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
            downloadCVBtn.disabled = true;

            const link = document.createElement('a');
            link.href = downloadCVBtn.getAttribute('href');
            link.download = downloadCVBtn.getAttribute('download') || 'Oumar_Bagayoko_CV.pdf';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                downloadCVBtn.innerHTML = originalHTML;
                downloadCVBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Error downloading CV:', error);
            downloadCVBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Download Failed';
            downloadCVBtn.disabled = false;

            setTimeout(() => {
                downloadCVBtn.innerHTML = originalHTML;
            }, 2000);
        }
    });
}

// Load editable content from the backend
loadSiteContent();

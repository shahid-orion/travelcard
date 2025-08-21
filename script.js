// script.js

const ROUTES = {
	'/home': { html: 'pages/home.html' },
	// '/insured': { html: 'pages/insured.html' },
	// '/travel': { html: 'pages/travel.html' },
	// '/risk': { html: 'pages/risk.html' },
	// '/summary': { html: 'pages/summary.html' },
};

const qs = (s, r = document) => r.querySelector(s);

function highlightNav(hash) {
	document.querySelectorAll('.topnav .topnav-item').forEach((a) => {
		const active = a.getAttribute('href') === hash;
		a.classList.toggle('active', active);
		if (active) a.setAttribute('aria-current', 'page');
		else a.removeAttribute('aria-current');
	});
}

function setupMenuToggle() {
	const toggle = qs('.menu-toggle');
	const topnav = qs('#topnav');
	if (!toggle || !topnav) return;

	toggle.addEventListener('click', () => {
		const open = topnav.classList.toggle('open');
		toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
	});

	topnav.addEventListener('click', (e) => {
		const link = e.target.closest('a.topnav-item');
		if (link && topnav.classList.contains('open')) {
			topnav.classList.remove('open');
			toggle.setAttribute('aria-expanded', 'false');
		}
	});

	const mq = window.matchMedia('(min-width:700px)');
	mq.addEventListener('change', () => {
		if (mq.matches) {
			topnav.classList.remove('open');
			toggle.setAttribute('aria-expanded', 'false');
		}
	});
}

async function loadRoute() {
	const hash = location.hash || '#/home';
	const path = hash.slice(1);
	const def = ROUTES[path] || ROUTES['/home'];

	highlightNav(hash);

	const outlet = qs('#page-outlet');
	if (!outlet) return;

	try {
		const res = await fetch(def.html, { cache: 'no-store' });
		outlet.innerHTML = await res.text();
	} catch {
		outlet.innerHTML = `<div style="padding:16px">Failed to load ${def.html}</div>`;
	}

	window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
	setupMenuToggle();
	if (!location.hash) location.hash = '#/home';
	loadRoute();
	window.addEventListener('hashchange', loadRoute);
});

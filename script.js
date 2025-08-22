// script.js

// ------- Routes: just HTML + optional init/destroy callbacks -------
const ROUTES = {
	'/home': {
		html: 'pages/home.html',
		init: (outlet) => window.PageHome?.init?.(outlet),
		destroy: () => window.PageHome?.destroy?.(),
	},
	'/insured': { html: 'pages/InsuredDetails.html' },
	'/travel': {
		html: 'pages/TravelDetails.html',
		// If you want the age/destination widgets to behave like Home, keep these:
		init: (outlet) => window.PageHome?.init?.(outlet),
		destroy: () => window.PageHome?.destroy?.(),
	},
	'/risk': { html: 'pages/RiskDetails.html' },
	'/summary': { html: 'pages/PremiumSummary.html' },
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

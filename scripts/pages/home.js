// // /scripts/pages/home.js

// const HOME_STATE_KEY = 'acmeQuote';

// let outlet;
// let els = {};
// let unsubs = [];
// let DATA = {
// 	destinations: [],
// 	plans: [],
// 	fees: { gst: 0.1, stampDuty: 0.05, commission: 0.15, commissionTax: 0.1 },
// 	bands: [],
// };

// // ---------- tiny utils ----------
// const on = (el, evt, fn) => {
// 	if (!el) return;
// 	el.addEventListener(evt, fn);
// 	unsubs.push(() => el.removeEventListener(evt, fn));
// };
// const $ = (sel, root = document) => root.querySelector(sel);
// const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
// const money = (n) =>
// 	(isFinite(n) ? n : 0).toLocaleString('en-AU', {
// 		style: 'currency',
// 		currency: 'AUD',
// 	});

// const daysBetween = (s, e) => {
// 	if (!s || !e) return 0;
// 	const sd = new Date(s),
// 		ed = new Date(e);
// 	return Math.max(0, Math.ceil((ed - sd) / 86400000));
// };

// const loadJSON = (url, fallback) =>
// 	fetch(url)
// 		.then((r) => (r.ok ? r.json() : fallback))
// 		.catch(() => fallback);

// const loadState = () => {
// 	try {
// 		return JSON.parse(localStorage.getItem(HOME_STATE_KEY)) || {};
// 	} catch {
// 		return {};
// 	}
// };
// const saveState = (partial) => {
// 	const next = { ...loadState(), ...partial };
// 	localStorage.setItem(HOME_STATE_KEY, JSON.stringify(next));
// };

// const setOptions = (select, list, map) => {
// 	if (!select) return;
// 	select.innerHTML = '';
// 	list.forEach((item) => {
// 		const o = document.createElement('option');
// 		o.value = map.value(item);
// 		o.textContent = map.text(item);
// 		select.appendChild(o);
// 	});
// };

// // ---------- pricing helpers ----------
// function ageLoading(age) {
// 	const b = DATA.bands;
// 	for (const band of b)
// 		if (age >= band.min && age <= band.max) return band.loading;
// 	return 0;
// }

// function buildAgeInputs(n) {
// 	const host = els.agesContainer;
// 	if (!host) return;
// 	host.innerHTML = '';
// 	for (let i = 0; i < n; i++) {
// 		const inp = document.createElement('input');
// 		inp.type = 'number';
// 		inp.min = '0';
// 		inp.max = '120';
// 		inp.placeholder = `Age ${i + 1}`;
// 		inp.className = 'form-control';
// 		host.appendChild(inp);
// 		on(inp, 'input', handleAgesChange);
// 	}
// 	$('#agesRow', outlet).hidden = n <= 0;
// }

// function readAges() {
// 	return $$('#agesContainer input', outlet)
// 		.map((i) => parseInt(i.value, 10))
// 		.filter((v) => isFinite(v) && v > 0 && v < 121);
// }

// function recalc() {
// 	const dest = DATA.destinations.find((d) => d.code === els.destination?.value);
// 	const rate = dest?.ratePerDay || 0;

// 	const start = els.start?.value;
// 	const end = els.end?.value;
// 	const days = daysBetween(start, end);

// 	const plan = DATA.plans.find((p) => p.code === els.cover?.value);
// 	const mult = plan?.multiplier || 1;

// 	const ages = readAges();
// 	const travellers = parseInt(els.travellers?.value || ages.length || 0, 10);

// 	if (!rate || !days || !travellers || !mult || ages.length !== travellers) {
// 		$('#estPremium', outlet).textContent = '$ 0.00';
// 		$('#estTax', outlet).textContent = '$ 0.00';
// 		$('#estDuty', outlet).textContent = '$ 0.00';
// 		$('#estComm', outlet).textContent = '$ 0.00';
// 		$('#estCommTax', outlet).textContent = '$ 0.00';
// 		$('#estTotal', outlet).textContent = '$ 0.00';
// 		return;
// 	}

// 	const perPerson = ages.map((a) => days * rate * (1 + ageLoading(a)));
// 	const base = perPerson.reduce((a, b) => a + b, 0);
// 	const premium = base * mult;

// 	const gst = premium * (DATA.fees.gst || 0);
// 	const duty = premium * (DATA.fees.stampDuty || 0);
// 	const commission = premium * (DATA.fees.commission || 0);
// 	const commTax = commission * (DATA.fees.commissionTax || 0);
// 	const total = premium + gst + duty;

// 	$('#estPremium', outlet).textContent = money(premium);
// 	$('#estTax', outlet).textContent = money(gst);
// 	$('#estDuty', outlet).textContent = money(duty);
// 	$('#estComm', outlet).textContent = money(commission);
// 	$('#estCommTax', outlet).textContent = money(commTax);
// 	$('#estTotal', outlet).textContent = money(total);
// }

// function handleAgesChange() {
// 	const ages = readAges();
// 	saveState({ ages });
// 	recalc();
// }

// // ---------- marketing renderers ----------
// function mk(tag, cls, html) {
// 	const el = document.createElement(tag);
// 	if (cls) el.className = cls;
// 	if (html != null) el.innerHTML = html;
// 	return el;
// }

// function renderAlertWide(alert) {
// 	const host = $('#alert-mount', outlet);
// 	if (!host || !alert) return;
// 	const links = (alert.links || [])
// 		.map((l) => `<a href="${l.href}" class="link">${l.label}</a>`)
// 		.join(' • ');
// 	host.innerHTML = '';
// 	host.appendChild(
// 		mk(
// 			'div',
// 			'alert-bar',
// 			`<i class="fa-solid fa-triangle-exclamation"></i>
//        <span>${alert.text}</span>
//        <span class="alert-links">${links}</span>`
// 		)
// 	);
// }

// function renderMarketing(content) {
// 	const root = $('#home-marketing', outlet);
// 	if (!root || !content) return;

// 	// Plan teasers
// 	if (Array.isArray(content.planTeasers)) {
// 		const wrap = mk('section', 'marketing-section');
// 		wrap.appendChild(mk('h3', 'section-title', 'Choose your plan'));
// 		const grid = mk('div', 'teasers-grid');
// 		content.planTeasers.forEach((t) => {
// 			const plan = DATA.plans.find((p) => p.code === t.planCode);
// 			const title = plan ? plan.name : t.planCode;
// 			const bullets = (t.bullets || []).map((b) => `<li>${b}</li>`).join('');
// 			grid.appendChild(
// 				mk(
// 					'div',
// 					'teaser-card',
// 					`<div class="teaser-title">${title}</div>
//            <div class="teaser-tag">${t.tagline || ''}</div>
//            <ul class="teaser-list">${bullets}</ul>
//            <a href="#/plans" class="btn-link">View details</a>`
// 				)
// 			);
// 		});
// 		wrap.appendChild(grid);
// 		root.appendChild(wrap);
// 	}

// 	// COVID block
// 	if (content.covid) {
// 		const items = (content.covid.bullets || [])
// 			.map((b) => `<li>${b}</li>`)
// 			.join('');
// 		root.appendChild(
// 			mk(
// 				'section',
// 				'marketing-section',
// 				`<div class="section-title"><i class="fa-solid fa-virus-covid"></i> ${
// 					content.covid.title
// 				}</div>
//          <ul class="teaser-list">${items}</ul>
//          ${
// 						content.covid.cta
// 							? `<a href="${content.covid.cta.href}" class="btn-link">${content.covid.cta.label}</a>`
// 							: ''
// 					}`
// 			)
// 		);
// 	}

// 	// Add-ons
// 	if (Array.isArray(content.addOns)) {
// 		const wrap = mk('section', 'marketing-section');
// 		wrap.appendChild(mk('h3', 'section-title', 'Additional cover options'));
// 		const grid = mk('div', 'addons-grid');
// 		content.addOns.forEach((a) =>
// 			grid.appendChild(
// 				mk(
// 					'div',
// 					'addon-card',
// 					`<div class="addon-name"><i class="fa-solid fa-plus"></i> ${a.name}</div><div class="addon-desc">${a.desc}</div>`
// 				)
// 			)
// 		);
// 		wrap.appendChild(grid);
// 		root.appendChild(wrap);
// 	}

// 	// Cover types
// 	if (Array.isArray(content.coverOptions)) {
// 		const wrap = mk('section', 'marketing-section');
// 		wrap.appendChild(mk('h3', 'section-title', 'Choose what suits your needs'));
// 		const grid = mk('div', 'covers-grid');
// 		const icons = ['fa-user', 'fa-user-group', 'fa-people-roof'];
// 		content.coverOptions.forEach((o, i) =>
// 			grid.appendChild(
// 				mk(
// 					'div',
// 					'cover-card',
// 					`<div class="cover-name"><i class="fa-solid ${
// 						icons[i] || 'fa-user'
// 					}"></i> ${o.name} cover</div>
//            <div class="cover-desc">${o.desc}</div>`
// 				)
// 			)
// 		);
// 		wrap.appendChild(grid);
// 		root.appendChild(wrap);
// 	}

// 	// FAQs
// 	if (Array.isArray(content.faqs)) {
// 		const wrap = mk('section', 'marketing-section');
// 		wrap.appendChild(mk('h3', 'section-title', 'Frequently asked questions'));
// 		const list = mk('div', 'faq-list');
// 		content.faqs.forEach((f) =>
// 			list.appendChild(
// 				mk(
// 					'div',
// 					'faq-item',
// 					`<button class="faq-q" aria-expanded="false">
//              <span>${f.q}</span><i class="fa-solid fa-chevron-down"></i>
//            </button>
//            <div class="faq-a" hidden>${f.a}</div>`
// 				)
// 			)
// 		);
// 		wrap.appendChild(list);
// 		root.appendChild(wrap);
// 		$$('.faq-q', wrap).forEach((btn) =>
// 			on(btn, 'click', () => {
// 				const a = btn.nextElementSibling;
// 				const open = btn.getAttribute('aria-expanded') === 'true';
// 				btn.setAttribute('aria-expanded', String(!open));
// 				a.hidden = open;
// 			})
// 		);
// 	}

// 	// Footnotes
// 	if (Array.isArray(content.footnotes)) {
// 		root.appendChild(
// 			mk(
// 				'div',
// 				'footnotes',
// 				content.footnotes
// 					.map((n) => `<div class="footnote">• ${n}</div>`)
// 					.join('')
// 			)
// 		);
// 	}
// }

// // ---------- init / destroy ----------
// async function init(root) {
// 	outlet = root; // everything is scoped to the page outlet
// 	outlet.classList.add('page-home');

// 	// Cache elements
// 	els.destination = $('#destinationSelect', outlet);
// 	els.start = $('#startDate', outlet);
// 	els.end = $('#endDate', outlet);
// 	els.travellers = $('#travellersSelect', outlet);
// 	els.cover = $('#coverTypeSelect', outlet);
// 	els.agesContainer = $('#agesContainer', outlet);

// 	// Load data
// 	const [dest, plans, fees, bands, content] = await Promise.all([
// 		loadJSON('./data/destinations.json', { regions: [] }),
// 		loadJSON('./data/plans.json', { plans: [] }),
// 		loadJSON('./data/fees.json', {
// 			gst: 0.1,
// 			stampDuty: 0.05,
// 			commission: 0.15,
// 			commissionTax: 0.1,
// 		}),
// 		loadJSON('./data/age-bands.json', { bands: [] }),
// 		loadJSON('./data/home-content.json', null),
// 	]);
// 	DATA.destinations = dest.regions || [];
// 	DATA.plans = plans.plans || [];
// 	DATA.fees = fees;
// 	DATA.bands = bands.bands || [];

// 	// Populate selects
// 	setOptions(els.destination, DATA.destinations, {
// 		text: (d) => d.name,
// 		value: (d) => d.code,
// 	});
// 	setOptions(
// 		els.travellers,
// 		Array.from({ length: 8 }, (_, i) => i + 1),
// 		{ text: (n) => String(n), value: (n) => String(n) }
// 	);
// 	setOptions(els.cover, DATA.plans, {
// 		text: (p) => p.name,
// 		value: (p) => p.code,
// 	});

// 	// Restore saved state
// 	const s = loadState();
// 	if (s.destination && els.destination) els.destination.value = s.destination;
// 	if (s.cover && els.cover) els.cover.value = s.cover;
// 	if (s.startDate) els.start.value = s.startDate;
// 	if (s.endDate) els.end.value = s.endDate;
// 	if (s.travellers) els.travellers.value = String(s.travellers);

// 	// Ages UI
// 	const nTrav = parseInt(els.travellers.value || '1', 10);
// 	buildAgeInputs(nTrav);
// 	if (Array.isArray(s.ages)) {
// 		$$('#agesContainer input', outlet).forEach((inp, idx) => {
// 			if (s.ages[idx] != null) inp.value = s.ages[idx];
// 		});
// 	}

// 	// Listeners
// 	on(els.destination, 'change', () => {
// 		saveState({ destination: els.destination.value });
// 		recalc();
// 	});
// 	on(els.cover, 'change', () => {
// 		saveState({ cover: els.cover.value });
// 		recalc();
// 	});
// 	on(els.start, 'change', () => {
// 		saveState({ startDate: els.start.value });
// 		recalc();
// 	});
// 	on(els.end, 'change', () => {
// 		saveState({ endDate: els.end.value });
// 		recalc();
// 	});
// 	on(els.travellers, 'change', () => {
// 		const v = parseInt(els.travellers.value, 10);
// 		saveState({ travellers: v, ages: [] });
// 		buildAgeInputs(v);
// 		recalc();
// 	});

// 	// Hero CTA scrolls to the quote section
// 	on($('#heroCta', outlet), 'click', () => {
// 		$('#quoteSection', outlet)?.scrollIntoView({
// 			behavior: 'smooth',
// 			block: 'start',
// 		});
// 	});

// 	// Render alert below hero + the rest of the marketing sections
// 	renderAlertWide(content?.alert);
// 	renderMarketing(content);

// 	// Initial calculation
// 	recalc();

// 	// Quote CTA to continue
// 	on($('#getQuoteBtn', outlet), 'click', () => {
// 		location.hash = '#/plans';
// 	});
// }

// function destroy() {
// 	unsubs.forEach((fn) => fn());
// 	unsubs = [];
// }

// window.PageHome = { init, destroy };

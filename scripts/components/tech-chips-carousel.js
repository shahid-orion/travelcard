// scripts/components/header.js

const TECH_PARTIAL_URL = './partials/tech-chips.html';

// Timing (ms)
const DISPLAY_MS = 5000; // total per item
const FADE_IN_MS = 500;
const FADE_OUT_MS = 500;
const HOLD_MS = Math.max(0, DISPLAY_MS - FADE_IN_MS - FADE_OUT_MS);

let pool = []; // array of chip nodes (not creating new ones)
let idx = 0; // current index
let timer = null; // rotation timer
let running = false; // guard

function $(s, r = document) {
	return r.querySelector(s);
}

function clearTimer() {
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}
}

function animateIn(el) {
	el.style.opacity = '0';
	el.style.transform = 'translateY(8px) scale(0.98)';
	el.style.transition = `opacity ${FADE_IN_MS}ms ease, transform ${FADE_IN_MS}ms ease`;
	requestAnimationFrame(() => {
		el.style.opacity = '1';
		el.style.transform = 'translateY(0) scale(1)';
	});
}

function animateOut(el) {
	return new Promise((resolve) => {
		el.style.transition = `opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease`;
		el.style.opacity = '0';
		el.style.transform = 'translateY(8px) scale(0.98)';
		setTimeout(resolve, FADE_OUT_MS);
	});
}

async function showOne(host, node) {
	// Remove current chip after fade out
	const curr = host.querySelector('.tech-chip');
	if (curr) {
		await animateOut(curr);
		// remove only the chip, keep any decorative siblings the header might add later
		try {
			curr.parentNode.removeChild(curr);
		} catch {}
	}

	// Mount next (the node is reused from the pool; not cloning/creating)
	host.appendChild(node);
	animateIn(node);

	// Hold visible, then proceed
	return new Promise((resolve) => {
		timer = setTimeout(resolve, HOLD_MS + FADE_IN_MS);
	});
}

async function cycle(host) {
	if (!pool.length) return;
	running = true;

	while (running) {
		const node = pool[idx % pool.length];
		await showOne(host, node);
		idx++;
	}
}

async function loadPoolFromPartial() {
	try {
		const res = await fetch(TECH_PARTIAL_URL, { cache: 'no-store' });
		if (!res.ok) return false;

		const html = await res.text();
		const tmp = document.createElement('div');
		tmp.innerHTML = html;

		// Accept any .tech-chip inside the partial
		const chips = tmp.querySelectorAll('.tech-chip');
		pool = Array.from(chips).map((n) => n); // reuse nodes directly
		return pool.length > 0;
	} catch {
		return false;
	}
}

async function initHeaderChips() {
	const host = $('#techStrip');
	if (!host) return;

	// Prevent rebinds
	if (host.dataset.carouselBound === '1') return;
	host.dataset.carouselBound = '1';

	clearTimer();
	running = false;
	pool = [];

	// 1) Prefer chips found in the page already (inline)
	const inlineChips = host.querySelectorAll('.tech-chip');
	if (inlineChips.length) {
		pool = Array.from(inlineChips).map((n) => n);
	} else {
		// 2) Otherwise, load the static HTML partial once
		const ok = await loadPoolFromPartial();
		if (!ok) return; // nothing to rotate; bail silently
	}

	// Ensure only one chip is visible at a time (hide the rest)
	// (We keep them in the pool, only one gets appended each turn.)
	Array.from(host.querySelectorAll('.tech-chip')).forEach((chip) => {
		try {
			chip.parentNode.removeChild(chip);
		} catch {}
	});

	// Start rotation
	idx = 0;
	running = true;
	cycle(host);
}

// Boot once DOM is ready
document.addEventListener('DOMContentLoaded', initHeaderChips);

// Optional controls
window.HeaderChips = {
	restart() {
		clearTimer();
		running = false;
		initHeaderChips();
	},
	stop() {
		clearTimer();
		running = false;
	},
};

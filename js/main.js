/**
 * REMONTPRO TERNOPIL — MAIN JAVASCRIPT
 * Features: Navbar, Tabs, FAQ Accordion, Counter Animation,
 *           Scroll Reveal, Back to Top, Scroll Progress,
 *           Mobile Menu, Form Validation, Toast
 */

'use strict';

/* ============================================================
   UTILITIES
============================================================ */

function debounce(fn, ms = 60) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function $(selector, ctx = document) {
  return ctx.querySelector(selector);
}

function $$(selector, ctx = document) {
  return [...ctx.querySelectorAll(selector)];
}

/* ============================================================
   SCROLL PROGRESS BAR
============================================================ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
}

/* ============================================================
   NAVBAR — SCROLL BEHAVIOR
============================================================ */
function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const threshold = 60;

  function update() {
    if (window.scrollY > threshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', debounce(update, 10), { passive: true });
  update();

  // Active nav link on scroll
  const sections = $$('section[id], div[id]');
  const navLinks = $$('.nav-link');

  const observerOptions = { root: null, rootMargin: '-40% 0px -50% 0px', threshold: 0 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = navLinks.find(l => l.getAttribute('href') === '#' + entry.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/* ============================================================
   MOBILE MENU
============================================================ */
function initMobileMenu() {
  const toggle = $('#navToggle');
  const menu   = $('#navMenu');
  if (!toggle || !menu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    menu.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    menu.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => isOpen ? closeMenu() : openMenu());

  // Close on nav link click
  $$('.nav-link', menu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}

/* ============================================================
   TABS
   Multiple independent tab groups via data-group attribute
============================================================ */
function initTabs() {
  const tabGroups = new Set();

  // Collect all groups
  $$('[data-group]').forEach(el => {
    if (el.classList.contains('tab-btn') || el.classList.contains('tabs-nav')) {
      tabGroups.add(el.dataset.group);
    }
  });

  tabGroups.forEach(group => {
    const btns     = $$(`.tab-btn[data-group="${group}"]`);
    const contents = $$('.tab-content[id^="tab-' + group + '-"], .tab-content[id^="tab-services-"], .tab-content[id^="tab-portfolio-"]');

    // Build a mapping per group
    const groupBtns = btns;
    const groupContents = $$(`[id^="tab-${group}-"]`);

    groupBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        // Deactivate all in this group
        groupBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        groupContents.forEach(c => c.classList.remove('active'));

        // Activate selected
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const targetEl = document.getElementById(`tab-${group}-${target}`);
        if (targetEl) {
          targetEl.classList.add('active');
        }
      });
    });
  });
}

/* ============================================================
   FAQ ACCORDION
============================================================ */
function initFaq() {
  const items = $$('.faq-item');

  items.forEach(item => {
    const question = $('.faq-question', item);
    const answer   = $('.faq-answer', item);
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all others
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherAnswer  = $('.faq-answer', other);
          const otherQuestion = $('.faq-question', other);
          if (otherAnswer)  otherAnswer.style.maxHeight = '0';
          if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('active');
        answer.style.maxHeight = '0';
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ============================================================
   COUNTER ANIMATION
============================================================ */
function animateCounter(el, target, duration = 1800) {
  const start    = performance.now();
  const startVal = 0;

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(startVal + (target - startVal) * eased);

    el.textContent = current.toLocaleString('uk-UA');

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString('uk-UA');
    }
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$('.stat-number[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) {
          el.closest('.stat-item')?.classList.add('counting', 'revealed');
          animateCounter(el, target);
          observer.unobserve(el);
        }
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ============================================================
   SCROLL REVEAL — Intersection Observer
============================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal-up').forEach(el => observer.observe(el));
}

/* ============================================================
   BACK TO TOP
============================================================ */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, 20), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   SMOOTH SCROLL for anchor links
============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navH = document.querySelector('#navbar')?.offsetHeight ?? 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   TOAST NOTIFICATION
============================================================ */
let toastTimeout = null;

function showToast(message, type = 'success') {
  const toast   = $('#toast');
  const msgEl   = $('#toastMessage');
  const iconEl  = $('#toastIcon');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.className   = 'toast show ' + type;

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

// Expose globally (used by telegram.js)
window.showToast = showToast;

/* ============================================================
   CONTACT FORM VALIDATION
============================================================ */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const rules = {
    name: {
      validate: v => v.trim().length >= 2,
      msg: "Введіть ім'я (мінімум 2 символи)"
    },
    phone: {
      validate: v => /^[\+]?[\d\s\-\(\)]{10,15}$/.test(v.trim()),
      msg: 'Введіть коректний номер телефону'
    },
    consent: {
      validate: (_v, el) => el.checked,
      msg: 'Необхідно дати згоду на обробку даних'
    }
  };

  function showFieldError(fieldId, msg) {
    const errEl = document.getElementById(fieldId + '-error');
    const field = document.getElementById(fieldId);
    if (errEl) errEl.textContent = msg;
    if (field) field.classList.add('error');
  }

  function clearFieldError(fieldId) {
    const errEl = document.getElementById(fieldId + '-error');
    const field = document.getElementById(fieldId);
    if (errEl) errEl.textContent = '';
    if (field) field.classList.remove('error');
  }

  // Real-time validation
  Object.entries(rules).forEach(([id, rule]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      if (!rule.validate(el.value, el)) {
        showFieldError(id, rule.msg);
      } else {
        clearFieldError(id);
      }
    });
    el.addEventListener('input', () => clearFieldError(id));
    el.addEventListener('change', () => clearFieldError(id));
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    Object.entries(rules).forEach(([id, rule]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!rule.validate(el.value, el)) {
        showFieldError(id, rule.msg);
        valid = false;
      } else {
        clearFieldError(id);
      }
    });

    if (!valid) return;

    // Gather data
    const data = {
      name:    document.getElementById('name')?.value.trim()    || '',
      phone:   document.getElementById('phone')?.value.trim()   || '',
      service: document.getElementById('service')?.value        || 'Не вказано',
      area:    document.getElementById('area')?.value           || '',
      message: document.getElementById('message')?.value.trim() || ''
    };

    // UI: loading state
    const submitBtn  = $('#submitBtn');
    const btnLabel   = submitBtn?.querySelector('span:not(.btn-loader)');
    const btnLoader  = submitBtn?.querySelector('.btn-loader');
    if (submitBtn) submitBtn.disabled = true;
    if (btnLabel)  btnLabel.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-flex';

    try {
      // This calls the Telegram sender (telegram.js)
      const result = await window.sendToTelegram(data);

      if (result.ok) {
        showToast('Дякуємо! Заявку отримано. Зв\'яжемося протягом 30 хв.', 'success');
        form.reset();
        // Remove error states
        $$('.form-group input, .form-group textarea, .form-group select', form).forEach(el => {
          el.classList.remove('error');
        });
        $$('.field-error', form).forEach(el => el.textContent = '');
      } else {
        throw new Error(result.description || 'API error');
      }
    } catch (err) {
      console.error('Form submit error:', err);
      showToast('Сталася помилка. Будь ласка, зателефонуйте нам: +380 50 123 45 67', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnLabel)  btnLabel.style.display = '';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  });
}

/* ============================================================
   CTA PULSE (draws attention after 3s)
============================================================ */
function initCtaPulse() {
  setTimeout(() => {
    $$('.btn-secondary').forEach(btn => {
      btn.classList.add('pulse-ring');
      // Remove after a few pulses
      setTimeout(() => btn.classList.remove('pulse-ring'), 8000);
    });
  }, 3000);
}

/* ============================================================
   CARD RIPPLE EFFECT
============================================================ */
function initCardRipple() {
  $$('.service-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const rect   = card.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(card.offsetWidth, card.offsetHeight);
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
      `;
      card.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ============================================================
   STATS ROW — wrap number + suffix in a flex row
============================================================ */
function initStatsLayout() {
  $$('.stat-item').forEach(item => {
    const num    = item.querySelector('.stat-number');
    const suffix = item.querySelector('.stat-suffix');
    const label  = item.querySelector('.stat-label');
    if (!num || !suffix) return;

    const row = document.createElement('div');
    row.className = 'stat-counter-row';
    num.parentNode.insertBefore(row, num);
    row.appendChild(num);
    row.appendChild(suffix);
  });
}

/* ============================================================
   PORTFOLIO CARD — always show partial overlay (non-hover states)
============================================================ */
function initPortfolioCards() {
  // On touch devices, toggle overlay on tap
  $$('.portfolio-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('tapped');
    });
  });
}

/* ============================================================
   INIT ALL
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initTabs();
  initFaq();
  initScrollReveal();
  initCounters();
  initBackToTop();
  initSmoothScroll();
  initContactForm();
  initStatsLayout();
  initCardRipple();
  initPortfolioCards();
  initCtaPulse();

  console.log('%c🏗 РемПро Тернопіль — сайт ініціалізовано', 'color:#E8701A;font-weight:700;font-size:14px');
});

'use strict';

/* ── FAQ accordion ── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}
window.toggleFaq = toggleFaq;

/* ── Scroll fade-in ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '-40px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ── Header shadow on scroll ── */
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (header) header.style.boxShadow = window.scrollY > 40 ? '0 4px 24px rgba(30,58,95,0.12)' : 'none';
}, { passive: true });

/* ── Desktop card deck cycling ── */
(function() {
  const INTERVAL = 2000;
  const DESKTOP_MQ = '(min-width: 901px)';
  const mql = window.matchMedia(DESKTOP_MQ);

  const GLOW_COLORS = [
    'rgba(247,147,26,0.35)',   // BTC orange
    'rgba(98,126,234,0.35)',   // ETH blue
    'rgba(20,241,149,0.3)',    // SOL green
    'rgba(255,255,255,0.2)',   // XRP white
    'rgba(39,117,202,0.35)',   // USDC blue
    'rgba(38,161,123,0.35)',   // USDT teal
    'rgba(217,70,239,0.35)',   // HYPE purple
    'rgba(168,184,201,0.3)',   // Trust silver
  ];

  const RING_OUTER = [
    'rgba(247,147,26,0.55)',
    'rgba(98,126,234,0.55)',
    'rgba(20,241,149,0.5)',
    'rgba(255,255,255,0.4)',
    'rgba(39,117,202,0.55)',
    'rgba(38,161,123,0.55)',
    'rgba(217,70,239,0.55)',
    'rgba(168,184,201,0.45)',
  ];

  const RING_INNER = [
    'rgba(247,147,26,0.34)',
    'rgba(98,126,234,0.36)',
    'rgba(20,241,149,0.3)',
    'rgba(255,255,255,0.28)',
    'rgba(39,117,202,0.34)',
    'rgba(38,161,123,0.34)',
    'rgba(217,70,239,0.34)',
    'rgba(168,184,201,0.3)',
  ];

  const RING_GLOW = [
    'rgba(247,147,26,0.4)',
    'rgba(98,126,234,0.4)',
    'rgba(20,241,149,0.36)',
    'rgba(255,255,255,0.32)',
    'rgba(39,117,202,0.4)',
    'rgba(38,161,123,0.4)',
    'rgba(217,70,239,0.4)',
    'rgba(168,184,201,0.34)',
  ];

  const cards = document.querySelectorAll('.deck-card');
  const glow = document.querySelector('.card-glow');
  const heroRight = document.querySelector('.hero-right');
  if (!cards.length || !heroRight) return;

  const total = cards.length;
  let current = 0;
  let intervalId = null;

  function getState(index) {
    const diff = ((index - current) % total + total) % total;
    if (diff === 0) return 'state-current';
    if (diff === 1) return 'state-next';
    if (diff === total - 1) return 'state-prev';
    if (diff <= total / 2) return 'state-hidden-bot';
    return 'state-hidden-top';
  }

  function applyStates() {
    cards.forEach((card, i) => {
      card.classList.remove('state-current', 'state-prev', 'state-next', 'state-hidden-top', 'state-hidden-bot');
      card.classList.add(getState(i));
    });
    if (glow) glow.style.background = GLOW_COLORS[current % GLOW_COLORS.length];
    heroRight.style.setProperty('--ring-outer', RING_OUTER[current % RING_OUTER.length]);
    heroRight.style.setProperty('--ring-inner', RING_INNER[current % RING_INNER.length]);
    heroRight.style.setProperty('--ring-glow', RING_GLOW[current % RING_GLOW.length]);
  }

  function startDeck() {
    if (intervalId !== null) return;
    applyStates();
    intervalId = window.setInterval(() => {
      current = (current + 1) % total;
      applyStates();
    }, INTERVAL);
  }

  function stopDeck() {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  function syncDeckByViewport() {
    if (mql.matches) {
      startDeck();
    } else {
      stopDeck();
    }
  }

  syncDeckByViewport();
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', syncDeckByViewport);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(syncDeckByViewport);
  }
})();

/* ── CoinMarketCap realtime quotes (hero cards) ── */
(function() {
  const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'USDC', 'USDT', 'HYPE'];
  const metaEl = document.getElementById('hero-market-meta');
  const refreshMs = 60000;

  const applyStaticMetricLabels = () => {
    // Normalize desktop coin card footer rows so legacy copy like "this month" never remains.
    document.querySelectorAll('.deck-card').forEach((card) => {
      const ticker = card.querySelector('.card-ticker')?.textContent?.trim().toUpperCase();
      if (!ticker || !symbols.includes(ticker)) return;

      const amountEl = card.querySelector('.card-amount');
      if (!amountEl) return;

      // Remove any legacy rows after amount (e.g. "this month", "Staked & Secured").
      while (amountEl.nextSibling) {
        amountEl.parentNode.removeChild(amountEl.nextSibling);
      }

      let badge = card.querySelector('.card-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'card-badge card-badge-white';
      }

      const existingRow = badge.closest('div');
      const row = existingRow || document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '0.5rem';
      row.innerHTML = '';
      row.appendChild(badge);
      if (!existingRow && amountEl) amountEl.insertAdjacentElement('afterend', row);
    });

    document.querySelectorAll('.deck-card').forEach((card) => {
      const ticker = card.querySelector('.card-ticker')?.textContent?.trim().toUpperCase();
      if (!ticker || !symbols.includes(ticker)) return;
      const amountEl = card.querySelector('.card-amount');
      if (amountEl) amountEl.dataset.label = 'Price (USD)';
    });
    document.querySelectorAll('.c-card').forEach((card) => {
      const ticker = card.querySelector('.c-card-ticker')?.textContent?.trim().toUpperCase();
      if (!ticker || !symbols.includes(ticker)) return;
      const valueEl = card.querySelector('.c-card-value');
      if (valueEl) valueEl.dataset.label = 'Price';
    });

    symbols.forEach((symbol) => {
      setCardMetricState(symbol, '--', '24h Change --');
    });
  };

  const formatPrice = (price) => {
    if (!Number.isFinite(price)) return '--';
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  };

  const formatChange = (change) => {
    if (!Number.isFinite(change)) return '--';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const setCardMetricState = (symbol, metricText, changeText, isPositive = null) => {
    const deskCards = document.querySelectorAll('.deck-card');
    deskCards.forEach((card) => {
      const ticker = card.querySelector('.card-ticker');
      if (!ticker || ticker.textContent.trim().toUpperCase() !== symbol) return;

      const amountEl = card.querySelector('.card-amount');
      if (amountEl) {
        amountEl.textContent = metricText;
        amountEl.dataset.label = 'Price (USD)';
      }

      const badgeEl = card.querySelector('.card-badge');
      if (!badgeEl) {
        const fallbackInfo = card.querySelector('.card-amount + div');
        if (fallbackInfo) {
          fallbackInfo.textContent = changeText;
          fallbackInfo.style.color = isPositive === null ? 'rgba(255,255,255,0.75)' : (isPositive ? '#93efbe' : '#ff9aa2');
          fallbackInfo.style.fontSize = '0.875rem';
        }
      } else {
        badgeEl.textContent = changeText;
        badgeEl.classList.toggle('is-pos', isPositive === true);
        badgeEl.classList.toggle('is-neg', isPositive === false);
      }
    });

    const mobileCards = document.querySelectorAll('.c-card');
    mobileCards.forEach((card) => {
      const ticker = card.querySelector('.c-card-ticker');
      if (!ticker || ticker.textContent.trim().toUpperCase() !== symbol) return;
      const valueEl = card.querySelector('.c-card-value');
      const badgeEl = card.querySelector('.c-card-badge');
      if (valueEl) {
        valueEl.textContent = metricText;
        valueEl.dataset.label = 'Price';
      }
      if (badgeEl) {
        badgeEl.textContent = changeText;
        badgeEl.style.color = isPositive === null ? 'rgba(255,255,255,0.78)' : (isPositive ? '#90efbb' : '#ff9aa2');
      }
    });
  };

  const updateCardText = (symbol, quote) => {
    const isPositive = quote.change24h >= 0;
    setCardMetricState(symbol, formatPrice(quote.price), `24h Change ${formatChange(quote.change24h)}`, isPositive);
  };

  const normalizeFromPublicDataApi = (payload) => {
    const list = payload?.data?.cryptoCurrencyList;
    if (!Array.isArray(list)) return null;
    const map = {};
    list.forEach((item) => {
      const symbol = item?.symbol;
      if (!symbol || !symbols.includes(symbol)) return;
      const q = Array.isArray(item.quotes) ? item.quotes[0] : item.quote?.USD || item.quote;
      const price = q?.price ?? item?.price;
      const change24h = q?.percentChange24h ?? q?.percent_change_24h ?? item?.percentChange24h;
      if (Number.isFinite(price) && Number.isFinite(change24h)) {
        map[symbol] = { price, change24h };
      }
    });
    return Object.keys(map).length ? map : null;
  };

  const normalizeFromProApi = (payload) => {
    const data = payload?.data;
    if (!data || typeof data !== 'object') return null;
    const map = {};
    Object.values(data).forEach((coin) => {
      const symbol = coin?.symbol;
      const quote = coin?.quote?.USD;
      if (!symbol || !quote || !symbols.includes(symbol)) return;
      const price = quote?.price;
      const change24h = quote?.percent_change_24h;
      if (Number.isFinite(price) && Number.isFinite(change24h)) {
        map[symbol] = { price, change24h };
      }
    });
    return Object.keys(map).length ? map : null;
  };

  const fetchFromPublicDataApi = async () => {
    const url = 'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit=200&sortBy=market_cap&sortType=desc&convert=USD&cryptoType=all&tagType=all';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`CMC public API error: ${res.status}`);
    return normalizeFromPublicDataApi(await res.json());
  };

  const fetchFromProApi = async () => {
    const key = window.CMC_API_KEY;
    if (!key) return null;
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}&convert=USD`;
    const res = await fetch(url, {
      headers: { 'X-CMC_PRO_API_KEY': key },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`CMC pro API error: ${res.status}`);
    return normalizeFromProApi(await res.json());
  };

  const pullQuotes = async () => {
    try {
      let quotes = await fetchFromPublicDataApi();
      if (!quotes || Object.keys(quotes).length === 0) quotes = await fetchFromProApi();
      if (!quotes) throw new Error('No quote payload');

      symbols.forEach((symbol) => {
        if (quotes[symbol]) {
          updateCardText(symbol, quotes[symbol]);
        } else {
          setCardMetricState(symbol, 'N/A', '24h Change N/A');
        }
      });

      if (metaEl) {
        const ts = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        metaEl.textContent = `Market data: CoinMarketCap (${ts} 更新)`;
      }
    } catch (_err) {
      if (metaEl) {
        metaEl.textContent = 'Market data: CoinMarketCap (接続待機中)';
      }
    }
  };

  applyStaticMetricLabels();
  pullQuotes();
  setInterval(pullQuotes, refreshMs);
})();

/* ── Operating section: sync image height to left cards (desktop) ── */
(function() {
  const opGrid = document.querySelector('#operating .op-grid');
  if (!opGrid) return;

  const leftCol = opGrid.querySelector(':scope > div:first-child');
  const rightImageWrap = opGrid.querySelector('.op-img');
  if (!leftCol || !rightImageWrap) return;

  const syncHeight = () => {
    if (window.innerWidth <= 1023) {
      rightImageWrap.style.height = '';
      return;
    }
    const leftHeight = Math.ceil(leftCol.getBoundingClientRect().height);
    if (leftHeight > 0) rightImageWrap.style.height = `${leftHeight}px`;
  };

  const ro = new ResizeObserver(syncHeight);
  ro.observe(leftCol);
  ro.observe(opGrid);

  window.addEventListener('load', syncHeight);
  window.addEventListener('resize', syncHeight, { passive: true });
  requestAnimationFrame(() => requestAnimationFrame(syncHeight));
})();

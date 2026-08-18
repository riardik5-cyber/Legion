/**
 * Legion Liquor Store Catalog - Core Script
 * Handles multilingual switching, catalog filtering, live search, and modal preview.
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'ru';
  let activeMainCategory = 'all'; // 'all', 'wines', 'spirits'
  let activeCountry = 'all';
  let activeWineType = 'all';
  let activeSpiritType = 'all';
  let searchQuery = '';

  // Elements
  const langButtons = document.querySelectorAll('.lang-btn');
  const mainNavTabs = document.querySelectorAll('.nav-tab');
  const countryBadgeWrapper = document.getElementById('countryFilterWrapper');
  const wineTypeBadgeWrapper = document.getElementById('typeFilterWrapper');
  const spiritsFilterWrapper = document.getElementById('spiritsFilterWrapper');
  const searchInput = document.getElementById('searchInput');
  const productCards = document.querySelectorAll('.product-card');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // Modal Elements
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategoryBadge = document.getElementById('modalCategoryBadge');
  const modalCountryBadge = document.getElementById('modalCountryBadge');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');

  /* ==========================================
     Language Switching Logic
     ========================================== */
  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    // Update active button state
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update static i18n text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Update placeholder
    if (searchInput && translations[lang].searchPlaceholder) {
      searchInput.placeholder = translations[lang].searchPlaceholder;
    }

    // Update product card localized prices or currency labels if needed
    updateProductCardsDisplay();
  }

  // Bind language button clicks
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

  /* ==========================================
     Navigation & Category Tab Filtering
     ========================================== */
  mainNavTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mainNavTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      activeMainCategory = tab.dataset.category;

      // Show/Hide relevant sub-filter badge bars
      if (activeMainCategory === 'wines') {
        countryBadgeWrapper.style.display = 'block';
        wineTypeBadgeWrapper.style.display = 'block';
        spiritsFilterWrapper.style.display = 'none';
      } else if (activeMainCategory === 'spirits') {
        countryBadgeWrapper.style.display = 'none';
        wineTypeBadgeWrapper.style.display = 'none';
        spiritsFilterWrapper.style.display = 'block';
      } else {
        // 'all'
        countryBadgeWrapper.style.display = 'block';
        wineTypeBadgeWrapper.style.display = 'block';
        spiritsFilterWrapper.style.display = 'block';
      }

      filterProducts();
    });
  });

  /* ==========================================
     Badge Filter Button Listeners
     ========================================== */
  document.querySelectorAll('.badge-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parentWrapper = btn.closest('.filter-group');
      parentWrapper.querySelectorAll('.badge-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.country) {
        activeCountry = btn.dataset.country;
      }
      if (btn.dataset.wineType) {
        activeWineType = btn.dataset.wineType;
      }
      if (btn.dataset.spiritType) {
        activeSpiritType = btn.dataset.spiritType;
      }

      filterProducts();
    });
  });

  /* ==========================================
     Search Input Filter
     ========================================== */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterProducts();
    });
  }

  /* ==========================================
     Product Filtering Core Algorithm
     ========================================== */
  function filterProducts() {
    productCards.forEach(card => {
      const category = card.dataset.category; // 'wine' or 'spirit'
      const country = card.dataset.country || 'all';
      const wineType = card.dataset.type || 'all'; // 'dry', 'semisweet', etc.
      const spiritType = card.dataset.spirit || 'all'; // 'cognac', 'vodka', 'whiskey'

      const titleText = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
      const descText = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();

      // Check Main Category match
      let matchMain = false;
      if (activeMainCategory === 'all') matchMain = true;
      else if (activeMainCategory === 'wines' && category === 'wine') matchMain = true;
      else if (activeMainCategory === 'spirits' && category === 'spirit') matchMain = true;

      // Check Country match (for wines)
      let matchCountry = (activeCountry === 'all' || country === activeCountry);

      // Check Wine Type match
      let matchWineType = (activeWineType === 'all' || wineType === activeWineType);

      // Check Spirit Type match
      let matchSpiritType = (activeSpiritType === 'all' || spiritType === activeSpiritType);

      // Check Search text query match
      let matchSearch = true;
      if (searchQuery) {
        matchSearch = titleText.includes(searchQuery) || descText.includes(searchQuery);
      }

      // Final Visibility Decision
      if (matchMain && matchCountry && matchWineType && matchSpiritType && matchSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function updateProductCardsDisplay() {
    // Dynamic updates if needed
  }

  /* ==========================================
     Product Quick View Modal Handler
     ========================================== */
  productCards.forEach(card => {
    const btn = card.querySelector('.btn-details');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(card);
      });
    }

    // Clicking anywhere on card opens modal
    card.addEventListener('click', () => {
      openModal(card);
    });
  });

  function openModal(card) {
    const imgSrc = card.querySelector('.product-image')?.src || '';
    const title = card.querySelector('.product-title')?.textContent || '';
    const price = card.querySelector('.product-price')?.textContent || '';
    const desc = card.querySelector('.product-desc')?.textContent || '';
    const countryBadge = card.querySelector('.card-badge')?.textContent || '';
    const typeBadge = card.querySelector('.card-badge-type')?.textContent || '';

    modalImage.src = imgSrc;
    modalTitle.textContent = title;
    modalPrice.textContent = price;
    modalDesc.textContent = desc;
    modalCountryBadge.textContent = countryBadge;
    modalCategoryBadge.textContent = typeBadge;

    modalOverlay.classList.add('open');
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('open');
      }
    });
  }

  // Initialize with Russian language
  setLanguage('ru');
});

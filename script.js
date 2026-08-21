/**
 * Legion Liquor Store Catalog - Core Script
 * Handles multilingual switching, catalog filtering, live search, and modal preview.
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'ru';
  let isChoiceOpen = false;
  let activeMainCategory = null; // null, 'wines', 'spirits'
  let activeCountry = 'all';
  let activeWineType = 'all';
  let activeSpiritType = 'all';
  let searchQuery = '';

  // Elements
  const langButtons = document.querySelectorAll('.lang-btn');
  const mainChoiceBtn = document.getElementById('mainChoiceBtn');
  const subNavWrapper = document.getElementById('subNavWrapper');
  const mainNavTabs = document.querySelectorAll('.nav-tab');
  
  // Content Sections
  const searchSection = document.getElementById('searchSection');
  const filterControls = document.getElementById('filterControls');
  const countryBadgeWrapper = document.getElementById('countryFilterWrapper');
  const wineTypeBadgeWrapper = document.getElementById('typeFilterWrapper');
  const spiritsFilterWrapper = document.getElementById('spiritsFilterWrapper');
  const sectionHeader = document.getElementById('sectionHeader');
  const searchInput = document.getElementById('searchInput');
  const productCards = document.querySelectorAll('.product-card');

  // Modal Elements
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
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
    if (typeof translations === 'undefined' || !translations[lang]) return;
    currentLang = lang;

    // Update active language button state
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
  }

  // Bind language button clicks
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

  /* ==========================================
     Main Choice Button Toggle Handler
     ========================================== */
  if (mainChoiceBtn && subNavWrapper) {
    mainChoiceBtn.addEventListener('click', () => {
      isChoiceOpen = !isChoiceOpen;

      if (!isChoiceOpen) {
        // Close sub-nav wrapper and hide everything
        subNavWrapper.classList.remove('open');
        mainChoiceBtn.classList.remove('active');
        activeMainCategory = null;
        mainNavTabs.forEach(t => t.classList.remove('active'));
      } else {
        // Open sub-nav wrapper (show sub-tabs "Вина" and "Крепкие напитки")
        subNavWrapper.classList.add('open');
        mainChoiceBtn.classList.add('active');
        // Do not force active category yet until user clicks a sub-tab
      }

      filterProducts();
    });
  }

  /* ==========================================
     Navigation & Category Tab Filtering
     ========================================== */
  mainNavTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mainNavTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      activeMainCategory = tab.dataset.category; // 'wines' or 'spirits'
      filterProducts();
    });
  });

  /* ==========================================
     Badge Filter Button Listeners
     ========================================== */
  document.querySelectorAll('.badge-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentWrapper = btn.closest('.filter-group');
      
      const wasActive = btn.classList.contains('active');
      parentWrapper.querySelectorAll('.badge-btn').forEach(b => b.classList.remove('active'));

      if (btn.dataset.country !== undefined) {
        activeCountry = wasActive ? 'all' : btn.dataset.country;
        if (!wasActive && btn.dataset.country !== 'all') {
          btn.classList.add('active');
        } else if (!wasActive && btn.dataset.country === 'all') {
          btn.classList.add('active');
        }
      }

      if (btn.dataset.wineType !== undefined) {
        activeWineType = wasActive ? 'all' : btn.dataset.wineType;
        if (!wasActive && btn.dataset.wineType !== 'all') {
          btn.classList.add('active');
        } else if (!wasActive && btn.dataset.wineType === 'all') {
          btn.classList.add('active');
        }
      }

      if (btn.dataset.spiritType !== undefined) {
        activeSpiritType = wasActive ? 'all' : btn.dataset.spiritType;
        if (!wasActive && btn.dataset.spiritType !== 'all') {
          btn.classList.add('active');
        } else if (!wasActive && btn.dataset.spiritType === 'all') {
          btn.classList.add('active');
        }
      }

      filterProducts();
    });
  });

  /* ==========================================
     Search Input Filter
     ========================================== */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      filterProducts();
    });
  }

  /* ==========================================
     Product & Section Filtering Core Algorithm
     ========================================== */
  function filterProducts() {
    // 1. If choice button is closed or no sub-category selected yet:
    if (!isChoiceOpen || !activeMainCategory) {
      if (searchSection) searchSection.style.display = 'none';
      if (filterControls) filterControls.style.display = 'none';
      if (sectionHeader) sectionHeader.style.display = 'none';
      productCards.forEach(card => card.style.display = 'none');
      return;
    }

    // 2. Sub-category IS selected ("wines" or "spirits"):
    if (searchSection) searchSection.style.display = 'block';
    if (filterControls) filterControls.style.display = 'block';
    if (sectionHeader) sectionHeader.style.display = 'block';

    // Show/Hide relevant sub-filter badge bars
    if (activeMainCategory === 'wines') {
      if (countryBadgeWrapper) countryBadgeWrapper.style.display = 'block';
      if (wineTypeBadgeWrapper) wineTypeBadgeWrapper.style.display = 'block';
      if (spiritsFilterWrapper) spiritsFilterWrapper.style.display = 'none';
    } else if (activeMainCategory === 'spirits') {
      if (countryBadgeWrapper) countryBadgeWrapper.style.display = 'block';
      if (wineTypeBadgeWrapper) wineTypeBadgeWrapper.style.display = 'none';
      if (spiritsFilterWrapper) spiritsFilterWrapper.style.display = 'block';
    }

    // 3. Filter product cards:
    productCards.forEach(card => {
      const category = card.dataset.category; // 'wine' or 'spirit'
      const country = card.dataset.country || '';
      const wineType = card.dataset.type || ''; // 'dry', 'semisweet', etc.
      const spiritType = card.dataset.spirit || ''; // 'cognac', 'vodka', 'whiskey'

      const titleText = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
      const descText = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();

      // Category match
      let matchMain = false;
      if (activeMainCategory === 'wines' && category === 'wine') matchMain = true;
      else if (activeMainCategory === 'spirits' && category === 'spirit') matchMain = true;

      // Search match
      let matchSearch = true;
      if (searchQuery) {
        matchSearch = titleText.includes(searchQuery) || descText.includes(searchQuery);
      }

      // Sub-filters match
      let matchSubFilter = true;
      if (category === 'wine') {
        const matchCountry = (activeCountry === 'all' || country === activeCountry);
        const matchWineType = (activeWineType === 'all' || wineType === activeWineType);
        matchSubFilter = matchCountry && matchWineType;
      } else if (category === 'spirit') {
        const matchCountry = (activeCountry === 'all' || country === activeCountry);
        const matchSpiritType = (activeSpiritType === 'all' || spiritType === activeSpiritType);
        matchSubFilter = matchCountry && matchSpiritType;
      }

      // Final Visibility
      if (matchMain && matchSubFilter && matchSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
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

    if (modalImage) modalImage.src = imgSrc;
    if (modalTitle) modalTitle.textContent = title;
    if (modalPrice) modalPrice.textContent = price;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalCountryBadge) modalCountryBadge.textContent = countryBadge;
    if (modalCategoryBadge) modalCategoryBadge.textContent = typeBadge;

    if (modalOverlay) modalOverlay.classList.add('open');
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('open');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('open');
      }
    });
  }

  // Initialize with Russian language and initial hidden state
  setLanguage('ru');
  filterProducts();
});

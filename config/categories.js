// ===== SMOOTH CATEGORIES DROPDOWN =====

let currentCategory = 'all';
let currentSort = 'name-asc';
let categoryDropdownOpen = false;
let originalOrder = [];

// Category data
const CATEGORIES = {
  'all': { icon: '🎮', name: 'All Games', color: '#ffffff' },
  'action': { icon: '⚔️', name: 'Action', color: '#ff4444' },
  'puzzle': { icon: '🧩', name: 'Puzzle', color: '#44ff44' },
  'racing': { icon: '🏎️', name: 'Racing', color: '#ff8844' },
  'sports': { icon: '⚽', name: 'Sports', color: '#44ff88' },
  'adventure': { icon: '🗺️', name: 'Adventure', color: '#44aaff' },
  'platformer': { icon: '🏃', name: 'Platformer', color: '#ff44ff' },
  'strategy': { icon: '♟️', name: 'Strategy', color: '#88ff44' },
  'multiplayer': { icon: '👥', name: 'Multiplayer', color: '#ffaa44' },
  'arcade': { icon: '🕹️', name: 'Arcade', color: '#ff44aa' },
  'horror': { icon: '👻', name: 'Horror', color: '#aa44ff' },
  'simulation': { icon: '🏭', name: 'Simulation', color: '#44ffcc' },
  'sandbox': { icon: '🎨', name: 'Sandbox', color: '#ff8844' },
  'other': { icon: '🎮', name: 'Other', color: '#aaaaaa' }
};

// Add category tags to game cards
function addCategoryTags() {
  const games = document.querySelectorAll('.game');
  games.forEach(game => {
    if (game.getAttribute('data-tagged')) return;
    const name = game.querySelector('p')?.textContent;
    if (name && window.gamesData) {
      const gameData = window.gamesData.find(g => g.name === name);
      const cat = gameData?.category || 'other';
      const catInfo = CATEGORIES[cat] || CATEGORIES.other;
      const tag = document.createElement('div');
      tag.className = 'game-category';
      tag.style.cssText = `
        display: inline-block;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 20px;
        background: ${catInfo.color}20;
        color: ${catInfo.color};
        margin-top: 5px;
        font-family: monospace;
        transition: all 0.2s ease;
      `;
      tag.innerHTML = `${catInfo.icon} ${catInfo.name}`;
      game.appendChild(tag);
      game.setAttribute('data-category', cat);
      game.setAttribute('data-tagged', 'true');
    }
  });
}

// Filter games
function filterGames() {
  const container = document.getElementById('gamesContainer');
  if (!container) return;
  
  const games = Array.from(container.children);
  let visible = [];
  let hidden = [];
  
  games.forEach(game => {
    const cat = game.getAttribute('data-category');
    if (currentCategory === 'all' || cat === currentCategory) {
      game.style.display = '';
      visible.push(game);
    } else {
      game.style.display = 'none';
      hidden.push(game);
    }
  });
  
  // Sort visible games
  if (currentSort !== 'default') {
    visible.sort((a, b) => {
      const aName = a.querySelector('p')?.textContent || '';
      const bName = b.querySelector('p')?.textContent || '';
      if (currentSort === 'name-asc') return aName.localeCompare(bName);
      if (currentSort === 'name-desc') return bName.localeCompare(aName);
      
      const aRating = parseFloat(a.querySelector('.rating-average')?.textContent?.match(/★ ([\d.]+)/)?.[1] || 0);
      const bRating = parseFloat(b.querySelector('.rating-average')?.textContent?.match(/★ ([\d.]+)/)?.[1] || 0);
      return currentSort === 'rating-desc' ? bRating - aRating : aRating - bRating;
    });
  }
  
  visible.forEach(game => container.appendChild(game));
  hidden.forEach(game => container.appendChild(game));
  
  // Update count
  let countEl = document.getElementById('games-count');
  if (!countEl) {
    countEl = document.createElement('div');
    countEl.id = 'games-count';
    countEl.style.cssText = 'text-align:center;font-size:12px;color:rgba(255,255,255,0.5);margin:10px auto;font-family:monospace;';
    container.parentNode.insertBefore(countEl, container.nextSibling);
  }
  const totalGames = document.querySelectorAll('.game').length;
  countEl.textContent = `${visible.length} of ${totalGames} games`;
}

// Create category bar with smooth dropdown
function createCategoryBar() {
  // Main container
  const container = document.createElement('div');
  container.id = 'category-controls';
  container.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    align-items: center;
    margin: 20px auto;
    padding: 0 15px;
    position: relative;
  `;
  
  // Category dropdown button
  const catBtn = document.createElement('button');
  catBtn.id = 'category-btn';
  catBtn.style.cssText = `
    background: rgba(20, 30, 50, 0.9);
    border: 1px solid rgba(45, 90, 227, 0.5);
    border-radius: 40px;
    padding: 10px 24px;
    color: white;
    font-size: 15px;
    font-family: 'Ubuntu', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    backdrop-filter: blur(5px);
  `;
  catBtn.innerHTML = `
    <span style="font-size: 18px;">🐈</span>
    <span>egories</span>
    <span id="category-arrow" style="font-size: 12px; transition: transform 0.3s ease;">▼</span>
  `;
  
  // Dropdown menu
  const dropdown = document.createElement('div');
  dropdown.id = 'category-dropdown';
  dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    background: rgba(15, 20, 40, 0.98);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(45, 90, 227, 0.4);
    border-radius: 20px;
    margin-top: 8px;
    min-width: 200px;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 1000;
    box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    pointer-events: none;
  `;
  
  // Add category options
  const categories = ['all', 'action', 'puzzle', 'racing', 'sports', 'adventure', 'platformer', 'strategy', 'multiplayer', 'arcade', 'horror', 'simulation', 'sandbox'];
  
  categories.forEach(cat => {
    const info = CATEGORIES[cat];
    const option = document.createElement('div');
    option.className = 'category-option';
    option.setAttribute('data-category', cat);
    option.style.cssText = `
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255,255,255,0.8);
      font-size: 14px;
      font-family: 'Ubuntu', sans-serif;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    `;
    option.innerHTML = `<span style="font-size: 18px;">${info.icon}</span> <span>${info.name}</span>`;
    
    option.onmouseenter = () => {
      option.style.background = `${info.color}20`;
      option.style.color = info.color;
    };
    option.onmouseleave = () => {
      option.style.background = 'transparent';
      option.style.color = 'rgba(255,255,255,0.8)';
    };
    option.onclick = () => {
      currentCategory = cat;
      const selectedName = document.getElementById('selected-category');
      if (selectedName) selectedName.textContent = info.name;
      catBtn.style.borderColor = info.color;
      setTimeout(() => {
        catBtn.style.borderColor = 'rgba(45,90,227,0.5)';
      }, 300);
      filterGames();
      closeDropdown();
    };
    
    dropdown.appendChild(option);
  });
  
  // Sort buttons container
  const sortContainer = document.createElement('div');
  sortContainer.style.cssText = `
    display: flex;
    gap: 8px;
    background: rgba(20, 30, 50, 0.9);
    border: 1px solid rgba(45, 90, 227, 0.5);
    border-radius: 40px;
    padding: 4px;
    backdrop-filter: blur(5px);
  `;
  
  const sorts = [
    { value: 'name-asc', label: 'A-Z', icon: '📝' },
    { value: 'name-desc', label: 'Z-A', icon: '📝' },
    { value: 'rating-desc', label: '⭐ High', icon: '⭐' },
    { value: 'rating-asc', label: '⭐ Low', icon: '⭐' }
  ];
  
  sorts.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = `${s.icon} ${s.label}`;
    btn.style.cssText = `
      background: transparent;
      border: none;
      border-radius: 30px;
      padding: 8px 16px;
      color: white;
      font-size: 13px;
      font-family: 'Ubuntu', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    btn.onmouseenter = () => {
      btn.style.background = 'rgba(45,90,227,0.3)';
    };
    btn.onmouseleave = () => {
      btn.style.background = currentSort === s.value ? 'rgba(45,90,227,0.5)' : 'transparent';
    };
    btn.onclick = () => {
      currentSort = s.value;
      filterGames();
      sorts.forEach(ss => {
        document.querySelectorAll('.sort-btn-custom').forEach(b => {
          b.style.background = 'transparent';
        });
      });
      btn.style.background = 'rgba(45,90,227,0.5)';
    };
    btn.classList.add('sort-btn-custom');
    if (s.value === currentSort) btn.style.background = 'rgba(45,90,227,0.5)';
    sortContainer.appendChild(btn);
  });
  
  container.appendChild(catBtn);
  container.appendChild(sortContainer);
  container.appendChild(dropdown);
  
  // Find where to insert
  const searchDiv = document.querySelector('.center');
  if (searchDiv && searchDiv.parentNode) {
    searchDiv.parentNode.insertBefore(container, searchDiv.nextSibling);
  }
  
  // Dropdown functions
  function openDropdown() {
    dropdown.style.maxHeight = '400px';
    dropdown.style.opacity = '1';
    dropdown.style.transform = 'translateX(-50%) translateY(0)';
    dropdown.style.pointerEvents = 'all';
    document.getElementById('category-arrow').style.transform = 'rotate(180deg)';
    categoryDropdownOpen = true;
  }
  
  function closeDropdown() {
    dropdown.style.maxHeight = '0';
    dropdown.style.opacity = '0';
    dropdown.style.transform = 'translateX(-50%) translateY(-10px)';
    dropdown.style.pointerEvents = 'none';
    document.getElementById('category-arrow').style.transform = 'rotate(0deg)';
    categoryDropdownOpen = false;
  }
  
  catBtn.onclick = (e) => {
    e.stopPropagation();
    if (categoryDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };
  
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && categoryDropdownOpen) {
      closeDropdown();
    }
  });
}

// Store original order
function storeOriginalOrder() {
  const container = document.getElementById('gamesContainer');
  if (container && originalOrder.length === 0 && container.children.length > 0) {
    originalOrder = Array.from(container.children);
  }
}

// Initialize everything
function initCategories() {
  storeOriginalOrder();
  createCategoryBar();
  addCategoryTags();
  filterGames();
}

// Wait for games to load
if (window.gamesData && window.gamesData.length > 0) {
  initCategories();
} else {
  const checkInterval = setInterval(() => {
    if (window.gamesData && window.gamesData.length > 0) {
      clearInterval(checkInterval);
      initCategories();
    }
  }, 100);
}

// Watch for new games
const gameObserver = new MutationObserver(() => {
  addCategoryTags();
});
const gamesContainer = document.getElementById('gamesContainer');
if (gamesContainer) {
  gameObserver.observe(gamesContainer, { childList: true, subtree: true });
}

console.log('✅ Categories ready! Click "🐈 egories" for smooth dropdown');

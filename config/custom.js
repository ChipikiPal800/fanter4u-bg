// Initialize the homepage
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('title').textContent = 'fanter beta';
  document.getElementById('subtitle').textContent = 'v0.25, some settings complete, more games added, bugfixes and more coming soon! :3';
  
  // Load your games
  loadGames();
  
  // Setup search functionality
  setupSearch();
});

async function loadGames() {
  // You can replace this with your actual games data
  const games = [
    { name: 'Game 1', url: 'game1' },
    { name: 'Game 2', url: 'game2' },
    // Add more games here
  ];
  
  const container = document.getElementById('gamesContainer');
  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `<h3>${game.name}</h3>`;
    card.onclick = () => {
      window.location.href = `/play.html?gameurl=${game.url}`;
    };
    container.appendChild(card);
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const gameCards = document.querySelectorAll('.game-card');
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    gameCards.forEach(card => {
      const gameName = card.textContent.toLowerCase();
      card.style.display = gameName.includes(query) ? 'block' : 'none';
    });
  });
}

// ===== LOADING SCREEN WITH SMOOTH TRANSITION =====
(function() {
  // Add loading class to body
  document.body.classList.add('loading');
  
  const loadingScreen = document.getElementById('loadingScreen');
  const progressBar = document.querySelector('.loading-progress-bar');
  const statusText = document.querySelector('.loading-status');
  const brokenWallContainer = document.getElementById('brokenWallContainer');
  const whiteFlash = document.getElementById('whiteFlash');
  const revealOverlay = document.getElementById('revealOverlay');
  
  // Matrix Rain Effect
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  
  let width = window.innerWidth;
  let height = window.innerHeight;
  let drops = [];
  let fontSize = 16;
  let columns;
  
  const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&@!?<>{}[]()*+-=~`";
  
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    columns = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops.push(Math.random() * -height);
    }
  }
  
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    for (let i = 0; i < drops.length; i++) {
      const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      
      const greenShades = ['#00ff88', '#00cc66', '#33ff99'];
      ctx.fillStyle = greenShades[Math.floor(Math.random() * greenShades.length)];
      ctx.font = fontSize + 'px monospace';
      
      ctx.fillText(text, x, y);
      
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  resizeCanvas();
  let matrixInterval = setInterval(drawMatrix, 50);
  window.addEventListener('resize', resizeCanvas);
  
  // Random matrix code falling breakthroughs
  function createRandomMatrixFall() {
    const fall = document.createElement('div');
    fall.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: -100px;
      width: ${Math.random() * 100 + 50}px;
      color: #00ff88;
      font-family: 'Courier New', monospace;
      font-size: ${Math.random() * 10 + 8}px;
      opacity: ${Math.random() * 0.5 + 0.3};
      pointer-events: none;
      z-index: 4;
      white-space: nowrap;
      animation: matrixFall ${Math.random() * 2 + 1}s linear forwards;
    `;
    
    const chars = "010011101001011010";
    let text = "";
    for (let i = 0; i < Math.random() * 20 + 10; i++) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }
    fall.textContent = text;
    
    document.body.appendChild(fall);
    setTimeout(() => fall.remove(), 3000);
  }
  
  // Broken wall breakthroughs
  function createBrokenWall() {
    const wall = document.createElement('div');
    wall.className = 'broken-wall';
    
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const sizeW = Math.random() * 200 + 80;
    const sizeH = Math.random() * 120 + 60;
    
    wall.style.left = posX + '%';
    wall.style.top = posY + '%';
    wall.style.width = sizeW + 'px';
    wall.style.height = sizeH + 'px';
    
    if (Math.random() > 0.8) {
      wall.classList.add('cracked');
    }
    
    brokenWallContainer.appendChild(wall);
    setTimeout(() => wall.remove(), 800);
  }
  
  function createBreakthroughCluster() {
    const clusterSize = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < clusterSize; i++) {
      setTimeout(() => createBrokenWall(), i * 50);
    }
  }
  
  // Random effects during loading
  const effectsInterval = setInterval(() => {
    if (progress < 100) {
      if (Math.random() > 0.7) createBreakthroughCluster();
      if (Math.random() > 0.85) createRandomMatrixFall();
    }
  }, 600);
  
  // Loading progress simulation
  let progress = 0;
  const statusMessages = [
    "Initializing fanter.OS...",
    "Loading core modules...",
    "Bypassing firewalls...",
    "Decrypting game database...",
    "Loading games library...",
    "Applying custom themes...",
    "Hacking mainframe...",
    "Checking for updates...",
    "Almost there...",
    "Starting fanter.OS..."
  ];
  
  let messageIndex = 0;
  
  const loadInterval = setInterval(() => {
    progress += Math.random() * 10 + 2;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      clearInterval(matrixInterval);
      clearInterval(effectsInterval);
      
      statusText.textContent = "Complete! Starting fanter.OS...";
      progressBar.style.width = '100%';
      
      // Start the transition effect
      setTimeout(() => startTransition(), 300);
    }
    
    progressBar.style.width = progress + '%';
    
    const newIndex = Math.floor(progress / 11);
    if (newIndex > messageIndex && newIndex < statusMessages.length) {
      messageIndex = newIndex;
      statusText.textContent = statusMessages[messageIndex];
    }
  }, 250);
  
  // ===== SMOOTH TRANSITION EFFECT =====
  function startTransition() {
    // Step 1: White flash
    whiteFlash.style.opacity = '1';
    
    setTimeout(() => {
      // Step 2: Hide loading screen
      loadingScreen.style.opacity = '0';
      loadingScreen.style.visibility = 'hidden';
      
      // Step 3: Show reveal overlay (thick line)
      revealOverlay.style.transform = 'scaleX(1)';
      
      setTimeout(() => {
        // Step 4: Fade out white flash
        whiteFlash.style.opacity = '0';
        
        // Step 5: Show background content
        document.body.classList.remove('loading');
        
        // Step 6: Animate games appearing randomly
        animateGamesRandomly();
        
        // Step 7: Slide in search bar and settings button
        animateSearchAndSettings();
        
        setTimeout(() => {
          // Step 8: Remove reveal overlay
          revealOverlay.style.transform = 'scaleX(0)';
          setTimeout(() => {
            revealOverlay.remove();
            whiteFlash.remove();
          }, 1200);
        }, 500);
        
      }, 800);
    }, 300);
  }
  
  // Random game appearance animation
  function animateGamesRandomly() {
    const games = document.querySelectorAll('.game');
    const gamesContainer = document.getElementById('gamesContainer');
    
    // Make all games invisible initially
    games.forEach(game => {
      game.style.opacity = '0';
      game.style.transform = 'scale(0)';
      game.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });
    
    // Reveal games randomly
    const revealOrder = Array.from(games).map((_, i) => i);
    for (let i = revealOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [revealOrder[i], revealOrder[j]] = [revealOrder[j], revealOrder[i]];
    }
    
    revealOrder.forEach((index, i) => {
      setTimeout(() => {
        const game = games[index];
        if (game) {
          game.style.opacity = '1';
          game.style.transform = 'scale(1)';
          
          // Add bounce effect
          game.style.animation = 'gamePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          setTimeout(() => {
            if (game) game.style.animation = '';
          }, 400);
        }
      }, i * 50);
    });
  }
  
  // Slide in search bar and settings button
  function animateSearchAndSettings() {
    const searchBar = document.getElementById('searchInput');
    const settingsBtn = document.querySelector('.center .settings-btn');
    const favSidebar = document.querySelector('.fav-sidebar-btn');
    const title = document.querySelector('.center h1');
    const subtitle = document.querySelector('.center p');
    
    // Search bar slides from left
    if (searchBar) {
      searchBar.style.opacity = '0';
      searchBar.style.transform = 'translateX(-100px)';
      searchBar.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      setTimeout(() => {
        searchBar.style.opacity = '1';
        searchBar.style.transform = 'translateX(0)';
      }, 100);
    }
    
    // Settings button slides from right
    if (settingsBtn) {
      settingsBtn.style.opacity = '0';
      settingsBtn.style.transform = 'translateX(100px)';
      settingsBtn.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      setTimeout(() => {
        settingsBtn.style.opacity = '1';
        settingsBtn.style.transform = 'translateX(0)';
      }, 200);
    }
    
    // Title fades in
    if (title) {
      title.style.opacity = '0';
      title.style.transform = 'translateY(-20px)';
      title.style.transition = 'all 0.5s ease';
      setTimeout(() => {
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }, 150);
    }
    
    // Subtitle fades in
    if (subtitle) {
      subtitle.style.opacity = '0';
      subtitle.style.transform = 'translateY(-20px)';
      subtitle.style.transition = 'all 0.5s ease';
      setTimeout(() => {
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
      }, 250);
    }
    
    // Favorite sidebar slides from left
    if (favSidebar) {
      favSidebar.style.opacity = '0';
      favSidebar.style.transform = 'translateX(-100px)';
      favSidebar.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      setTimeout(() => {
        favSidebar.style.opacity = '1';
        favSidebar.style.transform = 'translateX(0)';
      }, 300);
    }
  }
  
  // Add game pop animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gamePop {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      60% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    @keyframes matrixFall {
      0% {
        transform: translateY(-100px);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(100vh);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Block intractions
  loadingScreen.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });
  
  window.addEventListener('resize', () => resizeCanvas());
  
  console.log('Loading screen ready with transition effects!');
})();

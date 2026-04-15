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

<script>
// ===== LOADING SCREEN SYSTEM (COMPLETE - WITH FIXES) =====
(function() {
  // Add loading class to body
  document.body.classList.add('loading');
  
  const loadingScreen = document.getElementById('loadingScreen');
  const progressBar = document.querySelector('.loading-progress-bar');
  const statusEl = document.getElementById('loadingStatus');
  const whiteFlash = document.getElementById('whiteFlash');
  const revealOverlay = document.getElementById('revealOverlay');
  const brokenWallContainer = document.getElementById('brokenWallContainer');
  
  // ===== MATRIX RAIN =====
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  let width, height, drops = [];
  const fontSize = 16;
  const chars = "01";
  
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const columns = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops.push(Math.random() * -height);
    }
  }
  
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#00ff88';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(text, x, y);
      if (y > height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  
  resizeCanvas();
  const matrixInterval = setInterval(drawMatrix, 50);
  window.addEventListener('resize', resizeCanvas);
  
  // ===== FALLING MATRIX CODE WITH RANDOM COLORS =====
  function createFallingCode() {
    const el = document.createElement('div');
    el.className = 'falling-matrix';
    const length = Math.floor(Math.random() * 25) + 10;
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.random() > 0.5 ? '1' : '0';
    }
    el.textContent = code;
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = (Math.random() * 12 + 8) + 'px';
    el.style.animationDuration = (Math.random() * 2.5 + 1) + 's';
    
    // Random color for each falling code string
    const colors = ['#00ff88', '#ff4444', '#ffcc00'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.color = randomColor;
    el.style.textShadow = `0 0 5px ${randomColor}`;
    el.style.opacity = Math.random() * 0.6 + 0.4;
    
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
  
  // ===== BROKEN WALL (MORE RED POPUPS) =====
  function createBrokenWall() {
    const wall = document.createElement('div');
    wall.className = 'broken-wall';
    wall.style.left = Math.random() * 100 + '%';
    wall.style.top = Math.random() * 100 + '%';
    wall.style.width = (Math.random() * 200 + 80) + 'px';
    wall.style.height = (Math.random() * 120 + 60) + 'px';
    
    // 50% chance to be red/cracked (more red popups)
    if (Math.random() > 0.5) {
      wall.classList.add('cracked');
    }
    
    brokenWallContainer.appendChild(wall);
    setTimeout(() => wall.remove(), 800);
  }
  
  // Create multiple red popups at once
  function createRedPopupCluster() {
    const clusterSize = Math.floor(Math.random() * 5) + 3; // 3-7 red popups
    for (let i = 0; i < clusterSize; i++) {
      setTimeout(() => {
        const wall = document.createElement('div');
        wall.className = 'broken-wall cracked';
        wall.style.left = Math.random() * 100 + '%';
        wall.style.top = Math.random() * 100 + '%';
        wall.style.width = (Math.random() * 150 + 60) + 'px';
        wall.style.height = (Math.random() * 100 + 40) + 'px';
        brokenWallContainer.appendChild(wall);
        setTimeout(() => wall.remove(), 800);
      }, i * 80);
    }
  }
  
  // ===== PROGRESS SIMULATION =====
  let progress = 0;
  const messages = [
    "Initializing fanter.OS...",
    "Loading core modules...",
    "Bypassing firewalls...",
    "Decrypting database...",
    "Loading games library...",
    "Applying themes...",
    "Hacking mainframe...",
    "Optimizing performance...",
    "Loading user preferences...",
    "Almost there...",
    "Starting fanter.OS..."
  ];
  let msgIndex = 0;
  
  // Start random effects (more frequent red popups)
  const effectsInterval = setInterval(() => {
    if (progress < 100) {
      if (Math.random() > 0.6) createBrokenWall();
      if (Math.random() > 0.7) createFallingCode();
      if (Math.random() > 0.85) createRedPopupCluster(); // Extra red clusters
    }
  }, 400);
  
  // Progress update
  const progressInterval = setInterval(() => {
    progress += Math.random() * 3 + 1;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      clearInterval(effectsInterval);
      clearInterval(matrixInterval);
      progressBar.style.width = '100%';
      statusEl.textContent = "Complete! Starting fanter.OS...";
      
      // Force wait for games to load
      forceWaitForGames();
    } else {
      progressBar.style.width = progress + '%';
      const newIndex = Math.floor(progress / 9);
      if (newIndex > msgIndex && newIndex < messages.length) {
        msgIndex = newIndex;
        statusEl.textContent = messages[msgIndex];
      }
    }
  }, 300);
  
  // ===== FORCE WAIT FOR GAMES (FIXED) =====
  function forceWaitForGames() {
    let attempts = 0;
    const maxAttempts = 60;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Try multiple ways to detect games
      const gamesContainer = document.getElementById('gamesContainer');
      const hasGames = gamesContainer && gamesContainer.children.length > 0;
      const hasGamesData = typeof gamesData !== 'undefined' && gamesData && gamesData.length > 0;
      
      console.log(`Attempt ${attempts}: Games in DOM: ${hasGames}, GamesData loaded: ${hasGamesData}`);
      
      if (hasGames || hasGamesData) {
        clearInterval(checkInterval);
        // Force games to be visible if they exist
        if (gamesContainer && gamesContainer.children.length === 0 && hasGamesData) {
          // If gamesData exists but DOM is empty, force reload
          if (typeof handleSearchInput === 'function') {
            handleSearchInput();
          }
        }
        
        setTimeout(() => {
          startTransition();
        }, 800);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        startTransition();
      }
    }, 100);
  }
  
  // ===== TRANSITION EFFECT WITH COLORFUL CODE RISE =====
  function startTransition() {
    // Create rising code effect before transition
    createRisingCode();
    
    // White flash
    whiteFlash.style.opacity = '1';
    
    setTimeout(() => {
      // Hide loading screen
      loadingScreen.style.opacity = '0';
      
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        
        // Show reveal overlay
        revealOverlay.style.transform = 'scaleX(1)';
        
        setTimeout(() => {
          // Remove white flash
          whiteFlash.style.opacity = '0';
          
          // Show content
          document.body.classList.remove('loading');
          
          // Animate games
          setTimeout(() => {
            animateGamesRandomly();
            animateUIElements();
          }, 100);
          
          setTimeout(() => {
            revealOverlay.style.transform = 'scaleX(0)';
            setTimeout(() => {
              if (revealOverlay.parentNode) revealOverlay.remove();
              if (whiteFlash.parentNode) whiteFlash.remove();
            }, 1200);
          }, 500);
          
        }, 300);
      }, 400);
    }, 300);
  }
  
  // ===== RISING CODE EFFECT (COLORS CHANGE THEN RISE UP) =====
  function createRisingCode() {
    const codeContainer = document.createElement('div');
    codeContainer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100005;
      overflow: hidden;
    `;
    document.body.appendChild(codeContainer);
    
    const colors = ['#00ff88', '#ff4444', '#ffcc00'];
    const codeStrings = [
      "01001110 01111001 01100001 01101110",
      "01110011 01111001 01110011 01110100 01100101 01101101",
      "01000110 01100001 01101110 01110100 01100101 01110010",
      "01101100 01101111 01100001 01100100 01101001 01101110 01100111",
      "01110011 01111001 01110011 01110100 01100101 01101101 00100000 01101111 01101110 01101100 01101001 01101110 01100101",
      "01100001 01100011 01100011 01100101 01110011 01110011 00100000 01100111 01110010 01100001 01101110 01110100 01100101 01100100",
      "01100110 01100001 01101110 01110100 01100101 01110010 00100000 01101111 01110011",
      "01001000 01100001 01100011 01101011 01101001 01101110 01100111"
    ];
    
    // Create multiple rising code lines
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const codeLine = document.createElement('div');
        const randomCode = codeStrings[Math.floor(Math.random() * codeStrings.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        codeLine.textContent = randomCode;
        codeLine.style.cssText = `
          position: absolute;
          bottom: -50px;
          left: ${Math.random() * 100}%;
          color: ${randomColor};
          font-family: 'Courier New', monospace;
          font-size: ${Math.random() * 16 + 12}px;
          font-weight: bold;
          white-space: nowrap;
          opacity: 0;
          text-shadow: 0 0 10px ${randomColor};
          animation: riseAndFade ${Math.random() * 2 + 1.5}s ease-out forwards;
        `;
        codeContainer.appendChild(codeLine);
        
        // Add animation keyframes if not exists
        if (!document.querySelector('#riseAnimation')) {
          const style = document.createElement('style');
          style.id = 'riseAnimation';
          style.textContent = `
            @keyframes riseAndFade {
              0% {
                bottom: -50px;
                opacity: 0;
                transform: scale(0.5);
              }
              20% {
                opacity: 1;
                transform: scale(1);
              }
              80% {
                opacity: 1;
              }
              100% {
                bottom: 100vh;
                opacity: 0;
                transform: scale(1.2);
              }
            }
          `;
          document.head.appendChild(style);
        }
        
        setTimeout(() => {
          if (codeLine) codeLine.remove();
        }, 3000);
      }, i * 100);
    }
    
    // Remove container after animation
    setTimeout(() => {
      if (codeContainer) codeContainer.remove();
    }, 4000);
  }
  
  // ===== RANDOM GAME APPEARANCE =====
  function animateGamesRandomly() {
    const games = document.querySelectorAll('.game');
    const gameArray = Array.from(games);
    
    if (gameArray.length === 0) {
      // If no games found, try to reload them
      if (typeof handleSearchInput === 'function') {
        setTimeout(() => {
          handleSearchInput();
          setTimeout(() => {
            const retryGames = document.querySelectorAll('.game');
            animateGamesRandomly();
          }, 500);
        }, 100);
      }
      return;
    }
    
    gameArray.forEach(game => {
      game.style.opacity = '0';
      game.style.transform = 'scale(0)';
      game.style.display = 'inline-block';
    });
    
    // Shuffle array
    for (let i = gameArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameArray[i], gameArray[j]] = [gameArray[j], gameArray[i]];
    }
    
    gameArray.forEach((game, index) => {
      setTimeout(() => {
        game.style.opacity = '1';
        game.style.transform = 'scale(1)';
        game.style.animation = 'gamePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        setTimeout(() => {
          game.style.animation = '';
        }, 400);
      }, index * 40);
    });
  }
  
  // ===== SLIDE IN UI ELEMENTS =====
  function animateUIElements() {
    const elements = [
      { el: document.getElementById('searchInput'), dir: 'left', delay: 100 },
      { el: document.querySelector('.center .settings-btn'), dir: 'right', delay: 200 },
      { el: document.querySelector('.center h1'), dir: 'up', delay: 150 },
      { el: document.querySelector('.center p'), dir: 'up', delay: 250 },
      { el: document.querySelector('.fav-sidebar-btn'), dir: 'left', delay: 300 }
    ];
    
    elements.forEach(item => {
      if (!item.el) return;
      item.el.style.opacity = '0';
      if (item.dir === 'left') item.el.style.transform = 'translateX(-100px)';
      if (item.dir === 'right') item.el.style.transform = 'translateX(100px)';
      if (item.dir === 'up') item.el.style.transform = 'translateY(-30px)';
      item.el.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      
      setTimeout(() => {
        item.el.style.opacity = '1';
        item.el.style.transform = 'translateX(0) translateY(0)';
      }, item.delay);
    });
  }
  
  // Hide UI elements initially
  const searchInput = document.getElementById('searchInput');
  const settingsBtn = document.querySelector('.center .settings-btn');
  if (searchInput) {
    searchInput.style.opacity = '0';
    searchInput.style.transform = 'translateX(-100px)';
  }
  if (settingsBtn) {
    settingsBtn.style.opacity = '0';
    settingsBtn.style.transform = 'translateX(100px)';
  }
  
  // Block clicks on loading screen
  loadingScreen.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  console.log('Loading screen active - waiting for games to render...');
})();
</script>

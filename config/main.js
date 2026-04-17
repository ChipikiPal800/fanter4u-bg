// ===== MAIN.JS - COMPLETE VERSION =====

// Make gamesData global
window.gamesData = [];
window.gameEarnings = JSON.parse(localStorage.getItem('gameEarnings') || '{}');
window.gamePlayCounts = JSON.parse(localStorage.getItem('gamePlayCounts') || '{}');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  var sitename = "fanter beta.";
  var subtext = "v0.3, achievements added, shop, pets, and more! :3";

  var serverUrl1 = "https://gms.parcoil.com";
  var currentPageTitle = document.title;
  document.title = currentPageTitle + " | " + sitename;

  function getFavourites() {
    return JSON.parse(localStorage.getItem("favourites") || "[]");
  }

  window.toggleFavourite = function(gameName) {
    var favs = getFavourites();
    var isAdding = false;
    
    if (favs.indexOf(gameName) !== -1) {
      favs = favs.filter(function(f) { return f !== gameName; });
      isAdding = false;
    } else {
      favs.push(gameName);
      isAdding = true;
    }
    localStorage.setItem("favourites", JSON.stringify(favs));
    
    var favBtn = document.querySelector('.fav-btn[data-game="' + gameName.replace(/['"]/g, '\\"') + '"], .game-fav-btn[data-game="' + gameName.replace(/['"]/g, '\\"') + '"]');
    if (favBtn) {
      favBtn.textContent = isAdding ? "★" : "☆";
      favBtn.classList.toggle('active', isAdding);
    }
    
    if (typeof syncFavoriteToAccount === 'function') {
      syncFavoriteToAccount(gameName, isAdding);
    }
    
    if (typeof checkAchievements === 'function') {
      setTimeout(function() { checkAchievements(); }, 100);
    }
  };

  // MAIN DISPLAY FUNCTION - STEAM STYLE
  window.displayFilteredGames = function(filteredGames) {
    var gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;
    gamesContainer.innerHTML = "";
    
    if (!filteredGames || filteredGames.length === 0) {
      gamesContainer.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">no games found 😔</div>';
      return;
    }
    
    // Get user data for stats
    var favourites = getFavourites();
    
    for (var i = 0; i < filteredGames.length; i++) {
      var game = filteredGames[i];
      var gameDiv = document.createElement("div");
      gameDiv.className = "game";
      gameDiv.setAttribute("data-game-name", game.name);
      
      // Get game stats
      var earnedCoins = window.gameEarnings[game.name] || 0;
      var playCount = window.gamePlayCounts[game.name] || 0;
      var isFav = favourites.indexOf(game.name) !== -1;
      var avgRating = (typeof globalRatings !== 'undefined' && globalRatings[game.name]) ? globalRatings[game.name].average.toFixed(1) : '0.0';
      var ratingCount = (typeof globalRatings !== 'undefined' && globalRatings[game.name]) ? globalRatings[game.name].count : 0;
      
      // Get game image
      var imageSrc;
      if (game.image && game.image.indexOf('http') === 0) {
        imageSrc = game.image;
      } else if (game.image) {
        imageSrc = serverUrl1 + "/" + game.url + "/" + game.image;
      } else {
        imageSrc = 'https://via.placeholder.com/320x180?text=No+Image';
      }
      
      // Get category color
      var categoryColor = getCategoryColor(game.category);
      var categoryIcon = getCategoryIcon(game.category);
      
      // Build HTML
      gameDiv.innerHTML = `
        <div class="game-image-container">
          <img src="${imageSrc}" alt="${escapeHtml(game.name)}" loading="lazy">
        </div>
        <div class="game-info">
          <div class="game-title-row">
            <span class="game-name">${escapeHtml(game.name)}</span>
            <button class="game-fav-btn ${isFav ? 'active' : ''}" data-game="${escapeHtml(game.name)}">${isFav ? '★' : '☆'}</button>
          </div>
          <div class="game-desc">${escapeHtml(game.desc || getDefaultDescription(game.category))}</div>
          <div class="game-stats-row">
            <span>🎮 ${playCount} plays</span>
            <span>🪙 ${Math.floor(earnedCoins * 100) / 100}</span>
            <span>⏱️ ${game.loadTime || '1-3 sec'}</span>
          </div>
          <div class="game-meta">
            <span class="game-category" style="background: ${categoryColor}20; color: ${categoryColor}">${categoryIcon} ${game.category || 'other'}</span>
            <span class="game-dev">📅 ${game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'recent'}</span>
          </div>
          <div class="game-rating-row">
            <div class="game-stars">
              ${[1,2,3,4,5].map(s => `<span class="game-star" data-value="${s}">★</span>`).join('')}
            </div>
            <span class="game-rating-text">⭐ ${avgRating} (${ratingCount})</span>
          </div>
          <button class="game-play-btn" data-game="${escapeHtml(game.name)}" data-url="${escapeHtml(game.url)}">🎮 PLAY NOW</button>
        </div>
      `;
      
      gamesContainer.appendChild(gameDiv);
    }
    
    // Attach event listeners
    attachGameCardEvents();
  };
  
  function attachGameCardEvents() {
    // Play buttons
    document.querySelectorAll('.game-play-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var gameName = btn.getAttribute('data-game');
        var gameUrl = btn.getAttribute('data-url');
        if (gameName && gameUrl) {
          if (typeof trackPlayedGame === 'function') trackPlayedGame(gameName);
          var playUrl = 'play.html?gameurl=' + encodeURIComponent(gameUrl) + '&game=' + encodeURIComponent(gameName);
          window.open(playUrl, '_blank');
        }
      };
    });
    
    // Favorite buttons
    document.querySelectorAll('.game-fav-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var gameName = btn.getAttribute('data-game');
        if (gameName && typeof window.toggleFavourite === 'function') {
          window.toggleFavourite(gameName);
          var isFav = JSON.parse(localStorage.getItem("favourites") || "[]").indexOf(gameName) !== -1;
          btn.textContent = isFav ? '★' : '☆';
          btn.classList.toggle('active', isFav);
        }
      };
    });
    
    // Rating stars
    document.querySelectorAll('.game-star').forEach(function(star) {
      star.onclick = function(e) {
        e.stopPropagation();
        var gameDiv = star.closest('.game');
        var gameName = gameDiv.getAttribute('data-game-name');
        var value = parseInt(star.getAttribute('data-value'));
        if (gameName && typeof submitRating === 'function') {
          submitRating(gameName, value);
          // Update stars in this card
          var stars = gameDiv.querySelectorAll('.game-star');
          for (var i = 0; i < stars.length; i++) {
            if (i < value) {
              stars[i].classList.add('active');
            } else {
              stars[i].classList.remove('active');
            }
          }
          // Update rating text
          var ratingText = gameDiv.querySelector('.game-rating-text');
          if (ratingText && typeof globalRatings !== 'undefined' && globalRatings[gameName]) {
            ratingText.innerHTML = '⭐ ' + globalRatings[gameName].average.toFixed(1) + ' (' + globalRatings[gameName].count + ')';
          }
        }
      };
    });
    
    // Game card click to show modal
    document.querySelectorAll('.game').forEach(function(card) {
      card.onclick = function(e) {
        // Don't trigger if clicking on buttons
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('game-star')) return;
        var gameName = card.getAttribute('data-game-name');
        if (gameName && window.gamesData) {
          var gameData = null;
          for (var i = 0; i < window.gamesData.length; i++) {
            if (window.gamesData[i].name === gameName) {
              gameData = window.gamesData[i];
              break;
            }
          }
          if (gameData && typeof showGameModal === 'function') {
            var img = card.querySelector('.game-image-container img');
            showGameModal(
              gameData.name,
              gameData.url,
              img ? img.src : '',
              gameData.desc || getDefaultDescription(gameData.category),
              gameData.category,
              gameData.loadTime,
              gameData.developer,
              gameData.releaseDate
            );
          }
        }
      };
    });
  }

  function handleSearchInput() {
    var searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    var searchInputValue = searchInput.value.toLowerCase();
    
    if (typeof checkSecretNames === 'function') {
      checkSecretNames(searchInputValue);
    }
    
    var filteredGames;
    var favFilterOn = localStorage.getItem("favFilter") === "true";
    if (favFilterOn) {
      var favs = getFavourites();
      filteredGames = window.gamesData.filter(function(game) {
        return favs.indexOf(game.name) !== -1 && game.name.toLowerCase().indexOf(searchInputValue) !== -1;
      });
    } else {
      filteredGames = window.gamesData.filter(function(game) {
        return game.name.toLowerCase().indexOf(searchInputValue) !== -1;
      });
    }
    window.displayFilteredGames(filteredGames);
  }

  window.toggleFavFilter = function() {
    var current = localStorage.getItem("favFilter") === "true";
    localStorage.setItem("favFilter", (!current).toString());
    handleSearchInput();
    var favToggleBtn = document.getElementById("favToggleBtn");
    if (favToggleBtn) {
      var on = localStorage.getItem("favFilter") === "true";
      favToggleBtn.textContent = on ? "show: on ✅" : "show: off ❌";
    }
  };

  window.toggleFavSidebar = function() {
    var btn = document.getElementById("favSidebarBtn");
    if (!btn) return;
    var favFilterOn = localStorage.getItem("favFilter") === "true";
    btn.classList.toggle("active", !favFilterOn);
    btn.classList.toggle("visible", !favFilterOn);
    btn.textContent = !favFilterOn ? "✕" : "★";
  };

  // Load games
  fetch("./config/games.json")
    .then(function(response) { return response.json(); })
    .then(function(data) {
      window.gamesData = data;
      handleSearchInput();
      console.log("✅ Loaded " + window.gamesData.length + " games successfully!");
      if (typeof updateGameOfDay === 'function') updateGameOfDay();
      if (typeof loadUserFavorites === 'function') loadUserFavorites();
      if (typeof setupModalOnGameClick === 'function') setupModalOnGameClick();
    })
    .catch(function(error) { console.error("Error fetching games:", error); });

  var searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }
  
  var titleEl = document.getElementById("title");
  if (titleEl) titleEl.innerHTML = sitename;
  
  var subtitleEl = document.getElementById("subtitle");
  if (subtitleEl) subtitleEl.innerHTML = subtext;
});

// ===== HELPER FUNCTIONS =====
function getCategoryColor(category) {
  var colors = {
    'action': '#ff4444', 'puzzle': '#44ff44', 'racing': '#ff8844',
    'sports': '#44ff88', 'adventure': '#44aaff', 'platformer': '#ff44ff',
    'strategy': '#88ff44', 'horror': '#aa44ff', 'arcade': '#ff44aa',
    'simulation': '#44ffcc', 'sandbox': '#ff8844'
  };
  return colors[category] || '#aaaaaa';
}

function getCategoryIcon(category) {
  var icons = {
    'action': '⚔️', 'puzzle': '🧩', 'racing': '🏎️', 'sports': '⚽',
    'adventure': '🗺️', 'platformer': '🏃', 'strategy': '♟️',
    'horror': '👻', 'arcade': '🕹️', 'simulation': '🏭', 'sandbox': '🎨'
  };
  return icons[category] || '🎮';
}

function getDefaultDescription(category) {
  var desc = {
    'action': 'fast-paced action game that\'ll keep you on the edge of your seat',
    'puzzle': 'challenge your brain with tricky puzzles and mind-bending mechanics',
    'racing': 'burn rubber and race to the finish line in high-speed competition',
    'sports': 'compete in your favorite sports from basketball to soccer',
    'adventure': 'embark on an epic journey through mysterious lands',
    'platformer': 'jump, run, and dodge through challenging levels',
    'strategy': 'plan your moves and outsmart your opponents',
    'horror': 'survive the terror and uncover dark secrets',
    'arcade': 'classic arcade action that never gets old',
    'simulation': 'build, manage, and create your own world',
    'sandbox': 'no rules, no limits - just pure creativity'
  };
  return desc[category] || 'a fun game that\'ll keep you entertained for hours';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ===== GAME RATINGS SYSTEM =====
const RATINGS_BIN_ID = "69e045ec856a6821893bc134";
const RATINGS_API_KEY = "$2a$10$2cPmKAGNYxPTRLV03OfVruvfhNpW/VHtJSzR.AVNHumZ7etLdT33.";

var globalRatings = {};
var userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');

async function loadGlobalRatings() {
  try {
    var response = await fetch('https://api.jsonbin.io/v3/b/' + RATINGS_BIN_ID + '/latest', {
      headers: { 'X-Master-Key': RATINGS_API_KEY }
    });
    var data = await response.json();
    if (data.record && data.record.ratings) {
      globalRatings = data.record.ratings;
    }
    console.log('✅ Global ratings loaded:', Object.keys(globalRatings).length, 'games rated');
  } catch (error) {
    console.error('Failed to load ratings:', error);
  }
  refreshAllRatings();
}

async function saveGlobalRatings() {
  try {
    var response = await fetch('https://api.jsonbin.io/v3/b/' + RATINGS_BIN_ID, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': RATINGS_API_KEY
      },
      body: JSON.stringify({ ratings: globalRatings })
    });
    console.log('✅ Ratings saved to cloud');
  } catch (error) {
    console.error('Failed to save ratings:', error);
  }
}

function submitRating(gameName, rating) {
  if (!globalRatings[gameName]) {
    globalRatings[gameName] = { total: 0, count: 0, average: 0 };
  }
  
  var currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  if (currentUser) {
    currentUser.stats = currentUser.stats || { ratingsGiven: 0, favoritesCount: 0, gamesPlayed: 0 };
    currentUser.stats.ratingsGiven = (currentUser.stats.ratingsGiven || 0) + 1;
    localStorage.setItem('fanter_currentUser', JSON.stringify(currentUser));
    
    var users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
    var userIndex = -1;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === currentUser.id) {
        userIndex = i;
        break;
      }
    }
    if (userIndex !== -1) {
      users[userIndex].stats = currentUser.stats;
      localStorage.setItem('fanter_users', JSON.stringify(users));
    }
  }
  
  if (userVotes[gameName]) {
    var oldRating = userVotes[gameName];
    globalRatings[gameName].total -= oldRating;
    globalRatings[gameName].count -= 1;
  }
  
  globalRatings[gameName].total += rating;
  globalRatings[gameName].count += 1;
  globalRatings[gameName].average = globalRatings[gameName].total / globalRatings[gameName].count;
  
  userVotes[gameName] = rating;
  localStorage.setItem('userVotes', JSON.stringify(userVotes));
  
  saveGlobalRatings();
  showRatingToast('You rated "' + gameName + '" ' + rating + '★!');
  updateStarDisplay(gameName, rating);
  
  if (typeof checkAchievements === 'function') {
    setTimeout(function() { checkAchievements(); }, 100);
  }
  if (typeof checkLoyalCustomer === 'function') {
    setTimeout(function() { checkLoyalCustomer(); }, 100);
  }
}

function updateStarDisplay(gameName, userRating) {
  var ratingContainer = document.querySelector('.game-rating[data-game="' + CSS.escape(gameName) + '"]');
  if (ratingContainer) {
    var stars = ratingContainer.querySelectorAll('.star');
    for (var i = 0; i < stars.length; i++) {
      if (i < userRating) {
        stars[i].classList.add('active');
      } else {
        stars[i].classList.remove('active');
      }
    }
  }
  
  // Also update in the game card if present
  var gameCard = document.querySelector('.game[data-game-name="' + CSS.escape(gameName) + '"]');
  if (gameCard) {
    var cardStars = gameCard.querySelectorAll('.game-star');
    for (var i = 0; i < cardStars.length; i++) {
      if (i < userRating) {
        cardStars[i].classList.add('active');
      } else {
        cardStars[i].classList.remove('active');
      }
    }
    var ratingText = gameCard.querySelector('.game-rating-text');
    if (ratingText && globalRatings[gameName]) {
      ratingText.innerHTML = '⭐ ' + globalRatings[gameName].average.toFixed(1) + ' (' + globalRatings[gameName].count + ')';
    }
  }
}

function refreshAllRatings() {
  var containers = document.querySelectorAll('.game-rating');
  for (var i = 0; i < containers.length; i++) {
    var container = containers[i];
    var gameName = container.getAttribute('data-game');
    var gameRating = globalRatings[gameName];
    var userRating = userVotes[gameName] || 0;
    
    var stars = container.querySelectorAll('.star');
    for (var s = 0; s < stars.length; s++) {
      if (s < userRating) {
        stars[s].classList.add('active');
      } else {
        stars[s].classList.remove('active');
      }
    }
  }
  
  // Also refresh game cards
  var gameCards = document.querySelectorAll('.game');
  for (var i = 0; i < gameCards.length; i++) {
    var card = gameCards[i];
    var gameName = card.getAttribute('data-game-name');
    if (gameName && globalRatings[gameName]) {
      var ratingText = card.querySelector('.game-rating-text');
      if (ratingText) {
        ratingText.innerHTML = '⭐ ' + globalRatings[gameName].average.toFixed(1) + ' (' + globalRatings[gameName].count + ')';
      }
    }
  }
}

function showRatingToast(message) {
  var toast = document.querySelector('.rating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'rating-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2000);
}

loadGlobalRatings();

// ===== ACCOUNT SYSTEM HELPER FUNCTIONS =====
function updateAccountButtonDisplay() {
  var currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  var accountNameSpan = document.getElementById('accountName');
  if (accountNameSpan) {
    accountNameSpan.textContent = currentUser ? (currentUser.displayName || currentUser.username) : 'Guest';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateAccountButtonDisplay();
});

window.addEventListener('storage', function(e) {
  if (e.key === 'fanter_currentUser') {
    updateAccountButtonDisplay();
  }
});

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
}

function updateUserInStorage(updatedUser) {
  localStorage.setItem('fanter_currentUser', JSON.stringify(updatedUser));
  
  var users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
  var index = -1;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === updatedUser.id) {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('fanter_users', JSON.stringify(users));
  }
}

function syncFavoriteToAccount(gameName, isAdding) {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  var favorites = currentUser.favorites || [];
  
  if (isAdding) {
    if (favorites.indexOf(gameName) === -1) {
      favorites.push(gameName);
    }
  } else {
    favorites = favorites.filter(function(f) { return f !== gameName; });
  }
  
  currentUser.favorites = favorites;
  currentUser.stats.favoritesCount = favorites.length;
  updateUserInStorage(currentUser);
  
  localStorage.setItem("favourites", JSON.stringify(favorites));
}

function trackPlayedGame(gameName) {
  var currentUser = getCurrentUser();
  var multiplier = getActiveCoinMultiplier();
  var baseEarnings = 0.05;
  var earned = baseEarnings * multiplier;
  
  window.gameEarnings[gameName] = (window.gameEarnings[gameName] || 0) + earned;
  localStorage.setItem('gameEarnings', JSON.stringify(window.gameEarnings));
  
  window.gamePlayCounts[gameName] = (window.gamePlayCounts[gameName] || 0) + 1;
  localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts));
  
  if (currentUser) {
    currentUser.coins = (currentUser.coins || 0) + earned;
    
    var playedGames = currentUser.playedGames || [];
    if (playedGames.indexOf(gameName) === -1) {
      playedGames.unshift(gameName);
    } else {
      var index = playedGames.indexOf(gameName);
      playedGames.splice(index, 1);
      playedGames.unshift(gameName);
    }
    if (playedGames.length > 50) playedGames.pop();
    
    currentUser.playedGames = playedGames;
    currentUser.stats.gamesPlayed = playedGames.length;
    updateUserInStorage(currentUser);
  }
  
  // Update UI
  updateHeaderCoins();
  
  // Update game card if visible
  var gameCard = document.querySelector('.game[data-game-name="' + CSS.escape(gameName) + '"]');
  if (gameCard) {
    var statsRow = gameCard.querySelector('.game-stats-row');
    if (statsRow) {
      var playCountSpan = statsRow.querySelector('span:first-child');
      var earningsSpan = statsRow.querySelector('span:nth-child(2)');
      if (playCountSpan) playCountSpan.innerHTML = '🎮 ' + window.gamePlayCounts[gameName];
      if (earningsSpan) earningsSpan.innerHTML = '🪙 ' + Math.floor(window.gameEarnings[gameName] * 100) / 100;
    }
  }
  
  console.log('🎮 Played: ' + gameName + ' | +' + earned.toFixed(2) + '🪙 (' + multiplier + 'x multiplier)');
  return earned;
}

function getActiveCoinMultiplier() {
  var equippedPet = localStorage.getItem('equippedPet');
  var petMultipliers = {
    'chinchilla': 1.0,
    'dragon': 1.5,
    'cat': 1.2,
    'dog': 1.2,
    'owl': 1.3,
    'fox': 1.4
  };
  return petMultipliers[equippedPet] || 1.0;
}

function loadUserFavorites() {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  var favorites = currentUser.favorites || [];
  localStorage.setItem("favourites", JSON.stringify(favorites));
  
  if (typeof handleSearchInput === 'function') {
    handleSearchInput();
  }
}

function updateHeaderCoins() {
  var currentUser = getCurrentUser();
  var coinEl = document.getElementById('headerCoinAmount');
  if (coinEl && currentUser) {
    coinEl.textContent = Math.floor((currentUser.coins || 0) * 100) / 100;
  }
}

// ===== ACHIEVEMENT TRIGGERS =====
function trackGamePlayCount(gameName) {
  window.gamePlayCounts[gameName] = (window.gamePlayCounts[gameName] || 0) + 1;
  localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts));
  
  if (window.gamePlayCounts[gameName] >= 50) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(59);
  }
  if (window.gamePlayCounts[gameName] >= 100) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(60);
  }
}

function trackThemeChange() {
  var themeChangeCount = parseInt(localStorage.getItem('themeChangeCount') || '0');
  themeChangeCount++;
  localStorage.setItem('themeChangeCount', themeChangeCount);
  if (themeChangeCount >= 10) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(56);
  }
}

var idleAchievementGranted = false;

function startIdleTracking() {
  if (idleAchievementGranted) return;
  
  var lastActivity = Date.now();
  
  function resetIdleTimer() {
    lastActivity = Date.now();
  }
  
  function checkIdle() {
    if (!idleAchievementGranted) {
      var idleTime = (Date.now() - lastActivity) / 1000 / 60;
      if (idleTime >= 60) {
        if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(55);
        idleAchievementGranted = true;
      }
    }
  }
  
  document.addEventListener('mousemove', resetIdleTimer);
  document.addEventListener('keydown', resetIdleTimer);
  document.addEventListener('click', resetIdleTimer);
  setInterval(checkIdle, 60000);
}

var FOOD_GAMES = ['burger', 'pizza', 'taco', 'sushi', 'cake', 'cookie', 'food', 'chef', 'restaurant', 'cooking', 'baking', 'donut', 'ice cream', 'candy', 'chocolate'];

function isFoodGame(gameName) {
  var lowerName = gameName.toLowerCase();
  for (var i = 0; i < FOOD_GAMES.length; i++) {
    if (lowerName.indexOf(FOOD_GAMES[i]) !== -1) return true;
  }
  return false;
}

var SECRET_NAMES = [':)', 'creamypeanut', 'bloxy', 'abcatlmfao'];

function checkSecretNames(searchTerm) {
  var searchLower = searchTerm.toLowerCase();
  var foundCount = 0;
  for (var i = 0; i < SECRET_NAMES.length; i++) {
    if (searchLower.indexOf(SECRET_NAMES[i].toLowerCase()) !== -1) {
      foundCount++;
    }
  }
  if (foundCount >= SECRET_NAMES.length) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(53);
  }
}

var pageLoadTime = Date.now();
window.addEventListener('beforeunload', function() {
  var timeOnPage = (Date.now() - pageLoadTime) / 1000;
  if (timeOnPage <= 10) {
    localStorage.setItem('pendingAltF4', 'true');
  }
});

function checkAltF4() {
  if (localStorage.getItem('pendingAltF4') === 'true') {
    localStorage.removeItem('pendingAltF4');
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(54);
  }
}

function checkOGFanter() {
  var currentUser = getCurrentUser();
  if (currentUser && currentUser.createdAt) {
    var joinDate = new Date(currentUser.createdAt);
    var cutoffDate = new Date('2025-04-01');
    if (joinDate >= cutoffDate) {
      if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(58);
    }
  }
}

function checkLoyalCustomer() {
  if (!window.gamesData) return;
  var ratedGames = 0;
  for (var key in userVotes) {
    ratedGames++;
  }
  if (ratedGames >= window.gamesData.length) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(62);
  }
}

function checkTotalPlayTime() {
  var sessionStart = localStorage.getItem('sessionStart');
  if (sessionStart) {
    var totalPausedTime = parseInt(localStorage.getItem('totalPausedTime') || '0');
    var activeTime = (Date.now() - parseInt(sessionStart) - totalPausedTime) / 1000 / 60 / 60;
    if (activeTime >= 50) {
      if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(61);
    }
  }
}

// ===== ACHIEVEMENT UNLOCK WITH COIN REWARDS =====
function checkAndUnlockAchievement(achievementId) {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  var achievements = JSON.parse(localStorage.getItem('fanter_achievements') || '{}');
  if (achievements[achievementId]) return;
  
  achievements[achievementId] = true;
  localStorage.setItem('fanter_achievements', JSON.stringify(achievements));
  
  var coinReward = 0;
  if (achievementId <= 10) coinReward = 3;
  else if (achievementId <= 20) coinReward = 5;
  else if (achievementId <= 30) coinReward = 10;
  else if (achievementId <= 40) coinReward = 17.5;
  else if (achievementId <= 50) coinReward = 25;
  else coinReward = 50;
  
  if (coinReward > 0) {
    currentUser.coins = (currentUser.coins || 0) + coinReward;
    updateUserInStorage(currentUser);
  }
  
  currentUser.achievements = achievements;
  updateUserInStorage(currentUser);
  
  var achievementNames = {
    53: "The Chosen One", 54: "Alt+F4", 55: "Mentally Insane", 56: "Indecisive",
    57: "Big Back", 58: "OG Fanter", 59: "Addicted", 60: "Committed",
    61: "Top 1 Unemployed", 62: "Loyal Customer", 63: "System Failure"
  };
  
  var achievementIcons = {
    53: "👑", 54: "💀", 55: "🤪", 56: "🎨", 57: "🍔", 58: "🦖",
    59: "🎮", 60: "💪", 61: "🛋️", 62: "⭐", 63: "💻"
  };
  
  showAchievementToastNotification(achievementNames[achievementId] || "Achievement Unlocked!", achievementIcons[achievementId] || "🏆", coinReward);
  console.log('🏆 Achievement Unlocked: ' + (achievementNames[achievementId] || "Unknown") + ' +' + coinReward + '🪙');
  
  if (typeof updateHeaderCoins === 'function') updateHeaderCoins();
}

function showAchievementToastNotification(name, icon, coins) {
  var toast = document.querySelector('.achievement-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'achievement-toast';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = '<span class="achievement-icon">' + icon + '</span><div class="achievement-content"><div class="achievement-title">ACHIEVEMENT UNLOCKED!</div><div class="achievement-name">' + name + '</div><div class="achievement-reward" style="color:#ffcc00; font-size:11px; margin-top:4px;">+' + coins + ' 🪙</div></div>';
  
  toast.classList.add('show');
  setTimeout(function() {
    toast.classList.remove('show');
  }, 4000);
}

function triggerPageCrash() {
  if (typeof checkAndUnlockAchievement === 'function') {
    checkAndUnlockAchievement(63);
  }
  
  var crashOverlay = document.createElement('div');
  crashOverlay.id = 'crash-overlay';
  crashOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000088;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"Courier New",monospace;color:white;text-align:center;animation:fadeIn 0.3s ease;';
  
  crashOverlay.innerHTML = '<div style="background:white;color:black;padding:20px;border:2px solid silver;max-width:500px;margin:20px;"><pre style="font-size:20px;margin:0;">😵</pre><h1 style="font-size:24px;margin:10px 0;">:(</h1><p style="font-size:16px;">Your Fanter ran into a problem and needs to restart.</p><p style="font-size:14px;margin-top:20px;">*** STOP: 0x000000F4</p><div style="margin-top:30px;"><div style="display:inline-block;width:20px;height:20px;background:white;margin:0 5px;animation:blink 1s step-end infinite;"></div><span>Restarting in <span id="crash-countdown">5</span> seconds...</span></div></div>';
  
  document.body.appendChild(crashOverlay);
  
  if (!document.querySelector('#crash-styles')) {
    var style = document.createElement('style');
    style.id = 'crash-styles';
    style.textContent = '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }';
    document.head.appendChild(style);
  }
  
  var seconds = 5;
  var countdownEl = document.getElementById('crash-countdown');
  var interval = setInterval(function() {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      window.location.reload();
    }
  }, 1000);
}

function initAchievementTriggers() {
  checkAltF4();
  checkOGFanter();
  checkTotalPlayTime();
  startIdleTracking();
  setInterval(checkTotalPlayTime, 60000);
  setInterval(checkLoyalCustomer, 30000);
}

initAchievementTriggers();

window.crashFanter = function() {
  triggerPageCrash();
};

console.log('💀 Type "crashFanter()" for a surprise...');

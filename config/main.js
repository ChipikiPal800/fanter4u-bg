// these change the name of the site (at the top
var sitename = "fanter beta."; // Change this to change the name of your website.
var subtext = "v0.2, games not added, styling incomplete. :3"; // set the subtext
// more settings in main.css
// END CONFIG
// DO NOT MODIFY IF YOU DO NOT KNOW WHAT YOUR DOING!
var serverUrl1 = "https://gms.parcoil.com";
var currentPageTitle = document.title;
document.title = `${currentPageTitle} | ${sitename}`;
let gamesData = [];

function getFavourites() {
  return JSON.parse(localStorage.getItem("favourites") || "[]");
}

function toggleFavourite(gameName) {
  let favs = getFavourites();
  if (favs.includes(gameName)) {
    favs = favs.filter(f => f !== gameName);
  } else {
    favs.push(gameName);
  }
  localStorage.setItem("favourites", JSON.stringify(favs));
}

function displayFilteredGames(filteredGames) {
  const gamesContainer = document.getElementById("gamesContainer");
  gamesContainer.innerHTML = "";
  filteredGames.forEach((game) => {
    const gameDiv = document.createElement("div");
    gameDiv.classList.add("game");
    const gameImage = document.createElement("img");
    // Handle external vs local image URLs
    let imageSrc;
    if (game.image.startsWith('http')) {
      imageSrc = game.image;
    } else {
      imageSrc = `${serverUrl1}/${game.url}/${game.image}`;
    }
    gameImage.src = imageSrc;
    gameImage.alt = game.name;
    // Handle external vs local game URLs
    gameImage.onclick = () => {
      if (game.url.startsWith('http')) {
        window.location.href = game.url;
      } else {
        window.location.href = `play.html?gameurl=${game.url}/`;
      }
    };
    const gameName = document.createElement("p");
    gameName.textContent = game.name;
    const favBtn = document.createElement("button");
    favBtn.classList.add("fav-btn");
    favBtn.textContent = getFavourites().includes(game.name) ? "★" : "☆";
    favBtn.title = "favourite";
    favBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavourite(game.name);
      favBtn.textContent = getFavourites().includes(game.name) ? "★" : "☆";
    };
    gameDiv.appendChild(gameImage);
    gameDiv.appendChild(gameName);
    gameDiv.appendChild(favBtn);
    gamesContainer.appendChild(gameDiv);
  });
}

function handleSearchInput() {
  const searchInputValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  let filteredGames;
  const favFilterOn = localStorage.getItem("favFilter") === "true";
  if (favFilterOn) {
    const favs = getFavourites();
    filteredGames = gamesData.filter((game) =>
      favs.includes(game.name) &&
      game.name.toLowerCase().includes(searchInputValue)
    );
  } else {
    filteredGames = gamesData.filter((game) =>
      game.name.toLowerCase().includes(searchInputValue)
    );
  }
  displayFilteredGames(filteredGames);
}

fetch("./config/games.json")
  .then((response) => response.json())
  .then((data) => {
    gamesData = data;
    displayFilteredGames(data);
    if (localStorage.getItem("favFilter") === "true") {
      handleSearchInput();
    }
  })
  .catch((error) => console.error("Error fetching games:", error));

document
  .getElementById("searchInput")
  .addEventListener("input", handleSearchInput);
document.getElementById("title").innerHTML = `${sitename}`;
document.getElementById("subtitle").innerHTML = `${subtext}`;

const API_KEY = 'effdd5ff3b144faf9f7878e6025c027d';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// function to remove html tags froma string
function stripHtmlTags(input) {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.body.textContent || "";
}

// function to fetch games for a given year and month from API

function fetchGamesForMonth(year, month) {
    // Updating display style of navigation buttons based on the current date
    document.getElementById('prevMonth').style.display = (month <= new Date().getMonth() - 1 && year === new Date().getFullYear()) ? 'none' : 'block';
    document.getElementById('nextMonth').style.display = (month >= new Date().getMonth() + 1 && year === new Date().getFullYear()) ? 'none' : 'block';

    // Performing the Api request to fetch games
    fetch(`https://api.rawg.io/api/games?dates=${year}-${month + 1}-01,${year}-${month + 1}-30&key=${API_KEY}`).then(response => response.json()).then(data => {
        // Filtering games to only include those with background images.
        const games = data.results.filter(game => game.background_image);

        // Calculating the number of days in the given month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let htmlContent = '';
        for (let i = 1; i <= daysInMonth; i++) {
            let gamesForDay = games.filter(game => new Date(game.released).getDate() === i);

            htmlContent += `

            <div class="date">
                <strong>${i}</strong>
                ${gamesForDay.map(game => `
                    <div class="game" data-id="${game.id}">
                        <img src="${game.background_image}" alt="${game.name} Thumbnail">
                        <div class="game-details">${game.name}</div>
                    </div>
                `).join('')}
            </div>
            `;
        }

        document.getElementById('calendar').innerHTML = htmlContent;
        document.getElementById('currentMonthYear').innerText = `${monthNames[month]} ${year}`;


        // add click event listener for each game to show model
        document.querySelectorAll('.game').forEach(gameEl => {
            gameEl.addEventListener('click', () => {
                const gameId = gameEl.getAttribute('data-id');

                // fetch game details
                fetch(`https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`).then(response => response.json()).then(gameDetails => {
                    document.getElementById('gameTitle').innerText = gameDetails.name;
                    document.getElementById('gameImage').src = gameDetails.background_image;


                    const descriptionElement = document.querySelector('.modal-content p strong');
                    descriptionElement.nextSibling.nodeValue = "" + stripHtmlTags(gameDetails.description) || "No description available";


                    document.getElementById('gameReleaseDate').innerText = gameDetails.released;
                    document.getElementById('gameRating').innerText = gameDetails.rating;
                    document.getElementById('gamePlatforms').innerText = gameDetails.platforms.map(platform => platform.platform.name).join(', ');
                    document.getElementById('gameModal').style.display = 'block';

                })

            })
        })

    })

}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    fetchGamesForMonth(currentYear, currentMonth);
});


document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    fetchGamesForMonth(currentYear, currentMonth);
});

// close model function
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('gameModel').style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('gameModel')) {
        document.getElementById('gameModel').style.display = 'none';
    }
});

fetchGamesForMonth(currentYear, currentMonth);

        
        
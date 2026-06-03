const loginContainer = document.getElementById("login-container");
const mainApp = document.getElementById("main-app");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const loginBtn = document.getElementById("login-btn");
const loginErrorMsg = document.getElementById("login-error-msg");
const logoutBtn = document.getElementById("logout-btn");

const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const toggleText = document.getElementById("toggle-text");
const toggleAuthLink = document.getElementById("toggle-auth-link");

let authMode = "login";
function switchToLoginMode() {
    authMode = "login";
    authTitle.innerText = "Welcome Back";
    authSubtitle.innerText = "Access your personal movie portal";
    loginBtn.innerText = "Secure Login";
    toggleText.innerText = "Don't have an account?";
    toggleAuthLink.innerText = "Sign Up";
    confirmPasswordInput.classList.add("hidden-layout");
    confirmPasswordInput.required = false;
    loginForm.reset();
}

function switchToSignupMode() {
    authMode = "signup";
    authTitle.innerText = "Create Account";
    authSubtitle.innerText = "Join the personal movie portal";
    loginBtn.innerText = "Register Account";
    toggleText.innerText = "Already have an account?";
    toggleAuthLink.innerText = "Log In";
    confirmPasswordInput.classList.remove("hidden-layout");
    confirmPasswordInput.required = true;
    loginForm.reset();
}

toggleAuthLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginErrorMsg.classList.add("hidden-msg");
    if (authMode === "login") {
        switchToSignupMode();
    } else {
        switchToLoginMode();
    }
});

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const user = usernameInput.value.trim();
    const pass = passwordInput.value;
    
    
    let usersDb = JSON.parse(localStorage.getItem("movieAppUsers")) || [];

    if (authMode === "signup") {
        const confirmPass = confirmPasswordInput.value;
        if (pass !== confirmPass) {
            loginErrorMsg.innerText = "Passwords do not match!";
            loginErrorMsg.classList.remove("hidden-msg");
            return;
        }

        const userExists = usersDb.some(u => u.username.toLowerCase() === user.toLowerCase()) || user.toLowerCase() === "admin";
        if (userExists) {
            loginErrorMsg.innerText = "Username is already taken!";
            loginErrorMsg.classList.remove("hidden-msg");
            return;
        }


        usersDb.push({ username: user, password: pass });
        localStorage.setItem("movieAppUsers", JSON.stringify(usersDb));

        alert("Registration successful! Now try logging in with your new account.");
       
        switchToLoginMode();

    } else {

        const isMasterAdmin = (user === "your_new_username" && pass === "your_secret_password");
        const validUser = usersDb.find(u => u.username === user && u.password === pass);

        if (isMasterAdmin || validUser) {
            loginContainer.classList.add("hidden-layout");
            mainApp.classList.remove("hidden-layout");
            loginErrorMsg.classList.add("hidden-msg");
            sessionStorage.setItem("isLoggedIn", "true");
        } else {
            loginErrorMsg.innerText = "Invalid username or password. please try again.";
            loginErrorMsg.classList.remove("hidden-msg");
        }
    }
});


if (sessionStorage.getItem("isLoggedIn") === "true") {
    loginContainer.classList.add("hidden-layout");
    mainApp.classList.remove("hidden-layout");
}

logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("isLoggedIn");
    window.location.reload();
});


const searchBtn = document.getElementById("search-btn");
const movieInput = document.getElementById("movie-input");
const moviesGrid = document.getElementById("movies-grid"); 

if (searchBtn && movieInput && moviesGrid) {
    searchBtn.addEventListener("click", () => {
        const movieName = movieInput.value.trim();     

        if (!movieName) {
            alert("Please enter a movie title.");
            return;
        }

        const url = `/api/movie?title=${encodeURIComponent(movieName)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Server status ${response.status}`);
                return response.json();
            })
            .then(data => {
                moviesGrid.innerHTML = "";

                if (data.Response === "True") {
                    const hasPoster = data.Poster && data.Poster !== "N/A";
                    const posterHTML = hasPoster 
                        ? `<img src="${data.Poster}" alt="${data.Title}">`
                        : `<div class="no-poster-box">🎬 No Image Available</div>`;
                    
                    moviesGrid.innerHTML = `
                        <div class="movie-card">
                            ${posterHTML}
                            <h2>${data.Title} (${data.Year})</h2>
                            <p class="genre"><strong>Genre:</strong> ${data.Genre}</p>
                            <p class="plot"><strong>Plot:</strong> ${data.Plot}</p>
                            <p class="rating"><strong>Rating:</strong> ⭐ ${data.imdbRating}</p>
                        </div>
                    `;
                } else {
                    moviesGrid.innerHTML = `<p class="no-results">No movies found for "${movieName}".</p>`;
                }
            })
            .catch(error => {
                console.error("Fetch Error:", error);
                moviesGrid.innerHTML = `<p class="no-results">Error loading movie data.</p>`;
            });
    });

    movieInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchBtn.click();
    });
}

const trendingTitles = ["Inception", "Interstellar", "The Dark Knight", "Avatar", "Gladiator"];
const scifiTitles = ["The Matrix", "Blade Runner 2049", "Dune", "Arrival", "Star Wars"];

function loadNetflixShowcase() {
    const trendingRow = document.getElementById("trending-row");
    const scifiRow = document.getElementById("scifi-row");
    const showcase = document.getElementById("netflix-showcase");
    
    if (!trendingRow || !scifiRow) return;

    if (showcase) showcase.style.display = "flex";
    
    trendingRow.innerHTML = "";
    scifiRow.innerHTML = "";
    trendingTitles.forEach(title => {
        fetch(`/api/movie?title=${encodeURIComponent(title)}`)
            .then(res => res.json())
            .then(data => {
                if (data.Response === "True") {
                    trendingRow.innerHTML += createShowcaseCard(data);
                }
            });
    });

   
    scifiTitles.forEach(title => {
        fetch(`/api/movie?title=${encodeURIComponent(title)}`)
            .then(res => res.json())
            .then(data => {
                if (data.Response === "True") {
                    scifiRow.innerHTML += createShowcaseCard(data);
                }
            });
    });
}

function createShowcaseCard(data) {
    const hasPoster = data.Poster && data.Poster !== "N/A";
    const posterImg = hasPoster ? data.Poster : 'https://via.placeholder.com/200x280?text=No+Poster';
    const escapedTitle= data.Title.replace(/'/g, "\\'");
    return `
        <div class="showcase-card" onclick="document.getElementById('movie-input').value='${data.Title.replace(/'/g, "\\'")}'; document.getElementById('search-btn').click();">
            <img src="${posterImg}" alt="${data.Title}">
            <div class="showcase-info">
                <h4>${data.Title}</h4>
                <p>⭐ ${data.imdbRating || 'N/A'}</p>
            </div>
        </div>
    `;
}

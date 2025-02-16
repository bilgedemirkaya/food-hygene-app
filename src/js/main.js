document.addEventListener("DOMContentLoaded", () => {
  loadPage("home");

  const tabs = document.querySelectorAll(".tab-link");
  const tabContent = document.getElementById("tab-content");
  let pageNumber = 1;
  const pageSize = 5

  async function loadPage(page) {
    try {
      const response = await fetch(`src/pages/${page}.html`);
      if (!response.ok) throw new Error("Page not found");
      tabContent.innerHTML = await response.text();

      if (page === "home") {
        setupSearchForm();
      }
    } catch (error) {
      console.error("Error loading page:", error);
      tabContent.innerHTML = `<h1 class='title'>404 - Page Not Found</h1><p>The content you requested does not exist.</p>`;
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabId = tab.getAttribute("data-tab");

      tabs.forEach(t => t.classList.remove("is-active"));

      tab.classList.add("is-active");

      loadPage(tabId);
    });
  });

  function setupSearchForm() {
    const form = document.getElementById("search-form");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      

      fetchEntities();
    });
  }

  async function fetchEntities() {
    const errorMessage = document.getElementById("error-message");

    const localAuthority = document.getElementById("local-authority-input").value.trim();
    const restaurantName = document.getElementById("restaurant-name-input").value.trim();


    errorMessage.classList.add("hidden");
    errorMessage.textContent = "There was an error. Please try again.";

    if (!localAuthority) {
      errorMessage.textContent = "Please provide a valid Local Authority.";
      errorMessage.classList.remove("hidden");
      return;
    }

    const apiUrl = CONFIG.API_URL + `?name=${restaurantName}&address=${localAuthority}&pageSize=${pageSize}&pageNumber=${pageNumber}`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "x-api-version": "2",
          "accept": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.establishments && data.establishments.length > 0) {
        renderResults(data.establishments);
      } else {
        errorMessage.textContent = "No results found. Try a different query.";
        errorMessage.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      errorMessage.textContent = `Error fetching data: ${error.message}`;
      errorMessage.classList.remove("hidden");
    }
  }

  function renderResults(establishments) {
    const resultsContainer = document.getElementById("results-container");

    const title_container = document.createElement("div");
    title_container.classList.add("title-container");
    const title = document.createElement("h2");
    title.textContent = "Results";
    title.classList.add("title");

    title_container.appendChild(title);
    resultsContainer.appendChild(title_container);

    const cards = document.createElement("div");
    cards.className = "cards";
    establishments.forEach((est) => {
      const card = document.createElement("div");
      const header = document.createElement("div");
      header.className = "card-header";

      const name = document.createElement("h3");
      name.textContent = est.BusinessName;
      name.classList.add("is-size-3")

      const rating = document.createElement("p");
      rating.className = "rating";
      const ratingValue = parseInt(est.RatingValue) || 0;
      rating.appendChild(renderStars(ratingValue));

      header.appendChild(name);
      header.appendChild(rating);

      const address = document.createElement("p");
      address.textContent = `Address: ${est.AddressLine1 || ""}, ${est.PostCode || ""}`;

      card.classList.add("card");
      card.appendChild(header);
      card.appendChild(address);

      cards.appendChild(card);
    });

    resultsContainer.appendChild(cards);

    const loadMoreButton = document.createElement("button");
    loadMoreButton.className = "button is-success is-outlined hidden is-fullwidth";

    if (establishments.length < pageSize) {
      loadMoreButton.style.display = "none";
    }
    else {
      loadMoreButton.style.display = "block";
    }

    loadMoreButton.textContent = "Load More";
    loadMoreButton.addEventListener("click", () => {
      pageNumber++;
      fetchEntities();
    });

    resultsContainer.appendChild(loadMoreButton);
  }

  function renderStars(rating) {
    const starContainer = document.createElement("div");
    starContainer.className = "stars";

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.textContent = i <= rating ? "★" : "☆";
      star.classList.add("star");
      starContainer.appendChild(star);
    }

    return starContainer;
  }
});

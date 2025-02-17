document.addEventListener("DOMContentLoaded", async () => {
  let searchFilters = {
    localAuthority: "",
    restaurantName: "",
    pageSize: 5,
    pageNumber: 1,
    sortOption: "",
  };

  let sortOptions = {};

  setupTabs();
  loadPage("home");

  function setupTabs() {
    document.querySelectorAll(".tab-link").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab-link").forEach(t => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        loadPage(tab.getAttribute("data-tab"));
      });
    });
  }

  function loadPage(page) {
    fetch(`src/pages/${page}.html`)
      .then(response => {
        if (!response.ok) throw new Error("Page not found");
        return response.text();
      })
      .then(html => {
        document.getElementById("tab-content").innerHTML = html;
        if (page === "home") {
          setupSearchForm();
          fetchSortingOptions();
        };
      })
      .catch(error => {
        console.error("Error loading page:", error);
        document.getElementById("tab-content").innerHTML =
          `<h1 class='title'>404 - Page Not Found</h1><p>The content you requested does not exist.</p>`;
      });
  }

  function setupSearchForm() {
    const form = document.getElementById("search-form");
    const resultsContainer = document.getElementById("results-container");

    form.addEventListener("submit", (e) => {
      // Get search filters from form inputs
      searchFilters.localAuthority = document.getElementById("local-authority-input").value.trim();
      searchFilters.restaurantName = document.getElementById("restaurant-name-input").value.trim();

      e.preventDefault();
      resultsContainer.innerHTML = "";
      searchFilters.pageNumber = 1;
      fetchEntities(false);

      form.reset();
    });
  }

  function setupSortDropdown() {
    let existingDropdown = document.getElementById("sort-option");

    if (existingDropdown) {
      return existingDropdown.parentElement;
  }
    const selectWrapper = createElement("div", { className: "select rounded" });
    const select = createElement("select", {
        id: "sort-option",
        className: "select",
        onchange: (e) => {
            searchFilters.sortOption = e.target.value;
            let cardsContainer = document.getElementById("cards-container");
            cardsContainer.innerHTML = "";
            fetchEntities(false);
        }
    });


    const defaultOption = createElement("option", { value: "relevance", textContent: "Sort by" });
    select.appendChild(defaultOption);

    sortOptions.forEach(option => {
        const opt = createElement("option", { value: option.sortOptionKey, textContent: option.sortOptionName });

        if (option.sortOptionKey === searchFilters.sortOption) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    selectWrapper.appendChild(select);


    return selectWrapper;
  }

  async function fetchEntities(loadMore = false) {
    const resultsContainer = document.getElementById("results-container");
    const ErrMessage = createElement("p", { className: "has-text-centered" });

    const apiUrl = `${CONFIG.API_URL}/establishments?name=${searchFilters.restaurantName}&address=${searchFilters.localAuthority}&pageSize=${searchFilters.pageSize}&pageNumber=${searchFilters.pageNumber}&sortOptionKey=${searchFilters.sortOption}`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "x-api-version": "2", "accept": "application/json" }
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      if (data.establishments?.length) {
        renderResults(data.establishments, loadMore);
      } else {
        ErrMessage.textContent = `No results found for ${searchFilters.restaurantName} in ${searchFilters.localAuthority}`;
        resultsContainer.appendChild(ErrMessage);
      }
    } catch (error) {
      ErrMessage.textContent = `Error fetching data: ${error.message}`;
      resultsContainer.appendChild(ErrMessage);
    }
  }

  async function renderResults(establishments, loadMore) {
    const resultsContainer = document.getElementById("results-container");
    let cardsContainer = document.getElementById("cards-container");

    if (!loadMore) {
        resultsContainer.innerHTML = "";
        searchFilters.pageNumber = 1;

        const titleContainer = createElement("div", { className: "title-container" });
        titleContainer.appendChild(createElement("h2", { className: "title", textContent: 'Results' }));
        resultsContainer.appendChild(titleContainer);
    }

    if (!document.getElementById("sort-option")) {
      const sortDropdown = setupSortDropdown();
      resultsContainer.appendChild(sortDropdown);
  }

    if (!cardsContainer) {
        cardsContainer = createElement("div", { id: "cards-container", className: "cards" });
    }

    establishments.forEach(est => {
        const card = createElement("div", { className: "card" });
        const header = createElement("div", { className: "card-header" });

        const name = createElement("h3", { className: "is-size-3", textContent: est.BusinessName });
        const rating = createElement("p", { className: "rating" });
        rating.appendChild(renderStars(parseInt(est.RatingValue) || 0));

        header.append(name, rating);
        card.append(header, createElement("p", { textContent: `Address: ${est.AddressLine1 || ""}, ${est.PostCode || ""}` }));
        cardsContainer.appendChild(card);
    });

    resultsContainer.appendChild(cardsContainer);

    updateLoadMoreButton(establishments.length >= searchFilters.pageSize);
}


  function updateLoadMoreButton(hasMore) {
    const existingButton = document.getElementById("load-more-btn");

    // Remove existing button to create a new one
    if (existingButton) existingButton.remove();

    if (hasMore) {
      const loadMoreButton = createElement("button", {
        id: "load-more-btn",
        className: "button is-success is-outlined is-fullwidth",
        textContent: "Load More",
        onclick: loadMore,
      });

      document.getElementById("results-container").appendChild(loadMoreButton);
    }
  }

  function loadMore() {
    searchFilters.pageNumber++;
    fetchEntities(true);
  }

  /** Render rating as star icons */
  function renderStars(rating) {
    const starContainer = createElement("div", { className: "stars" });
    for (let i = 1; i <= 5; i++) {
      starContainer.appendChild(createElement("span", {
        className: "star",
        textContent: i <= rating ? "★" : "☆"
      }));
    }
    return starContainer;
  }

  async function fetchSortingOptions() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/sortoptions`, {
            method: "GET",
            headers: { "x-api-version": "2", "accept": "application/json" }
        });

        if (!response.ok) throw new Error(`Failed to fetch sorting options: ${response.status}`);

        const data = await response.json();

        if (data.sortOptions) {
          sortOptions = data.sortOptions;
        }
    } catch (error) {
        console.error("Error fetching sort options:", error);
    }
}


function createElement(tag, props = {}) {
  const element = document.createElement(tag);

  Object.keys(props).forEach(key => {
    if (key === "onclick") {
      element.addEventListener("click", props[key]);
    } else {
      element[key] = props[key];
    }
  });
  return element;
}

});

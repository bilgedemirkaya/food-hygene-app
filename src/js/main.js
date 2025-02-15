document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("search-form");
    const errorMessage = document.getElementById("error-message");
    const resultsContainer = document.getElementById("results-container");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const localAuthority = document.getElementById("local-authority-input").value.trim();
      const restaurantName = document.getElementById("restaurant-name-input").value.trim();

      resultsContainer.innerHTML = "";
      errorMessage.classList.add("hidden");
      errorMessage.textContent = "";

      // Validate input (example)
      if (!localAuthority) {
        errorMessage.textContent = "Please provide a valid Local Authority.";
        errorMessage.classList.remove("hidden");
        return;
      }

      // Construct the endpoint based on user input
      // For demonstration, we’ll pretend there's an endpoint URL to get data
      // e.g. "https://api.ratings.food.gov.uk/establishments?localAuthority=xxx&name=xxx"
      // The actual Food Standards Agency endpoint(s) might differ
      const apiUrl = `https://api.ratings.food.gov.uk/Establishments?localAuthorityName=${encodeURIComponent(
        localAuthority
      )}&businessName=${encodeURIComponent(restaurantName)}`;

      try {
        // Make the request
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "x-api-version": "2", // The Food Standards Agency might need specific headers
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // Parse the JSON
        const data = await response.json();

        // Extract relevant details
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
    });

    /**
     * Render search results
     * @param {Array} establishments
     */
    function renderResults(establishments) {
      // Example structure:
      // <div class="card">
      //   <h3>Business Name</h3>
      //   <p>Rating: 5</p>
      //   <p>Address: 123 Some Street</p>
      // </div>

      establishments.forEach((est) => {
        const card = document.createElement("div");
        card.className = "card";

        // Create elements
        const name = document.createElement("h3");
        name.textContent = est.BusinessName;

        const rating = document.createElement("p");
        rating.textContent = `Rating: ${est.RatingValue}`;

        const address = document.createElement("p");
        address.textContent = `Address: ${est.AddressLine1 || ""}, ${est.PostCode || ""}`;

        // Append to card
        card.appendChild(name);
        card.appendChild(rating);
        card.appendChild(address);

        // Append card to container
        resultsContainer.appendChild(card);
      });
    }
  });

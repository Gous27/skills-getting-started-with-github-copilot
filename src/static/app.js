document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Create participants section
        const participants = Array.isArray(details.participants) ? details.participants : [];

        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";

        const title = document.createElement("h5");
        title.textContent = "Participants";
        participantsDiv.appendChild(title);

        if (participants.length === 0) {
          const empty = document.createElement("div");
          empty.className = "empty";
          empty.textContent = "No one signed up yet — be the first!";
          participantsDiv.appendChild(empty);
        } else {
          const ul = document.createElement("ul");

          // helper to derive display name and initials
          function getDisplay(part) {
            if (!part) return { name: "Unknown", initials: "?" };
            if (typeof part === "string") {
              const parts = part.split("@")[0].split(/[ ._-]+/);
              const initials = parts.map(p => p[0]?.toUpperCase() || "").slice(0,2).join("");
              return { name: part, initials: initials || "?" };
            }
            const name = part.name || part.email || JSON.stringify(part);
            const parts = (name + "").split(/[ ._-]+/);
            const initials = parts.map(p => p[0]?.toUpperCase() || "").slice(0,2).join("");
            return { name, initials: initials || "?" };
          }

          participants.forEach((p) => {
            const { name, initials } = getDisplay(p);

            const li = document.createElement("li");

            const avatar = document.createElement("div");
            avatar.className = "avatar";
            // if p.avatar is a URL, render image, else show initials
            if (p && typeof p === "object" && p.avatar) {
              const img = document.createElement("img");
              img.src = p.avatar;
              img.alt = name;
              avatar.appendChild(img);
            } else {
              avatar.textContent = initials;
            }
            li.appendChild(avatar);

            const nameDiv = document.createElement("div");
            nameDiv.className = "name";
            nameDiv.textContent = name;
            li.appendChild(nameDiv);

            // optional meta (status/email)
            const metaText = (p && typeof p === "object" && (p.status || p.email)) || "";
            if (metaText) {
              const meta = document.createElement("div");
              meta.className = "meta";
              meta.textContent = metaText;
              li.appendChild(meta);
            }

            ul.appendChild(li);
          });

          participantsDiv.appendChild(ul);
        }

        activityCard.appendChild(participantsDiv);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

function hide(group_div) {
  // Hide most of the listing, only keep its title.
  group_div.style.height = "45px";
  group_div.childNodes[1].style.display = "none";
  group_div.childNodes[2].style.height = "45px";
  // group_div.childNodes[2].childNodes[0].childNodes[0].childNodes[0].style.display =
  //   "none";
  group_div.childNodes[2].childNodes[1].style.display = "none";
  group_div.childNodes[2].childNodes[2].style.display = "none";
  group_div.childNodes[2].childNodes[3].style.display = "none";
  group_div.childNodes[2].childNodes[4].style.display = "none";
  // Some listings have an additional div (if they have the "Rare find" badge).
  try {
    group_div.childNodes[2].childNodes[5].style.display = "none";
  } catch {}

  // Make the button read "Show".
  group_div.querySelector(".hide-button").innerHTML =
    '<span style="position: relative !important">Show</span>';
}

function show(group_div) {
  // Reset everything to show the entire listing.
  group_div.style.height = null;
  group_div.childNodes[1].style.display = null;
  group_div.childNodes[2].style.height = null;
  // group_div.childNodes[2].childNodes[0].childNodes[0].childNodes[0].style.display =
  //   null;
  group_div.childNodes[2].childNodes[1].style.display = null;
  group_div.childNodes[2].childNodes[2].style.display = null;
  group_div.childNodes[2].childNodes[3].style.display = null;
  group_div.childNodes[2].childNodes[4].style.display = null;
  // Some listings have an additional div (if they have the "Rare find" badge).
  try {
    group_div.childNodes[2].childNodes[5].style.display = null;
  } catch {}

  // Make the button read "Hide".
  group_div.querySelector(".hide-button").innerHTML =
    '<span style="position: relative !important">Hide</span>';
}

function main() {
  // The main function.
  // This is run every few seconds in order to process new listings if you
  // switch the page, change the map, etc.
  console.log("[Airbnb Extended] Running...");

  // Retrieve which listings were set to hidden before.
  // Their titles are stored in an array in the extension's synced storage.
  chrome.storage.sync.get({ hiddenListings: [] }, (result) => {
    const toHide = result.hiddenListings;
    console.log(
      "[Airbnb Extended] These listings were hidden previously: " + toHide
    );

    // Find all listings by their meta tags, extract their titles,
    // and iterate through them.
    let metas = document.querySelectorAll('meta[itemprop="name"][content]');
    console.log(
      "[Airbnb Extended] Processing " + metas.length + " listings on page..."
    );
    metas.forEach((meta) => {
      let div = meta.parentNode;

      // Process listing only if it wasn't processed before / doesn't have a hide button.
      if (div.querySelector(".hide-button") == null) {
        const listingTitle = meta.content;
        let group_div = div.querySelector('div[role="group"]');
        console.log("[Airbnb Extended] Listing: " + listingTitle);

        // Find the like button for this listing.
        let like_button = div.querySelector(
          'button[aria-label="Add listing to a list"],button[aria-label="Remove listing from a list"]'
        );

        // Create a hide button.
        const hide_button = document.createElement("button");
        hide_button.innerHTML =
          '<span style="position: relative !important">Hide</span>';
        hide_button.classList.add("hide-button");
        hide_button.style.marginRight = "15px";
        hide_button.style.marginTop = "2px";
        hide_button.style.backgroundColor = "transparent";
        hide_button.style.border = "1px solid #222222";
        hide_button.style.borderRadius = "3px";
        hide_button.style.fontSize = "14px";

        // Add an on click event for the hide button.
        hide_button.onclick = () => {
          if (group_div.style.height === "45px") {
            // Show the listing itself.
            show(group_div);

            // Remove the listing from the stored array of hidden listings.
            // This ensures it doesn't get hidden in future sessions.
            chrome.storage.sync.get({ hiddenListings: [] }, (result) => {
              const oldHiddenListings = result.hiddenListings;
              chrome.storage.sync.set({
                hiddenListings: oldHiddenListings.filter((item) => {
                  return item !== listingTitle;
                }),
              });
            });
          } else {
            // Hide the listing itself.
            hide(group_div);

            // Add the listing from the stored array of hidden listings.
            // This ensures it stays hidden in future sessions.
            chrome.storage.sync.get({ hiddenListings: [] }, (result) => {
              const oldHiddenListings = result.hiddenListings;
              chrome.storage.sync.set({
                hiddenListings: [...oldHiddenListings, listingTitle],
              });
            });
          }
        };

        // Insert the hide button before the like button.
        like_button.parentNode.insertBefore(hide_button, like_button);

        // Hide the listing if it was set to hidden before.
        // Do this after the button was added, so `hide` can change its text to "Show".
        if (toHide.includes(listingTitle)) {
          console.log("[Airbnb Extended] Hiding it (was previously hidden)!");
          hide(group_div);
        }
      }
    });
  });
}

// Run the main function every few seconds.
// This ensures that listings are processed when you switch a page, change the map, etc
// (these events don't trigger a reload!),
setInterval(main, 2000);

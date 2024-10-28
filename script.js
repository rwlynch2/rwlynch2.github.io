document.addEventListener("DOMContentLoaded", function() {
    const projectTitles = document.querySelectorAll(".project-title");

    projectTitles.forEach(title => {
        title.addEventListener("click", function() {
            const details = this.nextElementSibling; // Get the next sibling (details)
            if (details.style.display === "none" || details.style.display === "") {
                details.style.display = "block"; // Show details
            } else {
                details.style.display = "none"; // Hide details
            }
        });
    });
});

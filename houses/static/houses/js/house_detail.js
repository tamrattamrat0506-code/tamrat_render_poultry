document.addEventListener("DOMContentLoaded", () => {
    const thumbnails = document.querySelectorAll(".thumbnail");
    const mainImage = document.getElementById("mainHouseImage");

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener("click", () => {
            mainImage.src = thumbnail.src;
        });
    });

    const wishlistBtn = document.querySelector(".wishlist-btn");
    wishlistBtn?.addEventListener("click", () => {
        alert("Added to wishlist!");
    });

    const contactBtn = document.querySelector(".contact-btn");
    contactBtn?.addEventListener("click", () => {
        alert("Seller contact form will open soon.");
    });
});

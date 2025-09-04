// Update main image from thumbnails
function updateMainImage(thumbnail) {
  const mainImg = document.getElementById("mainVehicleImage");
  mainImg.src = thumbnail.src;
}

// Like vehicle (simulate with alert or AJAX)
function likeVehicle(vehicleId) {
  alert(`Liked vehicle ID: ${vehicleId}`);
  // Add AJAX logic to like the vehicle
}

// Share vehicle (simulate with alert or share API)
function shareVehicle(vehicleId) {
  if (navigator.share) {
    navigator.share({
      title: 'Check out this vehicle',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
}

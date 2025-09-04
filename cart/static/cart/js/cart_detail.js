document.addEventListener('DOMContentLoaded', () => {
  // Confirm removal with a popup
  const removeLinks = document.querySelectorAll('a[href^="/remove/"], a[href^="{% url \'remove_from_cart\' 0 %}".slice(0, 8)]');
  
  removeLinks.forEach(link => {
    link.addEventListener('click', e => {
      const confirmed = confirm('Are you sure you want to remove this item from your cart?');
      if (!confirmed) {
        e.preventDefault();
      }
    });
  });
});

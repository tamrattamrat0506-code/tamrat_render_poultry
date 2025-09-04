document.addEventListener('DOMContentLoaded', function() {
    // Profile picture preview and upload handling
    const profilePicInput = document.querySelector('input[name="profile_picture"]');
    const profilePicPreview = document.getElementById('profile-picture-preview');
    
    if (profilePicInput) {
        profilePicInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    if (profilePicPreview) {
                        profilePicPreview.src = event.target.result;
                    }
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    // Form submission loading state
    const form = document.querySelector('.simple-form');
    if (form) {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('.save-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }
        });
    }
});
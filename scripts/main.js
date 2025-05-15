// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('header nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('header nav a');
    for (const link of navLinks) {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
        });
    }
    
    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    for (const anchor of anchors) {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Form validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            
            // Get form fields
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            // Simple validation
            let isValid = true;
            
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Name is required');
                isValid = false;
            } else {
                removeError(nameInput);
            }
            
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email');
                isValid = false;
            } else {
                removeError(emailInput);
            }
            
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Message is required');
                isValid = false;
            } else {
                removeError(messageInput);
            }
            
            if (isValid) {
                // Simulate form submission with a success message
                contactForm.innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <h3>Message Sent!</h3>
                        <p>Thank you for contacting us. We'll get back to you soon.</p>
                    </div>
                `;
                
                // You would normally submit the form data to a server here
                // For example: fetch('/api/contact', { method: 'POST', body: new FormData(contactForm) })
            }
        });
    }
    
    // Helper functions for form validation
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');
        
        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            formGroup.appendChild(errorDiv);
        } else {
            existingError.textContent = message;
        }
        
        input.classList.add('error-input');
    }
    
    function removeError(input) {
        const formGroup = input.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');
        
        if (existingError) {
            existingError.remove();
        }
        
        input.classList.remove('error-input');
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Add some scroll animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .stat-item, .about-text, .contact-content > *');
        
        for (const element of elements) {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('fade-in');
            }
        }
    };
    
    // Run once on page load
    animateOnScroll();
    
    // Then run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Add CSS for the animations we're adding via JS
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            animation: fadeIn 0.6s ease forwards;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .service-card, .stat-item, .about-text, .contact-content > * {
            opacity: 0;
        }
        
        .error-message {
            color: var(--danger-color);
            font-size: 0.85rem;
            margin-top: 0.3rem;
        }
        
        .error-input {
            border-color: var(--danger-color) !important;
        }
        
        .success-message {
            text-align: center;
            padding: 2rem;
        }
        
        .success-message i {
            font-size: 3rem;
            color: var(--success-color);
            margin-bottom: 1rem;
        }
    `;
    document.head.appendChild(style);
    
    // ----------------
    // A-Frame Card Interface Functionality
    // ----------------
    
    // Wait for A-Frame to be ready
    if (document.querySelector('a-scene')) {
        // Scene loaded handler
        document.querySelector('a-scene').addEventListener('loaded', () => {
            console.log('A-Frame scene loaded');
            initCardInteractions();
            initCategoriesMenu();
            setup3DModel();
        });
    }
    
    // Initialize the categories menu functionality
    function initCategoriesMenu() {
        // Get all category buttons
        const categoryButtons = [
            document.querySelector('#tshirts-button'),
            document.querySelector('#jackets-button'),
            document.querySelector('#pants-button'),
            document.querySelector('#shoes-button'),
            document.querySelector('#accessories-button')
        ];
        
        // Add click event listeners to each button
        for (const button of categoryButtons) {
            if (button) {
                button.addEventListener('click', function() {
                    // Highlight selected category
                    for (const btn of categoryButtons) {
                        if (btn) {
                            // Reset all buttons
                            btn.querySelector('a-rounded').setAttribute('color', '#ffffff');
                            btn.querySelector('a-rounded').setAttribute('opacity', '0.3');
                        }
                    }
                    
                    // Highlight selected button
                    this.querySelector('a-rounded').setAttribute('color', '#ffffff');
                    this.querySelector('a-rounded').setAttribute('opacity', '0.6');
                    
                    // Get category name from the button's text
                    const categoryName = this.querySelector('[text]').getAttribute('text').value;
                    console.log(`Category selected: ${categoryName}`);
                    
                    // Handle category selection
                    handleCategorySelection(categoryName);
                });
            }
        }
    }
    
    // Handle the selection of a category
    function handleCategorySelection(category) {
        // This function would update content based on the selected category
        // For now, we'll just log the selection
        console.log(`Loading products for category: ${category}`);
        
        // Example: Update a status text to show selected category
        const statusText = document.querySelector('#status-text');
        if (statusText) {
            statusText.setAttribute('text', 'value', `Selected: ${category}`);
        }
        
        // You could trigger product card updates or other view changes here
        // based on the selected category
    }
    
    // Initialize card interaction effects
    function initCardInteractions() {
        const cards = [
            document.querySelector('#main-card'),
            document.querySelector('#side-card'),
            document.querySelector('#assistant-card')
        ];
        
        // Set up card interaction
        for (const card of cards) {
            if (!card) continue;
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                // Apply glow effect
                const cardPlane = card.querySelector('a-plane');
                if (cardPlane) {
                    const currentColor = cardPlane.getAttribute('material').color;
                    cardPlane.setAttribute('material', 'emissive', currentColor);
                    cardPlane.setAttribute('material', 'emissiveIntensity', 0.2);
                }
            });
            
            card.addEventListener('mouseleave', () => {
                // Remove glow effect
                const cardPlane = card.querySelector('a-plane');
                if (cardPlane) {
                    cardPlane.setAttribute('material', 'emissiveIntensity', 0);
                }
            });
            
            // Click effects
            card.addEventListener('click', () => {
                // Add active class
                card.classList.add('card-active');
                
                // Activate corresponding content
                const cardId = card.getAttribute('id');
                console.log(`Card clicked: ${cardId}`);
                
                // Show some visual feedback
                const feedbackDuration = 2000; // 2 seconds
                setTimeout(() => {
                    card.classList.remove('card-active');
                }, feedbackDuration);
            });
        }
    }
    
    // Control buttons interaction outside A-Frame
    const controlButtons = document.querySelectorAll('.control-button');
    for (const button of controlButtons) {
        button.addEventListener('click', () => {
            // Add press effect
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    // Keyboard controls for cards and camera
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        // Number keys 1-3 activate the respective cards
        if (key === '1') {
            document.querySelector('#main-card').dispatchEvent(new Event('click'));
        } else if (key === '2') {
            document.querySelector('#side-card').dispatchEvent(new Event('click'));
        } else if (key === '3') {
            document.querySelector('#assistant-card').dispatchEvent(new Event('click'));
        }
        
        // Get the camera rig with orbit controls
        const cameraRig = document.querySelector('#camera-rig');
        if (!cameraRig || !cameraRig.components['camera-orbit-controls']) return;
        
        const orbitControls = cameraRig.components['camera-orbit-controls'];
        
        // Camera orbit controls
        const rotStep = 5; // degrees
        
        if (key === 'q') {
            // Orbit left
            orbitControls.state.azimuth += THREE.MathUtils.degToRad(rotStep);
            orbitControls.updateCameraPosition();
        } else if (key === 'e') {
            // Orbit right
            orbitControls.state.azimuth -= THREE.MathUtils.degToRad(rotStep);
            orbitControls.updateCameraPosition();
        } else if (key === 'a') {
            // Orbit left faster
            orbitControls.state.azimuth += THREE.MathUtils.degToRad(rotStep * 2);
            orbitControls.updateCameraPosition();
        } else if (key === 'd') {
            // Orbit right faster
            orbitControls.state.azimuth -= THREE.MathUtils.degToRad(rotStep * 2);
            orbitControls.updateCameraPosition();
        } else if (key === 'w') {
            // Orbit up
            orbitControls.state.polar = Math.max(0.1, orbitControls.state.polar - THREE.MathUtils.degToRad(rotStep));
            orbitControls.updateCameraPosition();
        } else if (key === 's') {
            // Orbit down
            orbitControls.state.polar = Math.min(Math.PI - 0.1, orbitControls.state.polar + THREE.MathUtils.degToRad(rotStep));
            orbitControls.updateCameraPosition();
        } else if (key === 'z') {
            // Zoom in
            orbitControls.state.distance = Math.max(orbitControls.data.minDistance, orbitControls.state.distance - 0.2);
            orbitControls.updateCameraPosition();
        } else if (key === 'x') {
            // Zoom out
            orbitControls.state.distance = Math.min(orbitControls.data.maxDistance, orbitControls.state.distance + 0.2);
            orbitControls.updateCameraPosition();
        } else if (key === 'r') {
            // Reset camera view
            orbitControls.resetView();
        } else if (key === 't') {
            // Toggle auto-rotation
            orbitControls.state.isAutoRotating = !orbitControls.state.isAutoRotating;
            console.log(`Auto-rotation ${orbitControls.state.isAutoRotating ? 'enabled' : 'disabled'}`);
        }
    });
    
    // Setup the 3D model with proper scaling and interaction
    function setup3DModel() {
        const modelEntity = document.querySelector('[gltf-model="#shoe-model"]');
        
        if (!modelEntity) {
            console.warn('3D model entity not found');
            return;
        }
        
        // Handle model loaded event
        modelEntity.addEventListener('model-loaded', (e) => {
            console.log('3D model loaded successfully');
            
            // Get the model mesh
            const modelMesh = modelEntity.getObject3D('mesh');
            if (!modelMesh) return;
            
            // Auto-adjust scale if needed
            adjustModelScale(modelEntity, modelMesh);
            
            // Add click interaction
            modelEntity.addEventListener('click', () => {
                // Toggle rotation animation pause/play
                const animation = modelEntity.getAttribute('animation');
                if (animation.pauseEvents) {
                    modelEntity.removeAttribute('animation', 'pauseEvents');
                    modelEntity.setAttribute('animation', 'resumeEvents', 'click');
                } else {
                    modelEntity.setAttribute('animation', 'pauseEvents', 'click');
                }
                
                // Show some visual feedback
                const sideCard = document.querySelector('#side-card');
                sideCard.setAttribute('animation__feedback', {
                    property: 'position',
                    to: '0.5 0.42 0',
                    dur: 200,
                    easing: 'easeOutQuad',
                    dir: 'alternate',
                    loop: 1
                });
            });
        });
        
        // Handle model loading error
        modelEntity.addEventListener('model-error', (e) => {
            console.error('Error loading 3D model:', e.detail);
            
            // Fallback to image if model fails to load
            const sideCard = document.querySelector('#side-card');
            const planeContainer = sideCard.querySelector('a-plane');
            
            // Create fallback image
            const fallbackImg = document.createElement('a-plane');
            fallbackImg.setAttribute('position', '0 -0.15 0.005');
            fallbackImg.setAttribute('width', '0.28');
            fallbackImg.setAttribute('height', '0.18');
            fallbackImg.setAttribute('material', 'src: #product2; shader: flat; transparent: true');
            
            // Add fallback notice
            const fallbackText = document.createElement('a-entity');
            fallbackText.setAttribute('position', '0 -0.1 0.006');
            fallbackText.setAttribute('text', {
                value: 'Model unavailable',
                align: 'center',
                width: 0.5,
                color: 'white',
                shader: 'msdf',
                font: 'https://cdn.aframe.io/examples/ui/Viga-Regular.json'
            });
            
            // Add fallback elements
            planeContainer.appendChild(fallbackImg);
            planeContainer.appendChild(fallbackText);
        });
    }
    
    // Auto-adjust model scale to fit in container
    function adjustModelScale(modelEntity, modelMesh) {
        // Calculate bounding box
        const bbox = new THREE.Box3().setFromObject(modelMesh);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        
        // Get the largest dimension
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim === 0) return;
        
        // Calculate scale factor (target size / actual size)
        // We want the model to fit within a 0.2 unit box
        const targetSize = 0.2;
        const scaleFactor = targetSize / maxDim;
        
        // Get parent entity that controls scale
        const modelContainer = modelEntity.parentElement;
        if (modelContainer) {
            // Get current scale and adjust it
            const currentScale = modelContainer.getAttribute('scale');
            const adjustedScale = {
                x: currentScale.x * scaleFactor,
                y: currentScale.y * scaleFactor,
                z: currentScale.z * scaleFactor
            };
            
            // Apply new scale
            modelContainer.setAttribute('scale', adjustedScale);
            
            console.log('Adjusted 3D model scale:', adjustedScale);
        }
    }
}); 
/**
 * A-Frame Card Interface Components
 * Custom components for enhancing the AR/VR card interface
 */

// Make cards follow the camera with a slight delay
AFRAME.registerComponent('card-look-at', {
  schema: {
    target: { type: 'selector', default: '[camera]' },
    offset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    speed: { type: 'number', default: 0.1 }
  },
  
  init: function() {
    this.targetPosition = new THREE.Vector3();
    this.worldPosition = new THREE.Vector3();
    this.offset = new THREE.Vector3();
    this.originalRotation = this.el.object3D.rotation.clone();
    
    // Set initial values
    this.offset.set(
      this.data.offset.x,
      this.data.offset.y,
      this.data.offset.z
    );
    
    // Stop following when clicked
    this.el.addEventListener('click', () => {
      this.isActive = !this.isActive;
      
      // Visual feedback of state change
      if (this.isActive) {
        this.el.setAttribute('animation__activate', {
          property: 'scale',
          to: '1.1 1.1 1.1',
          dur: 300,
          easing: 'easeOutQuad'
        });
      } else {
        this.el.setAttribute('animation__deactivate', {
          property: 'scale',
          to: '1 1 1',
          dur: 300,
          easing: 'easeOutQuad'
        });
      }
    });
    
    // Active by default
    this.isActive = true;
  },
  
  tick: function(time, deltaTime) {
    if (!this.isActive) return;
    
    const target = this.data.target;
    const object3D = this.el.object3D;
    
    if (!target || !target.object3D) return;
    
    // Get world positions
    target.object3D.getWorldPosition(this.targetPosition);
    object3D.getWorldPosition(this.worldPosition);
    
    // Smooth look at with lerp
    const lerpAmount = Math.min(this.data.speed * (deltaTime / 1000), 1);
    
    // Create a temporary vector for the direction
    const direction = new THREE.Vector3().subVectors(this.targetPosition, this.worldPosition);
    
    // Skip if too close to avoid jitter
    if (direction.length() < 0.01) return;
    
    // Apply damped look at
    const lookAtPosition = new THREE.Vector3().copy(this.targetPosition);
    object3D.lookAt(lookAtPosition);
    
    // Blend with original rotation for less dramatic effect
    object3D.rotation.x = THREE.MathUtils.lerp(this.originalRotation.x, object3D.rotation.x, lerpAmount);
    object3D.rotation.y = THREE.MathUtils.lerp(this.originalRotation.y, object3D.rotation.y, lerpAmount);
    object3D.rotation.z = THREE.MathUtils.lerp(this.originalRotation.z, object3D.rotation.z, lerpAmount);
  }
});

// Hover effect component for cards
AFRAME.registerComponent('card-hover-effect', {
  schema: {
    color: { type: 'color', default: '#FFFFFF' },
    glowIntensity: { type: 'number', default: 0.3 },
    duration: { type: 'number', default: 200 }
  },
  
  init: function() {
    this.originalColor = null;
    this.originalIntensity = 0;
    this.plane = this.el.querySelector('a-plane');
    
    if (!this.plane) {
      console.warn('card-hover-effect: No plane found as child element');
      return;
    }
    
    // Store original material properties
    const material = this.plane.getAttribute('material');
    if (material) {
      this.originalColor = material.color || '#4a4a4a';
      this.originalIntensity = material.emissiveIntensity || 0;
    }
    
    // Add event listeners
    this.el.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.el.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.el.addEventListener('click', this.onClick.bind(this));
  },
  
  onMouseEnter: function() {
    // Apply glow effect
    if (this.plane) {
      this.plane.setAttribute('animation__glow', {
        property: 'material.emissiveIntensity',
        to: this.data.glowIntensity,
        dur: this.data.duration,
        easing: 'easeOutQuad'
      });
      
      // Slight scale up
      this.el.setAttribute('animation__scale', {
        property: 'scale',
        to: '1.03 1.03 1.03',
        dur: this.data.duration,
        easing: 'easeOutQuad'
      });
    }
  },
  
  onMouseLeave: function() {
    // Remove glow effect
    if (this.plane) {
      this.plane.setAttribute('animation__glow', {
        property: 'material.emissiveIntensity',
        to: this.originalIntensity,
        dur: this.data.duration,
        easing: 'easeOutQuad'
      });
      
      // Scale back to normal
      this.el.setAttribute('animation__scale', {
        property: 'scale',
        to: '1 1 1',
        dur: this.data.duration,
        easing: 'easeOutQuad'
      });
    }
  },
  
  onClick: function() {
    // Create a pulse animation
    if (this.plane) {
      this.plane.setAttribute('animation__pulse', {
        property: 'material.emissiveIntensity',
        from: this.data.glowIntensity * 1.5,
        to: this.originalIntensity,
        dur: 500,
        easing: 'easeOutElastic'
      });
      
      // Short bump animation
      this.el.setAttribute('animation__click', {
        property: 'scale',
        from: '1.05 1.05 1.05',
        to: '1 1 1',
        dur: 300,
        easing: 'easeOutElastic'
      });
    }
  }
});

// Create a speech bubble that follows a target
AFRAME.registerComponent('speech-bubble', {
  schema: {
    opacity: { type: 'number', default: 1 },
    width: { type: 'number', default: 0.4 },
    height: { type: 'number', default: 0.2 },
    color: { type: 'color', default: '#222222' },
    textValue: { type: 'string', default: 'Hello!' },
    textColor: { type: 'color', default: '#FFFFFF' },
    target: { type: 'selector' },
    offset: { type: 'vec3', default: { x: 0.2, y: 0, z: 0 } },
    pointerSide: { type: 'string', default: 'right' }
  },
  
  init: function() {
    // Create the bubble container
    this.bubbleContainer = document.createElement('a-entity');
    this.el.appendChild(this.bubbleContainer);
    
    // Create bubble background using a-entity with the rounded component
    this.bubble = document.createElement('a-entity');
    
    // Set rounded component properties as a string
    const roundedProps = `width: ${this.data.width}; height: ${this.data.height}; radius: 0.015; color: ${this.data.color}; opacity: ${this.data.opacity};`;
    this.bubble.setAttribute('rounded', roundedProps);
    
    // Ensure flat shader (aframe-rounded usually handles its material, but shader type can be good to ensure)
    this.bubble.setAttribute('material', 'shader: flat;');
    
    this.bubbleContainer.appendChild(this.bubble);
    
    // Create bubble text
    this.text = document.createElement('a-entity');
    this.text.setAttribute('text', {
      value: this.data.textValue,
      color: this.data.textColor,
      width: this.data.width,
      shader: 'msdf',
      font: 'https://cdn.aframe.io/examples/ui/Viga-Regular.json',
      anchor: 'center',
      baseline: 'center',
      wrapCount: 18,
      wrapPixels: 600,
      align: 'center'
    });
    this.text.setAttribute('rotation', '0 0 0');
    
    // Create text shadow for better visibility
    this.textShadow = document.createElement('a-entity');
    this.textShadow.setAttribute('text', {
      value: this.data.textValue,
      color: '#000000', // Shadow color
      opacity: 0.75,      // Shadow opacity
      width: this.data.width,
      shader: 'msdf',
      font: 'https://cdn.aframe.io/examples/ui/Viga-Regular.json',
      anchor: 'center',
      baseline: 'center',
      wrapCount: 18,
      wrapPixels: 600,
      align: 'center'
    });
    this.textShadow.setAttribute('rotation', '0 0 0'); // Match main text rotation
    // Position shadow slightly offset and behind main text
    // Adjust these offsets (0.0015, -0.0015) for desired shadow effect (scaled by bubble size)
    this.textShadow.setAttribute('position', '0.0015 -0.0015 0.0019');
    this.bubbleContainer.appendChild(this.textShadow); // Add shadow first so it is behind

    this.text.setAttribute('position', '0 0 0.002'); // Main text slightly in front of shadow
    this.bubbleContainer.appendChild(this.text);
    
    // Create bubble pointer
    this.pointer = document.createElement('a-triangle');
    
    const pointerXOffset = this.data.width / 2;
    // const pointerVertexA_X = -0.12; // Old logic
    // const pointerVertexB_Y = -0.06; // Old logic

    // New pointer logic for better shape and positioning
    const pointerBaseHeight = 0.05; // Defines the height of the pointer's base
    const pointerDepth = 0.05;    // Defines how far the pointer tip extends

    if (this.data.pointerSide === 'right') {
      this.pointer.setAttribute('position', {
        x: pointerXOffset, 
        y: 0, // Vertically centered with the bubble's edge
        z: 0.001 // Just in front of the bubble background
      });
      // Vertex A is the tip, B and C are the base corners
      this.pointer.setAttribute('vertex-a', `${pointerDepth} 0 0`); // Tip extends to the right
      this.pointer.setAttribute('vertex-b', `0 ${-pointerBaseHeight / 2} 0`); // Bottom base corner
      this.pointer.setAttribute('vertex-c', `0 ${pointerBaseHeight / 2} 0`);  // Top base corner
    } else { // Default to left side
      this.pointer.setAttribute('position', {
        x: -pointerXOffset, 
        y: 0, // Vertically centered
        z: 0.001
      });
      this.pointer.setAttribute('vertex-a', `${-pointerDepth} 0 0`); // Tip extends to the left
      this.pointer.setAttribute('vertex-b', `0 ${-pointerBaseHeight / 2} 0`); // Bottom base corner
      this.pointer.setAttribute('vertex-c', `0 ${pointerBaseHeight / 2} 0`);  // Top base corner
    }
    
    // this.pointer.setAttribute('vertex-a', `${pointerVertexA_X} 0 0`); // Old logic
    // this.pointer.setAttribute('vertex-b', `0 ${pointerVertexB_Y} 0`); // Old logic
    // this.pointer.setAttribute('vertex-c', '0 0 0');             // Old logic
    
    this.pointer.setAttribute('material', {
      color: this.data.color,
      shader: 'flat'
    });
    this.bubbleContainer.appendChild(this.pointer);
    
    // Set initial position
    this.updatePosition();
    
    // Apply a slight floating animation
    this.bubbleContainer.setAttribute('animation', {
      property: 'position',
      dir: 'alternate',
      dur: 2000,
      easing: 'easeInOutSine',
      loop: true,
      from: '0 0 0',
      to: '0 0.01 0'
    });
  },
  
  updatePosition: function() {
    if (this.data.target) {
      const targetPos = this.data.target.object3D.position;
      this.bubbleContainer.setAttribute('position', {
        x: this.data.offset.x,
        y: this.data.offset.y,
        z: this.data.offset.z
      });
    }
  },
  
  update: function(oldData) {
    // Update text if changed
    if (this.data.textValue !== oldData.textValue && this.text) {
      this.text.setAttribute('text', 'value', this.data.textValue);
      if (this.textShadow) { // Also update shadow text
        this.textShadow.setAttribute('text', 'value', this.data.textValue);
      }
    }
    
    // Update position if target changed
    if (this.data.target !== oldData.target) {
      this.updatePosition();
    }
  }
});

// Fade-in component for card appearance
AFRAME.registerComponent('fade-in', {
  schema: {
    duration: { type: 'number', default: 800 },
    delay: { type: 'number', default: 0 },
    from: { type: 'number', default: 0 },
    to: { type: 'number', default: 1 },
    easing: { type: 'string', default: 'easeOutCubic' }
  },
  
  init: function() {
    // Store original scale and position
    this.originalScale = this.el.object3D.scale.clone();
    this.originalPosition = this.el.object3D.position.clone();
    
    // Set initial invisible state
    this.el.setAttribute('visible', false);
    
    // Start animation after delay
    setTimeout(() => {
      // Make visible
      this.el.setAttribute('visible', true);
      
      // Animate opacity
      if (this.el.hasAttribute('material')) {
        this.el.setAttribute('material', 'opacity', this.data.from);
        this.el.setAttribute('animation__opacity', {
          property: 'material.opacity',
          from: this.data.from,
          to: this.data.to,
          dur: this.data.duration,
          easing: this.data.easing
        });
      } else {
        // If it's an entity, affect all child planes
        const planes = this.el.querySelectorAll('a-plane');
        for (const plane of planes) {
          plane.setAttribute('material', 'opacity', this.data.from);
          plane.setAttribute('animation__opacity', {
            property: 'material.opacity',
            from: this.data.from,
            to: this.data.to,
            dur: this.data.duration,
            easing: this.data.easing
          });
        }
      }
      
      // Animate scale
      this.el.setAttribute('scale', '0.9 0.9 0.9');
      this.el.setAttribute('animation__scale', {
        property: 'scale',
        from: '0.9 0.9 0.9',
        to: `${this.originalScale.x} ${this.originalScale.y} ${this.originalScale.z}`,
        dur: this.data.duration,
        easing: this.data.easing
      });
      
      // Animate position (slight upward movement)
      const startY = this.originalPosition.y - 0.05;
      this.el.setAttribute('position', `${this.originalPosition.x} ${startY} ${this.originalPosition.z}`);
      this.el.setAttribute('animation__position', {
        property: 'position',
        from: `${this.originalPosition.x} ${startY} ${this.originalPosition.z}`,
        to: `${this.originalPosition.x} ${this.originalPosition.y} ${this.originalPosition.z}`,
        dur: this.data.duration,
        easing: this.data.easing
      });
    }, this.data.delay);
  }
});

// Model viewer component for interactive 3D models
AFRAME.registerComponent('model-viewer', {
  schema: {
    rotationSpeed: { type: 'number', default: 0.2 },
    enableMouseRotation: { type: 'boolean', default: true },
    highlightColor: { type: 'color', default: '#4286f4' },
    objectDistance: { type: 'number', default: 0.5 },
    interactionEnabled: { type: 'boolean', default: true },
    autoAdjustScale: { type: 'boolean', default: true },
    maxScale: { type: 'number', default: 2.0 }
  },
  
  init: function() {
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);
    
    // Prepare for rotation
    this.mouseDown = false;
    this.lastMousePosition = { x: 0, y: 0 };
    this.orbitControls = null;
    
    // Get or create model entity
    this.modelEntity = this.el.querySelector('[gltf-model]') || this.el;
    
    // Add event listeners
    this.modelEntity.addEventListener('model-loaded', this.onModelLoaded);
    
    if (this.data.interactionEnabled) {
      this.el.addEventListener('mouseenter', this.onMouseEnter);
      this.el.addEventListener('mouseleave', this.onMouseLeave);
      this.el.addEventListener('click', this.onClick);
    }
    
    // Create highlight material for when hovering
    this.highlightMaterial = new THREE.MeshStandardMaterial({
      color: this.data.highlightColor,
      emissive: this.data.highlightColor,
      emissiveIntensity: 0.2,
      metalness: 0.8,
      roughness: 0.2
    });
    
    // Store original materials
    this.originalMaterials = new Map();
  },
  
  onModelLoaded: function(evt) {
    const model = this.modelEntity.getObject3D('mesh');
    if (!model) return;
    
    console.log('Model loaded in model-viewer component');
    
    // Store original materials
    model.traverse(node => {
      if (node.isMesh && node.material) {
        if (Array.isArray(node.material)) {
          this.originalMaterials.set(node, [...node.material]);
        } else {
          this.originalMaterials.set(node, node.material.clone());
        }
      }
    });
    
    // Auto-adjust scale if needed
    if (this.data.autoAdjustScale) {
      this.adjustModelScale(model);
    }
  },
  
  adjustModelScale: function(model) {
    // Calculate bounding box
    const bbox = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    
    // Get the largest dimension
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;
    
    // Calculate scale factor based on desired size
    const targetSize = this.data.objectDistance;
    let scaleFactor = targetSize / maxDim;
    
    // Apply maximum scale limit
    scaleFactor = Math.min(scaleFactor, this.data.maxScale);
    
    // Get current scale and adjust it
    const currentScale = this.el.object3D.scale;
    this.el.object3D.scale.set(
      scaleFactor,
      scaleFactor,
      scaleFactor
    );
    
    console.log('Model auto-scaled by factor:', scaleFactor);
  },
  
  onMouseEnter: function() {
    this.hovering = true;
    
    // Speed up rotation on hover
    const model = this.modelEntity;
    const animation = model.getAttribute('animation');
    if (animation) {
      // Store original duration
      this.originalDuration = animation.dur;
      // Speed up the rotation
      model.setAttribute('animation', 'dur', animation.dur / 2);
    }
    
    // Apply highlight material
    const mesh = this.modelEntity.getObject3D('mesh');
    if (mesh) {
      mesh.traverse(node => {
        if (node.isMesh && node.material) {
          // Apply highlight to material
          if (Array.isArray(node.material)) {
            for (let i = 0; i < node.material.length; i++) {
              node.material[i].emissive = new THREE.Color(this.data.highlightColor);
              node.material[i].emissiveIntensity = 0.2;
              node.material[i].needsUpdate = true;
            }
          } else {
            node.material.emissive = new THREE.Color(this.data.highlightColor);
            node.material.emissiveIntensity = 0.2;
            node.material.needsUpdate = true;
          }
        }
      });
    }
  },
  
  onMouseLeave: function() {
    this.hovering = false;
    
    // Return to normal rotation speed
    const model = this.modelEntity;
    const animation = model.getAttribute('animation');
    if (animation && this.originalDuration) {
      model.setAttribute('animation', 'dur', this.originalDuration);
    }
    
    // Restore original materials
    const mesh = this.modelEntity.getObject3D('mesh');
    if (mesh) {
      mesh.traverse(node => {
        if (node.isMesh && this.originalMaterials.has(node)) {
          const originalMaterial = this.originalMaterials.get(node);
          
          if (Array.isArray(originalMaterial)) {
            for (let i = 0; i < originalMaterial.length; i++) {
              if (node.material[i]) {
                node.material[i].emissive = originalMaterial[i].emissive;
                node.material[i].emissiveIntensity = originalMaterial[i].emissiveIntensity || 0;
                node.material[i].needsUpdate = true;
              }
            }
          } else if (node.material) {
            node.material.emissive = originalMaterial.emissive;
            node.material.emissiveIntensity = originalMaterial.emissiveIntensity || 0;
            node.material.needsUpdate = true;
          }
        }
      });
    }
  },
  
  onClick: function() {
    // Pause/unpause the animation
    const model = this.modelEntity;
    const animation = model.getAttribute('animation');
    
    if (animation) {
      if (animation.pauseEvents) {
        model.removeAttribute('animation', 'pauseEvents');
        // Resume animation
        model.emit('resume');
      } else {
        model.setAttribute('animation', 'pauseEvents', 'pause');
        // Pause animation
        model.emit('pause');
      }
    }
    
    // Trigger feedback animation on the parent card
    const sideCard = document.querySelector('#side-card');
    if (sideCard) {
      sideCard.setAttribute('animation__interacted', {
        property: 'scale',
        to: '1.05 1.05 1.05',
        dur: 200,
        easing: 'easeOutQuad',
        dir: 'alternate',
        loop: 1
      });
    }
  },
  
  remove: function() {
    this.modelEntity.removeEventListener('model-loaded', this.onModelLoaded);
    
    if (this.data.interactionEnabled) {
      this.el.removeEventListener('mouseenter', this.onMouseEnter);
      this.el.removeEventListener('mouseleave', this.onMouseLeave);
      this.el.removeEventListener('click', this.onClick);
    }
  }
});

// Camera orbit controls for enhanced navigation
AFRAME.registerComponent('camera-orbit-controls', {
  schema: {
    target: { type: 'vec3', default: {x: 0, y: 1.5, z: -1.8} },
    minDistance: { type: 'number', default: 1.0 },
    maxDistance: { type: 'number', default: 5.0 },
    initialDistance: { type: 'number', default: 3.0 },
    rotationSpeed: { type: 'number', default: 0.1 },
    zoomSpeed: { type: 'number', default: 0.5 },
    enableRotation: { type: 'boolean', default: true },
    enableZoom: { type: 'boolean', default: true },
    enableDamping: { type: 'boolean', default: true },
    dampingFactor: { type: 'number', default: 0.1 },
    autoRotate: { type: 'boolean', default: false },
    autoRotateSpeed: { type: 'number', default: 0.5 },
    reverseOrbit: { type: 'boolean', default: false }
  },
  
  init: function() {
    this.cameraPosition = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
    this.spherical = new THREE.Spherical();
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();
    
    // Internal state
    this.state = {
      distance: this.data.initialDistance,
      polar: Math.PI / 2,     // Up/down angle (0 = top, PI = bottom)
      azimuth: Math.PI / 2,   // Left/right rotation (initial 90 degrees)
      isDragging: false,
      isZooming: false,
      isAutoRotating: this.data.autoRotate
    };
    
    // Set target position
    this.targetPosition.set(
      this.data.target.x,
      this.data.target.y,
      this.data.target.z
    );
    
    // Bind event handlers
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    
    // Add event listeners
    const canvas = this.el.sceneEl.canvas;
    canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('wheel', this.onWheel);
    canvas.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove);
    window.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('keydown', this.onKeyDown);
    
    // Add UI controls
    this.setupOrbitControls();
    
    // Position camera initially
    this.updateCameraPosition();
  },
  
  setupOrbitControls: function() {
    // Create orbit control UI if it doesn't exist
    const controlsContainer = document.querySelector('.orbit-controls');
    if (!controlsContainer) {
      const aframeControls = document.querySelector('.aframe-controls');
      if (!aframeControls) return;
      
      const orbitControls = document.createElement('div');
      orbitControls.className = 'orbit-controls';
      
      // Add control buttons
      orbitControls.innerHTML = `
        <button class="control-button orbit-left">⟲ Orbit Left</button>
        <button class="control-button orbit-right">Orbit Right ⟳</button>
        <button class="control-button orbit-up">↑ Up</button>
        <button class="control-button orbit-down">↓ Down</button>
        <button class="control-button zoom-in">+ Zoom In</button>
        <button class="control-button zoom-out">- Zoom Out</button>
        <button class="control-button auto-rotate">Auto Rotate</button>
      `;
      
      aframeControls.appendChild(orbitControls);
      
      // Add event listeners to buttons
      document.querySelector('.orbit-left').addEventListener('click', () => {
        this.state.azimuth += THREE.MathUtils.degToRad(30);
        this.updateCameraPosition();
      });
      
      document.querySelector('.orbit-right').addEventListener('click', () => {
        this.state.azimuth -= THREE.MathUtils.degToRad(30);
        this.updateCameraPosition();
      });
      
      document.querySelector('.orbit-up').addEventListener('click', () => {
        this.state.polar = Math.max(0.1, this.state.polar - THREE.MathUtils.degToRad(15));
        this.updateCameraPosition();
      });
      
      document.querySelector('.orbit-down').addEventListener('click', () => {
        this.state.polar = Math.min(Math.PI - 0.1, this.state.polar + THREE.MathUtils.degToRad(15));
        this.updateCameraPosition();
      });
      
      document.querySelector('.zoom-in').addEventListener('click', () => {
        this.state.distance = Math.max(this.data.minDistance, this.state.distance - 0.5);
        this.updateCameraPosition();
      });
      
      document.querySelector('.zoom-out').addEventListener('click', () => {
        this.state.distance = Math.min(this.data.maxDistance, this.state.distance + 0.5);
        this.updateCameraPosition();
      });
      
      document.querySelector('.auto-rotate').addEventListener('click', (event) => {
        this.state.isAutoRotating = !this.state.isAutoRotating;
        event.target.classList.toggle('active');
      });
    }
  },
  
  update: function(oldData) {
    // Handle data changes
    if (oldData.target && (
        this.data.target.x !== oldData.target.x ||
        this.data.target.y !== oldData.target.y ||
        this.data.target.z !== oldData.target.z
    )) {
      this.targetPosition.set(
        this.data.target.x,
        this.data.target.y,
        this.data.target.z
      );
    }
    
    if (oldData.autoRotate !== undefined && this.data.autoRotate !== oldData.autoRotate) {
      this.state.isAutoRotating = this.data.autoRotate;
    }
  },
  
  tick: function(time, deltaTime) {
    if (!this.el.sceneEl.camera) return;
    
    // Auto-rotate if enabled
    if (this.state.isAutoRotating) {
      const rotateAmount = THREE.MathUtils.degToRad(this.data.autoRotateSpeed * deltaTime / 16);
      this.state.azimuth += rotateAmount * (this.data.reverseOrbit ? -1 : 1);
    }
    
    // Apply damping for smooth movement
    if (this.data.enableDamping && !this.state.isDragging) {
      this.updateCameraPosition();
    }
  },
  
  updateCameraPosition: function() {
    // Convert spherical coordinates to Cartesian
    this.spherical.set(
      this.state.distance,
      this.state.polar,
      this.state.azimuth
    );
    
    this.cameraPosition.setFromSpherical(this.spherical);
    this.cameraPosition.add(this.targetPosition);
    
    // Set camera position
    this.el.object3D.position.copy(this.cameraPosition);
    
    // Make camera look at target
    const lookAtPosition = new THREE.Vector3().copy(this.targetPosition);
    this.el.object3D.lookAt(lookAtPosition);
    
    // Update camera matrix
    this.el.object3D.updateMatrixWorld(true);
  },
  
  // Mouse event handlers
  onMouseDown: function(event) {
    if (!this.data.enableRotation) return;
    
    // Only handle left button
    if (event.button !== 0) return;
    
    this.state.isDragging = true;
    this.rotateStart.set(event.clientX, event.clientY);
  },
  
  onMouseMove: function(event) {
    if (!this.state.isDragging) return;
    
    this.rotateEnd.set(event.clientX, event.clientY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
    
    // Apply rotation
    this.state.azimuth -= 2 * Math.PI * this.rotateDelta.x / this.el.sceneEl.canvas.clientWidth * this.data.rotationSpeed;
    this.state.polar = Math.max(0.1, Math.min(Math.PI - 0.1, this.state.polar + 2 * Math.PI * this.rotateDelta.y / this.el.sceneEl.canvas.clientHeight * this.data.rotationSpeed));
    
    this.rotateStart.copy(this.rotateEnd);
    this.updateCameraPosition();
  },
  
  onMouseUp: function() {
    this.state.isDragging = false;
  },
  
  onWheel: function(event) {
    if (!this.data.enableZoom) return;
    
    event.preventDefault();
    
    // Zoom in/out
    const delta = -Math.sign(event.deltaY) * this.data.zoomSpeed;
    this.state.distance = Math.max(this.data.minDistance, Math.min(this.data.maxDistance, this.state.distance - delta));
    
    this.updateCameraPosition();
  },
  
  // Touch event handlers
  onTouchStart: function(event) {
    if (!this.data.enableRotation || event.touches.length !== 1) return;
    
    this.state.isDragging = true;
    this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
  },
  
  onTouchMove: function(event) {
    if (!this.state.isDragging || event.touches.length !== 1) return;
    
    this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
    
    // Apply rotation
    this.state.azimuth -= 2 * Math.PI * this.rotateDelta.x / this.el.sceneEl.canvas.clientWidth * this.data.rotationSpeed;
    this.state.polar = Math.max(0.1, Math.min(Math.PI - 0.1, this.state.polar + 2 * Math.PI * this.rotateDelta.y / this.el.sceneEl.canvas.clientHeight * this.data.rotationSpeed));
    
    this.rotateStart.copy(this.rotateEnd);
    this.updateCameraPosition();
  },
  
  onTouchEnd: function() {
    this.state.isDragging = false;
  },
  
  // Keyboard controls
  onKeyDown: function(event) {
    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'arrowleft':
      case 'a':
        // Orbit left
        this.state.azimuth += THREE.MathUtils.degToRad(5);
        break;
      case 'arrowright':
      case 'd':
        // Orbit right
        this.state.azimuth -= THREE.MathUtils.degToRad(5);
        break;
      case 'arrowup':
      case 'w':
        // Orbit up
        this.state.polar = Math.max(0.1, this.state.polar - THREE.MathUtils.degToRad(5));
        break;
      case 'arrowdown':
      case 's':
        // Orbit down
        this.state.polar = Math.min(Math.PI - 0.1, this.state.polar + THREE.MathUtils.degToRad(5));
        break;
      case 'q':
        // Zoom in
        this.state.distance = Math.max(this.data.minDistance, this.state.distance - 0.2);
        break;
      case 'e':
        // Zoom out
        this.state.distance = Math.min(this.data.maxDistance, this.state.distance + 0.2);
        break;
      case 'r':
        // Reset view
        this.resetView();
        break;
      default:
        return;
    }
    
    this.updateCameraPosition();
  },
  
  resetView: function() {
    // Reset to initial view
    this.state.distance = this.data.initialDistance;
    this.state.polar = Math.PI / 2;
    this.state.azimuth = Math.PI / 2;
    this.updateCameraPosition();
  },
  
  remove: function() {
    // Remove event listeners
    const canvas = this.el.sceneEl.canvas;
    canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    canvas.removeEventListener('wheel', this.onWheel);
    canvas.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('keydown', this.onKeyDown);
  }
}); 
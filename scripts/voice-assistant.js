// Voice Assistant for Web 5.0
// This script provides voice interaction features

class VoiceAssistant {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    // Change to "Hey webby" wake words and variations
    this.wakeWords = [
      'hey webby', 'hey webbe', 'hey web',
      'hey website', 'hey web5', 'hey baby',
      'hey webbie', 'hey with', 'hey web 5'
    ];
    this.assistantElement = document.querySelector('#camera-assistant');
    this.speechBubbleElement = null;
    this.lastSpeechTimestamp = 0;
    this.messageTimeout = null;
    this.isActivated = false;
    this.messageStack = [];
    this.maxMessages = 5;
    this.messageFadeTime = 10000; // Messages fade after 10 seconds
    this.isSearchingProduct = false;
    this.speechSynthesis = window.speechSynthesis;
    this.isSpeaking = false;
    
    // Create chat container
    this.createChatInterface();
    
    // Add Wix Spatial Studio watermark
    this.addWixBranding();
    
    // Request microphone permissions explicitly rather than waiting
    this.requestMicrophonePermission()
      .then(() => {
        this.initSpeechRecognition();
        this.startListening();
        console.log("Microphone access granted - voice assistant activated");
        this.showFeedbackMessage("Say 'Hey Webby' to activate", false);
      })
      .catch(error => {
        console.error("Microphone access denied:", error);
        this.showFeedbackMessage("Microphone access denied. Voice assistant disabled.");
      });
      
    // Hide the card container initially if it exists
    this.hideCardContainer();
  }

  addWixBranding() {
    // Create branding element
    const branding = document.createElement('div');
    branding.id = 'wix-spatial-branding';
    branding.style.position = 'fixed';
    branding.style.bottom = '15px';
    branding.style.left = '15px';
    branding.style.fontFamily = 'Arial, sans-serif';
    branding.style.fontSize = '14px';
    branding.style.color = 'rgba(255, 255, 255, 0.8)';
    branding.style.padding = '5px 10px';
    branding.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    branding.style.borderRadius = '4px';
    branding.style.zIndex = '9999';
    branding.style.userSelect = 'none';
    branding.style.pointerEvents = 'none';
    branding.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
    
    // Create text with Wix logo styling
    const logo = document.createElement('span');
    logo.style.fontWeight = 'bold';
    logo.style.color = '#00aeff'; // Wix blue color
    logo.textContent = 'Powered by ';
    
    const studioText = document.createElement('span');
    studioText.style.fontWeight = 'bold';
    studioText.textContent = 'Wix Spatial Studio';
    
    // Add elements to branding container
    branding.appendChild(logo);
    branding.appendChild(studioText);
    
    // Add to DOM
    document.body.appendChild(branding);
  }

  createChatInterface() {
    // Create a container for the chat messages
    this.chatContainer = document.createElement('div');
    this.chatContainer.id = 'voice-chat-container';
    this.chatContainer.style.position = 'fixed';
    this.chatContainer.style.bottom = '150px';
    this.chatContainer.style.right = '20px';
    this.chatContainer.style.width = '300px';
    this.chatContainer.style.maxHeight = '400px';
    this.chatContainer.style.overflowY = 'hidden';
    this.chatContainer.style.display = 'flex';
    this.chatContainer.style.flexDirection = 'column-reverse'; // Newest messages at bottom
    this.chatContainer.style.gap = '10px';
    this.chatContainer.style.zIndex = '9999';
    
    document.body.appendChild(this.chatContainer);
  }

  addChatMessage(text, isUser = false) {
    // Create a message element
    const message = document.createElement('div');
    message.className = `chat-message ${isUser ? 'user-message' : 'assistant-message'}`;
    message.style.padding = '10px 15px';
    message.style.borderRadius = '18px';
    message.style.maxWidth = '85%';
    message.style.animation = 'fadeIn 0.3s ease-in';
    message.style.transition = 'opacity 0.5s, transform 0.3s';
    message.style.marginBottom = '5px';
    
    // Style based on sender
    if (isUser) {
      message.style.backgroundColor = '#4a86e8';
      message.style.color = 'white';
      message.style.alignSelf = 'flex-end';
      message.style.borderBottomRightRadius = '5px';
    } else {
      message.style.backgroundColor = '#e9e9eb';
      message.style.color = '#333';
      message.style.alignSelf = 'flex-start';
      message.style.borderBottomLeftRadius = '5px';
    }
    
    message.textContent = text;
    
    // Add to DOM
    this.chatContainer.prepend(message);
    
    // Add to our message stack
    this.messageStack.push(message);
    
    // Limit number of messages
    this.pruneMessages();
    
    // Set up fade out
    setTimeout(() => {
      message.style.opacity = '0';
      message.style.transform = 'translateY(-10px)';
      
      // Remove from DOM after fade
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
        // Remove from our stack
        const index = this.messageStack.indexOf(message);
        if (index > -1) {
          this.messageStack.splice(index, 1);
        }
      }, 500);
    }, this.messageFadeTime);
    
    return message;
  }
  
  pruneMessages() {
    // If we exceed max messages, remove oldest ones
    while (this.messageStack.length > this.maxMessages) {
      const oldestMessage = this.messageStack.shift();
      if (oldestMessage?.parentNode) {
        oldestMessage.parentNode.removeChild(oldestMessage);
      }
    }
  }

  async requestMicrophonePermission() {
    // Try to request microphone access directly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the tracks immediately, we just need the permission
      for (const track of stream.getTracks()) {
        track.stop();
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  showFeedbackMessage(message, isToShow = false) {
    // Find or update the speech bubble if it exists
    if (this.assistantElement) {
      const speechBubble = this.assistantElement.querySelector('[speech-bubble]');
      if (speechBubble) {
        speechBubble.setAttribute('speech-bubble', `textValue: ${message};`);
        
        // Make sure the assistant is visible temporarily
        this.assistantElement.setAttribute('scale', '1.2 1.2 1.2');
        
        // Reset after delay
        setTimeout(() => {
          this.assistantElement.setAttribute('scale', '1 1 1');
        }, 5000);
      }
    }
    
    // Also show in console
    console.log(message);
    
    // Add an on-screen notification for non-VR mode
    this.showOnScreenNotification(message);
    if(!isToShow) return;
    
    // If not a system message, add it to chat
    if (!message.includes("ready") && !message.includes("denied") && !message.includes("listening")) {
      this.addChatMessage(message, false);
    }
  }
  
  showOnScreenNotification(message) {
    // Create or update a notification element
    let notification = document.getElementById('voice-assistant-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'voice-assistant-notification';
      notification.style.position = 'fixed';
      notification.style.bottom = '10px';
      notification.style.right = '20px';
      notification.style.padding = '5px 7px';
      notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      notification.style.color = 'white';
      notification.style.borderRadius = '5px';
      notification.style.fontSize = '8px';
      notification.style.zIndex = '10000';
      notification.style.transition = 'opacity 0.5s';
      
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.opacity = '1';
    
    // Hide after a delay
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 5000);
  }

  initSpeechRecognition() {
    // Check browser compatibility
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      this.showFeedbackMessage("Speech recognition not supported in this browser");
      return;
    }

    // Create speech recognition instance
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.continuous = true;
    this.recognition.interimResults = false; // Only get final results for better accuracy
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3; // Get multiple alternatives to improve matching

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice assistant is listening...');
      this.showOnScreenNotification('Voice assistant is listening...');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Voice recognition stopped. Restarting...');
      
      // Restart if recognition stops
      if (this.shouldBeListening) {
        setTimeout(() => this.startListening(), 300);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        this.showFeedbackMessage("Microphone access denied. Please allow microphone access.");
        this.shouldBeListening = false;
      } else {
        // Restart on other errors after a delay
        if (this.shouldBeListening) {
          setTimeout(() => this.startListening(), 1000);
        }
      }
    };

    this.recognition.onresult = (event) => {
      // Check all recognition alternatives
      let transcript = '';
      let matchedWakeWord = false;
      
      // Check all results and all alternatives for each result
      for (let i = 0; i < event.results.length; i++) {
        // Check each alternative for this result
        for (let j = 0; j < event.results[i].length; j++) {
          const alternativeTranscript = event.results[i][j].transcript.trim().toLowerCase();
          console.log(`Alternative (${j}): ${alternativeTranscript}`);
          
          // Check if this alternative contains a wake word
          if (!this.isActivated && this.checkForWakeWords(alternativeTranscript)) {
            matchedWakeWord = true;
            transcript = alternativeTranscript;
            break;
          }
          
          // If already activated, use the best transcript (first alternative)
          if (this.isActivated && j === 0) {
            transcript = alternativeTranscript;
          }
        }
        
        if (matchedWakeWord) break;
      }
      
      // Use the best transcript if no wake word was found and we're activated
      if (!matchedWakeWord && this.isActivated && event.results.length > 0) {
        transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      }
      
      console.log('Processing:', transcript);
      
      // Handle wake word activation if not already activated
      if (!this.isActivated && matchedWakeWord) {
        this.activateAssistant();
        return;
      }
      
      // If already activated, process the user's input
      if (this.isActivated && transcript && transcript.length > 0) {
        // Process the user message
        this.processUserMessage(transcript);
      }
    };
  }
  
  processUserMessage(message) {
    console.log('Processing user message:', message);
    
    // Skip processing if the message contains wake words
    // This prevents processing "hey webby" as a separate command
    if (this.checkForWakeWords(message)) {
      console.log('Skipping wake word as command');
      return;
    }
    
    // Add user message to chat
    this.addChatMessage(message, true);
    
    // Reset inactivity timer when user speaks
    this.resetInactivityTimer();
    
    // Don't process if already speaking to avoid interruptions
    if (this.isSpeaking && this.speechSynthesis?.speaking) {
      this.speechSynthesis.cancel();
      console.log('Cancelled current speech to process new command');
    }
    
    // Check if we're in the middle of a product search
    if (this.isSearchingProduct) {
      console.log('Already searching for products, ignoring new commands');
      return;
    }
    
    // Simple responses based on keywords
    setTimeout(() => {
      let response = "I'm not sure how to respond to that.";
      
      // Simple keyword matching for demo purposes
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('buy') && 
          (lowerMessage.includes('sandal') || lowerMessage.includes('shoe') || lowerMessage.includes('footwear'))) {
        // Start the sandal search sequence
        this.startSandalSearchSequence();
        return;
      }
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = "Hello! How can I help you today?";
      } else if (lowerMessage.includes('how are you')) {
        response = "I'm doing well, thank you for asking!";
      } else if (lowerMessage.includes('time')) {
        const now = new Date();
        response = `The current time is ${now.toLocaleTimeString()}.`;
      } else if (lowerMessage.includes('weather')) {
        response = "I don't have access to real-time weather data, but I hope it's nice where you are!";
      } else if (lowerMessage.includes('name')) {
        response = "I'm Web Five, your virtual assistant!";
      } else if (lowerMessage.includes('thank')) {
        response = "You're welcome! Is there anything else you'd like to know?";
      } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        response = "Goodbye! Have a great day!";
        setTimeout(() => {
          this.deactivateAssistant();
        }, 2000);
      }
      
      // Show the assistant's response
      this.respondToUser(response);
    }, 1000); // Slight delay to feel more natural
  }
  
  startSandalSearchSequence() {
    // Set flag to prevent interruptions
    this.isSearchingProduct = true;
    
    // Force update scene first to ensure it's all loaded
    this.forceUpdateEntities();
    
    // First response
    this.respondToUser("I'd be happy to help you find the perfect sandals. Let me search for some options.");
    
    // Then after a delay, show "Searching..."
    setTimeout(() => {
      this.respondToUser("Searching our collection for the best options...");
      
      // After another delay, show progress
      setTimeout(() => {
        this.respondToUser("I'm analyzing your preferences based on your previous selections...");
        
        // Finally, show the result
        setTimeout(() => {
          // Make sure UI elements are visible BEFORE sending the message
          console.log('SEQUENCE: About to show UI elements');
          this.showCardContainer();
          
          // Ensure cardContainer is actually shown
          this.directlyShowElements();
          
          // Then send the message with a small delay
          setTimeout(() => {
            this.respondToUser("I've found these sandals that would be perfect for you! What do you think?");
            
            // Highlight the product in the 3D scene if possible
            this.highlightProductInScene();
            
            // Reset the flag
            this.isSearchingProduct = false;
          }, 1000); // Longer delay to ensure UI is visible
        }, 2000);
      }, 2000);
    }, 2000);
  }
  
  highlightProductInScene() {
    // Try to find and highlight the product in the scene
    const mainCard = document.querySelector('#main-card');
    const productModel = document.querySelector('[gltf-model="#shoe-model"]');
    
    // Highlight the main card if it exists
    if (mainCard) {
      console.log('Highlighting main product card');
      // Create a temp highlight animation
      mainCard.setAttribute('animation__highlight', {
        property: 'scale',
        to: '1.1 1.1 1.1',
        dur: 1000,
        easing: 'easeOutElastic'
      });
      
      // Reset after animation
      setTimeout(() => {
        mainCard.setAttribute('animation__reset', {
          property: 'scale',
          to: '1 1 1',
          dur: 1000,
          easing: 'easeOutElastic'
        });
      }, 3000);
    }
    
    // Highlight the 3D model if it exists
    if (productModel) {
      console.log('Highlighting 3D product model');
      // Get the parent entity to animate it
      const modelEntity = productModel.closest('a-entity');
      if (modelEntity) {
        // Save original scale
        const originalScale = modelEntity.getAttribute('scale');
        
        // Animate scale up
        modelEntity.setAttribute('animation__pulse', {
          property: 'scale',
          to: `${originalScale.x * 1.2} ${originalScale.y * 1.2} ${originalScale.z * 1.2}`,
          dur: 1000,
          easing: 'easeOutElastic'
        });
        
        // Reset after animation
        setTimeout(() => {
          modelEntity.setAttribute('animation__reset', {
            property: 'scale',
            to: `${originalScale.x} ${originalScale.y} ${originalScale.z}`,
            dur: 1000,
            easing: 'easeOutElastic'
          });
        }, 3000);
      }
    }
  }
  
  respondToUser(message) {
    // Update the speech bubble
    if (this.assistantElement) {
      const speechBubble = this.assistantElement.querySelector('[speech-bubble]');
      if (speechBubble) {
        speechBubble.setAttribute('speech-bubble', `textValue: ${message};`);
      }
    }
    
    // Add to chat
    this.addChatMessage(message, false);
    
    // Speak the message using text-to-speech
    this.speakMessage(message);
    
    // Animate the assistant
    this.animateAssistant();
  }
  
  // New method to handle text-to-speech
  speakMessage(message) {
    // Check if speech synthesis is supported and not already speaking
    if (!this.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser");
      return;
    }
    
    // Cancel any current speech
    this.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Configure voice settings for natural English speech
    utterance.volume = 1.0;
    utterance.rate = 0.95;    // Slightly slower for more natural speech
    utterance.pitch = 1.05;   // Subtle pitch adjustment for clarity
    
    // Explicitly set English locale
    utterance.lang = 'en-US';
    
    // Initialize voice selection
    this.selectNativeEnglishVoice(utterance);
    
    // Set status flags for speaking
    this.isSpeaking = true;
    
    // Add event listeners
    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('Speech finished');
    };
    
    utterance.onerror = (event) => {
      this.isSpeaking = false;
      console.error('Speech error:', event);
    };
    
    // Speak the message
    this.speechSynthesis.speak(utterance);
  }
  
  // Helper method to select a native English voice
  selectNativeEnglishVoice(utterance) {
    // Get all available voices
    const voices = this.speechSynthesis.getVoices();
    
    if (!voices || voices.length === 0) {
      // If no voices available yet, wait for them to load
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        const updatedVoices = this.speechSynthesis.getVoices();
        this.findAndSetNativeVoice(utterance, updatedVoices);
      }, { once: true });
      return;
    }
    
    this.findAndSetNativeVoice(utterance, voices);
  }
  
  // Find and set the best native English voice
  findAndSetNativeVoice(utterance, voices) {
    if (!voices || voices.length === 0) return;
    
    // Log available voices for debugging
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(", "));
    
    // Native English voices by specific name - prioritize known high-quality voices
    const nativeVoiceNames = [
      // Apple voices (very natural)
      'Samantha',    // US female
      'Alex',        // US male
      
      // Microsoft natural voices
      'Microsoft Jessa', // US female
      'Microsoft Guy',  // US male
      'Microsoft Zira', // US female
      'Microsoft David', // US male
      
      // Google natural voices
      'Google US English', // US female
      'Google UK English Female',
      'Google UK English Male'
    ];
    
    // Try to find one of our preferred native voices
    let selectedVoice = null;
    
    // First try exact US English voices (no accent)
    for (const voiceName of nativeVoiceNames) {
      const match = voices.find(voice => 
        voice.name.includes(voiceName) && 
        (voice.lang === 'en-US' || voice.lang === 'en-GB')
      );
      
      if (match) {
        selectedVoice = match;
        console.log(`Selected native voice: ${match.name} (${match.lang})`);
        break;
      }
    }
    
    // If no preferred voice found, try any US English voice
    if (!selectedVoice) {
      const usVoices = voices.filter(voice => 
        voice.lang === 'en-US' && 
        !voice.name.toLowerCase().includes('international')
      );
      
      if (usVoices.length > 0) {
        selectedVoice = usVoices[0];
        console.log(`Selected US voice: ${selectedVoice.name}`);
      }
    }
    
    // Fallback to any English voice if no US voice found
    if (!selectedVoice) {
      const anyEnglishVoice = voices.find(voice => 
        voice.lang.startsWith('en-') && 
        !voice.name.toLowerCase().includes('international')
      );
      
      if (anyEnglishVoice) {
        selectedVoice = anyEnglishVoice;
        console.log(`Selected English voice: ${selectedVoice.name}`);
      }
    }
    
    // Last resort - use any available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
      console.log(`Using default voice: ${selectedVoice.name}`);
    }
    
    // Set the selected voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }
  
  animateAssistant() {
    if (this.assistantElement) {
      // Scale up and down animation
      this.assistantElement.setAttribute('scale', '1.2 1.2 1.2');
      
      setTimeout(() => {
        this.assistantElement.setAttribute('scale', '1 1 1');
      }, 2000);
    }
  }

  startListening() {
    if (!this.recognition) return;
    
    try {
      this.recognition.start();
      this.shouldBeListening = true;
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      
      // If we get an error because it's already running, that's ok
      if (e.name === 'InvalidStateError') {
        console.log('Recognition already running, continuing...');
      }
    }
  }

  stopListening() {
    if (!this.recognition) return;
    
    try {
      this.recognition.stop();
      this.shouldBeListening = false;
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
    }
  }

  checkForWakeWords(transcript) {
    // First, check for exact matches
    if (this.wakeWords.some(wakeWord => transcript.includes(wakeWord))) {
      return true;
    }
    
    // Simpler fuzzy matching for "hey webby" variations
    if (transcript.includes('hey') && 
        (transcript.includes('web') || 
         transcript.includes('website') || 
         transcript.includes('webby') || 
         transcript.includes('webbie'))) {
      return true;
    }
    
    return false;
  }

  activateAssistant() {
    this.isActivated = true;
    
    // Make the assistant visible/animated
    if (this.assistantElement) {
      // Find or create the speech bubble
      this.speechBubbleElement = this.assistantElement.querySelector('[speech-bubble]');
      
      if (this.speechBubbleElement) {
        // Update speech bubble text
        this.speechBubbleElement.setAttribute('speech-bubble', 'textValue: Hi Ofir! How can I help you?;');
        
        // Make the assistant more prominent
        this.assistantElement.setAttribute('scale', '1.2 1.2 1.2');
        
        // Reset after a delay
        clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => {
          // Return to normal size
          this.assistantElement.setAttribute('scale', '1 1 1');
        }, 3000);
      }
    } else {
      console.warn('Assistant element not found in the DOM');
    }
    
    // Also show an on-screen notification
    this.showOnScreenNotification("Hi Ofir! How can I help you?");
    
    // Add to chat
    this.addChatMessage("Hi Ofir! How can I help you?", false);
    
    // Speak the activation message
    this.speakMessage("Hi Ofir! How can I help you?");
    
    // Play activation sound
    this.playActivationSound();
    
    // Set a timeout to deactivate if no interaction
    this.resetInactivityTimer();
  }
  
  deactivateAssistant() {
    this.isActivated = false;
    console.log("Assistant deactivated");
    
    // Cancel any ongoing speech
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    
    // Update the speech bubble if it exists
    if (this.speechBubbleElement) {
      this.speechBubbleElement.setAttribute('speech-bubble', 'textValue: Say "Hey Webby" to activate;');
    }
    
    // Show notification
    this.showOnScreenNotification("Assistant deactivated. Say 'Hey Webby' to activate again.");
  }
  
  resetInactivityTimer() {
    // Clear any existing timeout
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    // Set a new timeout - deactivate after 30 seconds of inactivity
    this.inactivityTimer = setTimeout(() => {
      if (this.isActivated) {
        const message = "I'll be here if you need me. Just say 'Hey Webby' again.";
        this.addChatMessage(message, false);
        this.speakMessage(message);
        this.deactivateAssistant();
      }
    }, 30000);
  }
  
  playActivationSound() {
    // Create and play a simple sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2); // A4
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  // Add method to hide card container
  hideCardContainer() {
    console.log('HIDING: Attempting to hide card container and categories');
    
    try {
      // Store current scene state for debugging
      const scene = document.querySelector('a-scene');
      if (scene) {
        // Try direct scene manipulation
        let cardContainer = null;
        let categoriesMenu = null;
        
        // Traverse all entities in the scene
        scene.object3D.traverse((node) => {
          if (node.el && node.el.id === 'card-container') {
            cardContainer = node;
            console.log('HIDING: Found card-container in scene graph');
          }
          if (node.el && node.el.id === 'categories-menu') {
            categoriesMenu = node;
            console.log('HIDING: Found categories-menu in scene graph');
          }
        });
        
        // Hide card container if found
        if (cardContainer) {
          this.originalCardY = cardContainer.position.y;
          console.log('HIDING: Stored original card Y position:', this.originalCardY);
          cardContainer.position.y = -1000; // Move way down
          cardContainer.visible = false;
          console.log('HIDING: Card container hidden via Object3D');
        } else {
          // Fallback to querySelector
          const cardEl = document.querySelector('#card-container');
          if (cardEl && cardEl.object3D) {
            this.originalCardY = cardEl.object3D.position.y;
            console.log('HIDING: Stored original card Y from element:', this.originalCardY);
            cardEl.object3D.position.y = -1000;
            cardEl.object3D.visible = false;
            console.log('HIDING: Card container hidden via element Object3D');
          } else {
            console.warn('HIDING: Could not find card container in any form');
          }
        }
        
        // Hide categories menu if found
        if (categoriesMenu) {
          this.originalCategoriesY = categoriesMenu.position.y;
          console.log('HIDING: Stored original categories Y position:', this.originalCategoriesY);
          categoriesMenu.position.y = -1000; // Move way down
          categoriesMenu.visible = false;
          console.log('HIDING: Categories menu hidden via Object3D');
        } else {
          // Fallback to querySelector
          const categoriesEl = document.querySelector('#categories-menu');
          if (categoriesEl && categoriesEl.object3D) {
            this.originalCategoriesY = categoriesEl.object3D.position.y;
            console.log('HIDING: Stored original categories Y from element:', this.originalCategoriesY);
            categoriesEl.object3D.position.y = -1000;
            categoriesEl.object3D.visible = false;
            console.log('HIDING: Categories menu hidden via element Object3D');
          } else {
            console.warn('HIDING: Could not find categories menu in any form');
          }
        }
      } else {
        console.warn('HIDING: Could not find A-Frame scene!');
      }
    } catch (error) {
      console.error('HIDING: Error hiding elements:', error);
    }
  }
  
  // Add method to show card container
  showCardContainer() {
    console.log('SHOWING: Attempting to show card container and categories');
    
    try {
      // Force a direct DOM update first
      this.forceUpdateEntities();
      
      // Handle card container
      this.showEntityById('card-container', 3, this.originalCardY || 1.5, -5);
      
      // After a small delay, show categories
      setTimeout(() => {
        this.showEntityById('categories-menu', 2, this.originalCategoriesY || 1.5, -2);
        
        // Highlight the "shoes" category after a delay
        setTimeout(() => {
          this.highlightShoesCategory();
        }, 1000);
      }, 800);
    } catch (error) {
      console.error('SHOWING: Error showing elements:', error);
    }
  }
  
  // Helper to force update all entities
  forceUpdateEntities() {
    // Get the scene
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    
    // Try to force a scene update
    if (typeof scene.object3D.updateMatrixWorld === 'function') {
      scene.object3D.updateMatrixWorld(true);
      console.log('SHOWING: Forced scene matrix update');
    }
    
    // Force redraw by toggling a dummy property
    scene.setAttribute('dummy', Math.random().toString());
    
    // Try to set a needsUpdate flag on materials if possible
    scene.object3D.traverse((node) => {
      if (node.material && typeof node.material.needsUpdate === 'boolean') {
        node.material.needsUpdate = true;
      }
    });
  }
  
  // Helper to show entity by ID
  showEntityById(id, defaultX, defaultY, defaultZ) {
    console.log(`SHOWING: Attempting to show entity #${id}`);
    
    // Try direct scene traversal first
    const scene = document.querySelector('a-scene');
    if (scene) {
      let found = false;
      
      // Traverse all entities in the scene
      scene.object3D.traverse((node) => {
        if (!found && node.el && node.el.id === id) {
          // Reset position and make visible
          node.position.set(defaultX, defaultY, defaultZ);
          node.visible = true;
          console.log(`SHOWING: Made ${id} visible via direct traversal`);
          found = true;
          
          // Force component updates
          if (node.el.components) {
            Object.values(node.el.components).forEach(component => {
              if (typeof component.update === 'function') {
                try {
                  component.update();
                } catch (e) {
                  // Ignore errors in component updates
                }
              }
            });
          }
        }
      });
      
      if (!found) {
        // Fallback to querySelector
        const element = document.querySelector(`#${id}`);
        if (element) {
          // Use A-Frame API
          element.setAttribute('position', `${defaultX} ${defaultY} ${defaultZ}`);
          element.setAttribute('visible', true);
          
          // Also set via Object3D for reliability
          if (element.object3D) {
            element.object3D.position.set(defaultX, defaultY, defaultZ);
            element.object3D.visible = true;
          }
          
          console.log(`SHOWING: Made ${id} visible via querySelector`);
          
          // Add animation to ensure visibility
          element.setAttribute('animation__appear', {
            property: 'scale',
            from: '0.95 0.95 0.95',
            to: '1 1 1',
            dur: 300,
            easing: 'easeOutQuad'
          });
        } else {
          console.warn(`SHOWING: Could not find element #${id}`);
        }
      }
    } else {
      console.warn('SHOWING: No A-Frame scene found!');
    }
  }

  // Last resort direct DOM manipulation
  directlyShowElements() {
    try {
      console.log('DIRECT: Attempting direct DOM manipulation');
      
      const cardContainer = document.querySelector('#card-container');
      if (cardContainer) {
        // Update DOM style directly
        cardContainer.style.display = '';
        cardContainer.style.opacity = '1';
        cardContainer.style.visibility = 'visible';
        
        // Position via direct DOM
        const x = 3, y = 1.5, z = -5;
        cardContainer.setAttribute('position', `${x} ${y} ${z}`);
        
        // If object3D exists, set its properties too
        if (cardContainer.object3D) {
          cardContainer.object3D.position.set(x, y, z);
          cardContainer.object3D.visible = true;
          cardContainer.object3D.scale.set(1, 1, 1);
        }
        
        console.log('DIRECT: Applied direct styles to card-container');
      }
      
      const categoriesMenu = document.querySelector('#categories-menu');
      if (categoriesMenu) {
        // Update DOM style directly
        categoriesMenu.style.display = '';
        categoriesMenu.style.opacity = '1';
        categoriesMenu.style.visibility = 'visible';
        
        // Position via direct DOM
        const x = 2, y = 1.5, z = -2;
        categoriesMenu.setAttribute('position', `${x} ${y} ${z}`);
        
        // If object3D exists, set its properties too
        if (categoriesMenu.object3D) {
          categoriesMenu.object3D.position.set(x, y, z);
          categoriesMenu.object3D.visible = true;
          categoriesMenu.object3D.scale.set(1, 1, 1);
        }
        
        console.log('DIRECT: Applied direct styles to categories-menu');
      }
      
      // Force overall scene update
      const scene = document.querySelector('a-scene');
      if (scene && scene.object3D) {
        scene.object3D.updateMatrixWorld(true);
      }
    } catch (error) {
      console.error('DIRECT: Error during direct manipulation:', error);
    }
  }
  
  highlightShoesCategory() {
    // Find the shoes button in the categories menu
    const shoesButton = document.querySelector('#shoes-button');
    if (shoesButton) {
      // Get the rounded button inside it
      const roundedButton = shoesButton.querySelector('a-rounded');
      if (roundedButton) {
        // Highlight the button
        roundedButton.setAttribute('color', '#ffffff');
        roundedButton.setAttribute('opacity', '0.8');
        
        // Add pulse animation
        roundedButton.setAttribute('animation__pulse', {
          property: 'opacity',
          from: 0.8,
          to: 0.3,
          dur: 1000,
          dir: 'alternate',
          loop: 3,
          easing: 'easeInOutSine'
        });
      }
    }
  }
}

// Add CSS for chat animations
function addChatStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { 
        opacity: 0;
        transform: translateY(10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .chat-message {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
      box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
  `;
  document.head.appendChild(style);
}

// A-Frame component for the speech bubble
// Only register it if it doesn't already exist
if (typeof AFRAME !== 'undefined' && !AFRAME.components['speech-bubble']) {
  console.log('Registering speech-bubble component');
  AFRAME.registerComponent('speech-bubble', {
    schema: {
      width: { type: 'number', default: 0.4 },
      height: { type: 'number', default: 0.15 },
      color: { type: 'color', default: '#333333' },
      textValue: { type: 'string', default: 'Hello!' },
      textColor: { type: 'color', default: '#FFFFFF' },
      offset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
      pointerSide: { type: 'string', default: 'bottom' }
    },
    
    init: function() {
      this.createSpeechBubble();
    },
    
    update: function() {
      // Remove old entities when the component data changes
      if (this.bubble) {
        this.bubble.parentNode.removeChild(this.bubble);
      }
      if (this.text) {
        this.text.parentNode.removeChild(this.text);
      }
      if (this.pointer) {
        this.pointer.parentNode.removeChild(this.pointer);
      }
      
      // Create speech bubble with updated data
      this.createSpeechBubble();
    },
    
    createSpeechBubble: function() {
      const data = this.data;
      
      // Create the bubble background
      this.bubble = document.createElement('a-rounded');
      this.bubble.setAttribute('width', data.width);
      this.bubble.setAttribute('height', data.height);
      this.bubble.setAttribute('radius', '0.03');
      this.bubble.setAttribute('color', data.color);
      this.bubble.setAttribute('position', data.offset);
      
      // Create the text
      this.text = document.createElement('a-entity');
      this.text.setAttribute('position', `${data.offset.x} ${data.offset.y} ${data.offset.z + 0.001}`);
      this.text.setAttribute('text', {
        value: data.textValue,
        color: data.textColor,
        width: data.width * 1.5,
        align: 'center',
        wrapCount: 20,
        baseline: 'center',
        font: 'https://cdn.aframe.io/examples/ui/Viga-Regular.json'
      });
      
      // Create the pointer
      this.pointer = document.createElement('a-entity');
      let pointerPosition;
      
      if (data.pointerSide === 'bottom') {
        pointerPosition = `${data.offset.x} ${data.offset.y - data.height/2} ${data.offset.z}`;
        this.pointer.setAttribute('geometry', {
          primitive: 'triangle',
          vertexA: '0 0 0',
          vertexB: '-0.05 -0.05 0',
          vertexC: '0.05 -0.05 0'
        });
      } else if (data.pointerSide === 'right') {
        pointerPosition = `${data.offset.x + data.width/2} ${data.offset.y} ${data.offset.z}`;
        this.pointer.setAttribute('geometry', {
          primitive: 'triangle',
          vertexA: '0 0 0',
          vertexB: '0.05 0.05 0',
          vertexC: '0.05 -0.05 0'
        });
      }
      
      this.pointer.setAttribute('position', pointerPosition);
      this.pointer.setAttribute('material', `color: ${data.color}`);
      
      // Add all elements to the entity
      this.el.appendChild(this.bubble);
      this.el.appendChild(this.text);
      this.el.appendChild(this.pointer);
    }
  });
} else if (typeof AFRAME !== 'undefined') {
  console.log('speech-bubble component already registered');
}

// Initialize the voice assistant when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add styles
  addChatStyles();
  
  // Make sure A-Frame is initialized first if we're in a A-Frame scene
  if (document.querySelector('a-scene')) {
    document.querySelector('a-scene').addEventListener('loaded', () => {
      window.voiceAssistant = new VoiceAssistant();
    });
  } else {
    // If not using A-Frame, just initialize directly
    window.voiceAssistant = new VoiceAssistant();
  }
}); 
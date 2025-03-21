import { checkLoveCompatibility, getSavedResult, saveResult, clearSavedResult, saveHistory, getHistory, clearSavedResults } from './loveChecker.js';

document.addEventListener('DOMContentLoaded', () => {
  // Simplified audio initialization with better error handling
  const backgroundMusic = document.getElementById('backgroundMusic');
  const meterFill = document.querySelector('.meter-fill');
  const meterPercentage = document.querySelector('.meter-percentage');
  const resultMessage = document.querySelector('.result-message');
  const historyPanel = document.querySelector('.history-panel');
  const particlesContainer = document.getElementById('particles-container');
  
  const nameInput1 = document.getElementById('name1');
  const nameInput2 = document.getElementById('name2');
  const calculateButton = document.querySelector('.calculate-button');
  const historyList = document.querySelector('.history-list');
  const closeHistoryButton = document.querySelector('.close-history');
  const clearHistoryButton = document.querySelector('.clear-history-button');
  const historyToggleButton = document.querySelector('.history-toggle');
  const resetButton = document.querySelector('.reset-button');
  const devOptionsButton = document.querySelector('.dev-options-button');
  let imagePopup = null;

  backgroundMusic.volume = 0.7; // Increase volume a bit
  
  function resetBackgroundMusic() {
    backgroundMusic.src = "videoplayback 5.mp3";
  }
  
  function loadSavedMusic() {
    // Default music
    backgroundMusic.src = "videoplayback 5.mp3";
  }
  
  // Load DOM elements first, then load audio
  backgroundMusic.volume = 0.7;
  
  function initAudio() {
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.log("Audio play failed, trying again:", e);
        // Add a user interaction handler to start audio
        document.body.addEventListener('click', function audioStarter() {
          backgroundMusic.play().catch(err => console.log("Still can't play audio:", err));
          document.body.removeEventListener('click', audioStarter);
        }, { once: true });
      });
    }
  }
  
  // Try to play immediately and after a delay to increase chances of success
  initAudio();
  setTimeout(initAudio, 1000);
  
  // Use the Page Visibility API more efficiently
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      backgroundMusic.pause();
    } else if (document.visibilityState === 'visible') {
      backgroundMusic.play().catch(() => {});
    }
  });
  
  // Add user interaction event to ensure audio plays on mobile
  document.addEventListener('touchstart', function audioTouchStarter() {
    backgroundMusic.play().catch(e => console.log("Touch audio start failed:", e));
    document.removeEventListener('touchstart', audioTouchStarter);
  }, { once: true });

  const updateMeter = (percentage) => {
    meterFill.style.width = `${percentage}%`;
    meterPercentage.textContent = `${percentage}%`;

    let message = '';
    if (percentage < 30) {
      message = "Not a great match, maybe try someone else?";
    } else if (percentage < 60) {
      message = "You're okay, but no sparks flying.";
    } else {
      message = "It's a match made in heaven!";
    }
    
    resultMessage.textContent = message;
  };

  const calculateLove = () => {
    const name1 = nameInput1.value.trim();
    const name2 = nameInput2.value.trim();

    if (!name1 || !name2) {
      alert('Please enter both names.');
      return;
    }

    const namesKey = [name1, name2].sort().join('-');
    let lovePercentage = getSavedResult(namesKey);
    
    if (lovePercentage === undefined || lovePercentage === null) {
      lovePercentage = checkLoveCompatibility(name1, name2);
      saveResult(namesKey, lovePercentage);
      saveHistory([name1, name2], lovePercentage);
    }

    updateMeter(lovePercentage);
  };

  function closeImagePopup() {
    if (imagePopup) {
      document.body.removeChild(imagePopup);
      imagePopup = null;
    }
  }

  calculateButton.addEventListener('click', calculateLove);

  resetButton.addEventListener('click', () => {
    nameInput1.value = '';
    nameInput2.value = '';
    meterFill.style.width = '0%';
    meterPercentage.textContent = '0%';
    resultMessage.textContent = 'Click to find out!';
    
    // Clear all saved results from localStorage
    clearSavedResults();
    
    // Create reset particles animation effect
    createResetParticles();
  });
  
  // More efficient particle creation with fewer DOM operations
  const createResetParticles = () => {
    const particleCount = 15; 
    const fragment = document.createDocumentFragment();
    const resetRect = resetButton.getBoundingClientRect();
    const centerX = resetRect.left + resetRect.width/2;
    const centerY = resetRect.top + resetRect.height/2;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('reset-particle');
      
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      
      // Random direction
      particle.style.setProperty('--random-x', Math.random() * 160 - 80); 
      particle.style.setProperty('--random-y', Math.random() * 160 - 80); 
      
      fragment.appendChild(particle);
      
      // Remove particle after animation completes
      setTimeout(() => {
        if (particlesContainer.contains(particle)) {
          particlesContainer.removeChild(particle);
        }
      }, 700);
    }
    particlesContainer.appendChild(fragment);
  };
  
  // Event delegation for history panel
  historyToggleButton.addEventListener('click', () => {
    historyPanel.style.display = 'block';
    populateHistory();
  });
  
  closeHistoryButton.addEventListener('click', () => {
    historyPanel.style.display = 'none';
  });

  clearHistoryButton.addEventListener('click', () => {
    localStorage.removeItem('loveHistory');
    historyList.innerHTML = ''; 
  });

  const populateHistory = () => {
    // Only repopulate if the history is visible and empty
    if (historyPanel.style.display === 'block' && !historyList.children.length) {
      const history = getHistory();
      if (history.length > 0) {
        const fragment = document.createDocumentFragment();
        history.forEach((entry) => {
          const historyEntry = document.createElement('li');
          historyEntry.textContent = `${entry.names[0]} and ${entry.names[1]} - ${entry.result}%`;
          fragment.appendChild(historyEntry);
        });
        historyList.innerHTML = '';
        historyList.appendChild(fragment);
      }
    }
  };

  // Add developer options elements
  const settingsButton = document.querySelector('.settings-button');
  const settingsPanel = document.querySelector('.settings-panel');
  const closeSettingsButton = document.querySelector('.close-settings');
  const fontSelector = document.getElementById('font-selector');
  const colorOptions = document.querySelectorAll('.color-option');
  const backgroundImageUpload = document.getElementById('background-image-upload');
  const resetBackgroundButton = document.getElementById('reset-background');
  const customFileUploadButton = document.getElementById('custom-file-upload');

  // Load saved preferences
  loadCustomizationSettings();

  // Custom file upload button functionality
  customFileUploadButton.addEventListener('click', () => {
    backgroundImageUpload.click();
  });
  
  // Update button text after file selection
  backgroundImageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      customFileUploadButton.textContent = file.name;
      const imageURL = URL.createObjectURL(file);
      document.body.style.backgroundImage = `url(${imageURL})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      saveCustomizationSettings('backgroundImage', file.name);
    }
  });

  resetBackgroundButton.addEventListener('click', () => {
    document.body.style.backgroundImage = 'none';
    customFileUploadButton.textContent = 'Choose File';
    const selectedColor = document.querySelector('.color-option.selected');
    if (selectedColor) {
      document.body.style.background = selectedColor.getAttribute('data-gradient');
    } else {
      document.body.style.background = 'linear-gradient(45deg, #ffb3ba, #ff6b6b)';
    }
    let settings = JSON.parse(localStorage.getItem('customizationSettings') || '{}');
    delete settings.backgroundImage;
    localStorage.setItem('customizationSettings', JSON.stringify(settings));
  });

  // Customization event listeners
  settingsButton.addEventListener('click', () => {
    settingsPanel.style.display = 'block';
  });

  closeSettingsButton.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
  });

  fontSelector.addEventListener('change', updateCustomizationSettings);

  function updateCustomizationSettings() {
    const selectedFont = fontSelector.value;
    document.body.style.fontFamily = selectedFont;
    saveCustomizationSettings();
  }

  colorOptions.forEach(option => {
    option.addEventListener('click', updateColorOptions);
  });

  function updateColorOptions() {
    // Remove selected class from all options
    colorOptions.forEach(opt => opt.classList.remove('selected'));
    // Add selected class to clicked option
    this.classList.add('selected');
    
    const gradient = this.getAttribute('data-gradient');
    document.body.style.background = gradient;
    saveCustomizationSettings();
  }

  function saveCustomizationSettings(key, value) {
    let settings = JSON.parse(localStorage.getItem('customizationSettings') || '{}');
    
    if (key && value) {
      settings[key] = value;
    } else {
      // Save all current settings
      settings.font = fontSelector.value;
      const selectedColor = document.querySelector('.color-option.selected');
      if (selectedColor) {
        settings.gradient = selectedColor.getAttribute('data-gradient');
      }
    }
    
    localStorage.setItem('customizationSettings', JSON.stringify(settings));
  }

  function loadCustomizationSettings() {
    const settings = JSON.parse(localStorage.getItem('customizationSettings') || '{}');
    
    // Load font
    if (settings.font) {
      document.body.style.fontFamily = settings.font;
      fontSelector.value = settings.font;
    }
    
    // Load gradient/color
    if (settings.gradient) {
      document.body.style.background = settings.gradient;
      colorOptions.forEach(option => {
        if (option.getAttribute('data-gradient') === settings.gradient) {
          option.classList.add('selected');
        }
      });
    } else {
      // Select first color by default
      colorOptions[0].classList.add('selected');
    }
    
    // Load background image if exists
    if (settings.backgroundImage) {
      try {
        // Attempt to retrieve file from local storage
        const fileInput = document.getElementById('background-image-upload');
        if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const imageURL = URL.createObjectURL(file);
          document.body.style.backgroundImage = `url(${imageURL})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
        } else {
          document.body.style.backgroundImage = 'none';
          customFileUploadButton.textContent = 'Choose File';
          const selectedColor = document.querySelector('.color-option.selected');
          if (selectedColor) {
            document.body.style.background = selectedColor.getAttribute('data-gradient');
          } else {
            document.body.style.background = 'linear-gradient(45deg, #ffb3ba, #ff6b6b)';
          }
        }
      } catch (e) {
        console.error("Error loading custom background image:", e);
        document.body.style.backgroundImage = 'none';
        customFileUploadButton.textContent = 'Choose File';
        const selectedColor = document.querySelector('.color-option.selected');
        if (selectedColor) {
          document.body.style.background = selectedColor.getAttribute('data-gradient');
        } else {
          document.body.style.background = 'linear-gradient(45deg, #ffb3ba, #ff6b6b)';
        }
      }
    }
  }

  // Load all customizations
  loadCustomizationSettings();
  loadSavedMusic();
});
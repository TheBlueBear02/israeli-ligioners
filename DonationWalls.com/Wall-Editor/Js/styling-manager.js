// Styling Manager - Handles color palettes and font management
class StylingManager {
  constructor() {
    this.currentPalette = 'colorful';
    this.currentFont = 'Arial';
    this.currentFontWeight = '400';
    this.initializePalettes();
  }

  // Color palette definitions
  initializePalettes() {
    this.paletteDefs = {
      colorful: {
        color: [
          '#4facfe', // blue
          '#ff6b81', // pink/red
          '#43ea7c', // green
          '#ffd600', // yellow
          '#7c4dff', // purple
          '#00e676', // teal
          '#fa3979', // magenta
          '#2196f3', // light blue
          '#ffb300', // orange
          '#00bcd4', // cyan
          '#ff1100', // red
          '#1976d2', // deep blue
        ],
        backgroundColor: '#fff',
      },
      black: {
        color: [
          '#111', '#222', '#333', '#444', '#555', '#666', '#888', '#aaa'
        ],
        backgroundColor: '#fff',
      },
      blue: {
        color: [
          '#1565c0', '#1976d2', '#1e88e5', '#2196f3', '#42a5f5', '#64b5f6', '#1976d2', '#1565c0'
        ],
        backgroundColor: '#fff',
      },
      pink: {
        color: [
          '#ad1457', '#c2185b', '#d81b60', '#e91e63', '#ec407a', '#f06292', '#d81b60', '#ad1457'
        ],
        backgroundColor: '#fff',
      },
      green: {
        color: [
          '#00695c', '#00897b', '#26a69a', '#43ea7c', '#66bb6a', '#81c784', '#26a69a', '#00695c'
        ],
        backgroundColor: '#fff',
      },
      red: {
        color: [
          '#b71c1c', '#c62828', '#d32f2f', '#e53935', '#f44336', '#ff1744', '#e57373', '#ff8a80'
        ],
        backgroundColor: '#fff',
      },
    };
  }

  // Get current palette
  getCurrentPalette() {
    return this.currentPalette;
  }

  // Get palette definitions
  getPaletteDefs() {
    return this.paletteDefs;
  }

  // Set current palette
  setPalette(palette) {
    this.currentPalette = palette;
  }

  // Get current font
  getCurrentFont() {
    return this.currentFont;
  }

  // Set current font
  setFont(fontFamily) {
    this.currentFont = fontFamily;
    this.ensureFontLoaded(fontFamily);
    this.saveFontToStorage(fontFamily);
  }

  // Get current font weight
  getCurrentFontWeight() {
    return this.currentFontWeight;
  }

  // Set current font weight
  setFontWeight(weight) {
    this.currentFontWeight = weight;
    this.saveFontWeightToStorage(weight);
  }

  // Load font settings from localStorage
  loadFontSettings() {
    try {
      this.currentFont = localStorage.getItem('wall.currentFont') || 'Arial';
      this.currentFontWeight = localStorage.getItem('wall.currentFontWeight') || '400';
    } catch (e) {
      this.currentFont = 'Arial';
      this.currentFontWeight = '400';
    }
  }

  // Save font to localStorage
  saveFontToStorage(fontFamily) {
    try {
      localStorage.setItem('wall.currentFont', fontFamily);
    } catch (e) {
      console.warn('Could not save font to localStorage:', e);
    }
  }

  // Save font weight to localStorage
  saveFontWeightToStorage(weight) {
    try {
      localStorage.setItem('wall.currentFontWeight', weight);
    } catch (e) {
      console.warn('Could not save font weight to localStorage:', e);
    }
  }

  // Ensure Google Fonts are loaded
  ensureFontLoaded(fontFamily) {
    const googleFonts = {
      'Roboto': 'Roboto:400,500,700',
      'Montserrat': 'Montserrat:400,500,700',
      'Open Sans': 'Open+Sans:400,600,700',
      'Rubik Spray Paint': 'Rubik+Spray+Paint:400',
      'Permanent Marker': 'Permanent+Marker:400'
    };
    
    if (googleFonts[fontFamily]) {
      const id = 'gf-' + fontFamily.replace(/\s+/g, '-');
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=' + googleFonts[fontFamily] + '&display=swap';
        document.head.appendChild(link);
      }
    }
  }

  // Initialize fonts on load
  initializeFonts() {
    this.loadFontSettings();
    this.ensureFontLoaded(this.currentFont);
  }
}

// Export for use in other modules
window.StylingManager = StylingManager;

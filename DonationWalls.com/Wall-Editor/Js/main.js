// Main Application Controller - Coordinates all modules
class DonationWallApp {
  constructor() {
    this.wordCloudManager = null;
    this.dataManager = null;
    this.uiController = null;
    this.stylingManager = null;
    this.utils = null;
    this.initialized = false;
  }

  // Initialize the application
  async init() {
    try {
      // Initialize all managers
      this.utils = new Utils();
      this.stylingManager = new StylingManager();
      this.dataManager = new DataManager();
      this.wordCloudManager = new WordCloudManager();
      this.uiController = new UIController();

      // Load initial data
      this.loadInitialData();
      
      // Initialize styling
      this.stylingManager.initializeFonts();
      
      // Set initial UI states
      this.uiController.setInitialStates(
        this.stylingManager.getCurrentFont(),
        this.stylingManager.getCurrentFontWeight(),
        this.stylingManager.getCurrentPalette(),
        this.wordCloudManager.getCurrentShape()
      );

      // Create initial wordcloud
      this.wordCloudManager.createWordCloudCanvas();
      this.wordCloudManager.setFont(this.stylingManager.getCurrentFont());
      this.wordCloudManager.setFontWeight(this.stylingManager.getCurrentFontWeight());
      this.wordCloudManager.setPalette(this.stylingManager.getCurrentPalette());
      this.wordCloudManager.setShape('cloud');
      this.wordCloudManager.createWordCloud(
        this.dataManager.getDonors(),
        this.stylingManager.getPaletteDefs()
      );

      // Update stats
      this.dataManager.updateStats();

      // Setup event listeners
      this.setupEventListeners();

      this.initialized = true;
      console.log('Donation Wall App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Donation Wall App:', error);
    }
  }

  // Load initial donor data
  loadInitialData() {
    // Check if donors data is available globally (from donors-data.js)
    if (typeof donors !== 'undefined' && Array.isArray(donors)) {
      this.dataManager.setDonors(donors);
    } else {
      // Fallback: create some sample data
      const sampleDonors = [];
      for (let i = 0; i < 10; i++) {
        sampleDonors.push(this.utils.generateRandomDonor());
      }
      this.dataManager.setDonors(sampleDonors);
    }
  }

  // Setup event listeners for inter-module communication
  setupEventListeners() {
    // Add donors event
    document.addEventListener('addDonors', (event) => {
      const count = event.detail;
      this.dataManager.addMultipleDonors(
        count,
        () => this.utils.getRandomName(),
        () => this.utils.getRandomAmount()
      );
      this.updateDisplay();
    });

    // Remove donors event
    document.addEventListener('removeDonors', (event) => {
      const count = event.detail;
      this.dataManager.removeMultipleDonors(count);
      this.updateDisplay();
    });

    // Font changed event
    document.addEventListener('fontChanged', (event) => {
      const fontFamily = event.detail;
      this.stylingManager.setFont(fontFamily);
      this.wordCloudManager.setFont(fontFamily);
      this.updateWordCloud();
    });

    // Font weight changed event
    document.addEventListener('fontWeightChanged', (event) => {
      const weight = event.detail;
      this.stylingManager.setFontWeight(weight);
      this.wordCloudManager.setFontWeight(weight);
      this.updateWordCloud();
    });

    // Palette changed event
    document.addEventListener('paletteChanged', (event) => {
      const palette = event.detail;
      this.stylingManager.setPalette(palette);
      this.wordCloudManager.setPalette(palette);
      this.updateWordCloud();
    });

    // Shape changed event
    document.addEventListener('shapeChanged', (event) => {
      const shape = event.detail;
      this.wordCloudManager.setShape(shape);
      // Keep ellipticity at 1 for true circle; others can stay default
      this.wordCloudManager.setEllipticity(1);
      this.updateWordCloud();
    });
  }

  // Update the display (wordcloud and stats)
  updateDisplay() {
    this.updateWordCloud();
    this.dataManager.updateStats();
  }

  // Update only the wordcloud
  updateWordCloud() {
    this.wordCloudManager.updateWordCloud(
      this.dataManager.getDonors(),
      this.stylingManager.getPaletteDefs()
    );
  }

  // Get application state
  getState() {
    return {
      donors: this.dataManager.getDonors(),
      currentFont: this.stylingManager.getCurrentFont(),
      currentFontWeight: this.stylingManager.getCurrentFontWeight(),
      currentPalette: this.stylingManager.getCurrentPalette(),
      initialized: this.initialized
    };
  }

  // Add a single donor
  addDonor(name, amount) {
    this.dataManager.addDonor(name, amount);
    this.updateDisplay();
  }

  // Remove the last donor
  removeLastDonor() {
    const removed = this.dataManager.removeLastDonor();
    if (removed) {
      this.updateDisplay();
    }
    return removed;
  }

  // Get total amount raised
  getTotalAmount() {
    return this.dataManager.getDonors().reduce((sum, d) => sum + d.amount, 0);
  }

  // Get total number of donors
  getTotalDonors() {
    return this.dataManager.getDonors().length;
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.donationWallApp = new DonationWallApp();
  window.donationWallApp.init();
});

// Export for use in other modules
window.DonationWallApp = DonationWallApp;

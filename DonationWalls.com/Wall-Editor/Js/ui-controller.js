// UI Controller - Handles menu management and button interactions
class UIController {
  constructor() {
    this.activeMenus = new Set();
    this.initializeButtons();
  }

  // Initialize all button event listeners
  initializeButtons() {
    this.setupAddButtons();
    this.setupRemoveButtons();
    this.setupFontButtons();
    this.setupFontWeightButtons();
    this.setupPaletteButtons();
    this.setupShapeButtons();
    this.setupPaymentServiceButtons();
    this.setupGlobalClickHandler();
  }

  // Setup add donation buttons
  setupAddButtons() {
    const addRandomBtn = document.getElementById('add-random-btn');
    
    addRandomBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeAllMenus();
      addRandomBtn.classList.toggle('add-menu-active');
      if (addRandomBtn.classList.contains('add-menu-active')) {
        this.activeMenus.add('add');
      } else {
        this.activeMenus.delete('add');
      }
    };

    // Add single donation
    document.getElementById('add-single-btn').onclick = (e) => {
      e.stopPropagation();
      this.triggerEvent('addDonors', 1);
    };
    
    // Add multiple donations (5)
    document.getElementById('add-multiple-btn').onclick = (e) => {
      e.stopPropagation();
      this.triggerEvent('addDonors', 5);
    };
    
    // Add bulk donations (10)
    document.getElementById('add-bulk-btn').onclick = (e) => {
      e.stopPropagation();
      this.triggerEvent('addDonors', 10);
    };
    
    // Add large donations (25)
    document.getElementById('add-large-btn').onclick = (e) => {
      e.stopPropagation();
      this.triggerEvent('addDonors', 25);
    };
  }

  // Setup remove donation buttons
  setupRemoveButtons() {
    const removeLastBtn = document.getElementById('remove-last-btn');
    
    removeLastBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeAllMenus();
      removeLastBtn.classList.toggle('remove-menu-active');
      if (removeLastBtn.classList.contains('remove-menu-active')) {
        this.activeMenus.add('remove');
      } else {
        this.activeMenus.delete('remove');
      }
    };
    
    // Remove single donation
    document.getElementById('remove-single-btn').onclick = (e) => {
      e.stopPropagation();
      this.triggerEvent('removeDonors', 1);
    };
    
    // Remove multiple donations (5)
    document.getElementById('remove-multiple-btn').onclick = (e) => {
      e.stopPropagation();
      this.triggerEvent('removeDonors', 5);
    };
    
    // Remove bulk donations (10)
    document.getElementById('remove-bulk-btn').onclick = (e) => {
      e.stopPropagation();
      this.triggerEvent('removeDonors', 10);
    };
    
    // Remove large donations (25)
    document.getElementById('remove-large-btn').onclick = (e) => {
      e.stopPropagation();
      this.triggerEvent('removeDonors', 25);
    };
  }

  // Setup font selection buttons
  setupFontButtons() {
    const fontBtn = document.getElementById('font-btn');
    const fontOptions = document.querySelectorAll('.font-option');

    fontBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeAllMenus();
      fontBtn.classList.toggle('font-active');
      if (fontBtn.classList.contains('font-active')) {
        this.activeMenus.add('font');
      } else {
        this.activeMenus.delete('font');
      }
    };

    fontOptions.forEach(opt => {
      opt.onclick = (e) => {
        e.stopPropagation();
        fontOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const fontFamily = opt.getAttribute('data-font');
        this.triggerEvent('fontChanged', fontFamily);
        // Removed the lines that close the popup
      };
    });
  }

  // Setup font weight selection buttons
  setupFontWeightButtons() {
    const fontWeightBtn = document.getElementById('font-weight-btn');
    const fontWeightOptions = document.querySelectorAll('.font-weight-option');

    fontWeightBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeAllMenus();
      fontWeightBtn.classList.toggle('font-weight-active');
      if (fontWeightBtn.classList.contains('font-weight-active')) {
        this.activeMenus.add('fontWeight');
      } else {
        this.activeMenus.delete('fontWeight');
      }
    };

    fontWeightOptions.forEach(opt => {
      opt.onclick = (e) => {
        e.stopPropagation();
        fontWeightOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const weight = opt.getAttribute('data-weight');
        this.triggerEvent('fontWeightChanged', weight);
        // Removed the lines that close the popup
      };
    });
  }

  // Setup color palette buttons
  setupPaletteButtons() {
    const paletteBtn = document.getElementById('palette-btn');
    const paletteColors = document.querySelectorAll('#palette-popup .menu-button');

    paletteBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeAllMenus();
      paletteBtn.classList.toggle('palette-active');
      if (paletteBtn.classList.contains('palette-active')) {
        this.activeMenus.add('palette');
      } else {
        this.activeMenus.delete('palette');
      }
    };

    paletteColors.forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        paletteColors.forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        const palette = el.getAttribute('data-palette');
        this.triggerEvent('paletteChanged', palette);
        // Removed the lines that close the popup
      };
    });
  }

  // Setup shape selection buttons
  setupShapeButtons() {
    const shapeBtn = document.getElementById('shape-btn');
    const shapeOptions = document.querySelectorAll('.shape-option');

    if (!shapeBtn) return;

    shapeBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeAllMenus();
      shapeBtn.classList.toggle('shape-active');
      if (shapeBtn.classList.contains('shape-active')) {
        this.activeMenus.add('shape');
      } else {
        this.activeMenus.delete('shape');
      }
    };

    shapeOptions.forEach(opt => {
      opt.onclick = (e) => {
        e.stopPropagation();
        shapeOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const shape = opt.getAttribute('data-shape');
        this.triggerEvent('shapeChanged', shape);
        // keep popup open similar to font-weight behavior
      };
    });
  }

  // Setup payment service selection buttons
  setupPaymentServiceButtons() {
    const paymentServiceBtn = document.getElementById('payment-service-btn');
    const paymentOptions = document.querySelectorAll('.payment-option');

    if (!paymentServiceBtn) return;

    paymentServiceBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeAllMenus();
      paymentServiceBtn.classList.toggle('payment-active');
      if (paymentServiceBtn.classList.contains('payment-active')) {
        this.activeMenus.add('payment');
      } else {
        this.activeMenus.delete('payment');
      }
    };

    paymentOptions.forEach(opt => {
      opt.onclick = (e) => {
        e.stopPropagation();
        paymentOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const service = opt.getAttribute('data-service');
        this.triggerEvent('paymentServiceChanged', service);
        // Keep popup open similar to other dropdowns
      };
    });
  }

  // Setup global click handler to close menus
  setupGlobalClickHandler() {
    document.body.addEventListener('click', () => {
      this.closeAllMenus();
    });
  }

  // Close all active menus
  closeAllMenus() {
    document.getElementById('add-random-btn').classList.remove('add-menu-active');
    document.getElementById('remove-last-btn').classList.remove('remove-menu-active');
    document.getElementById('font-btn').classList.remove('font-active');
    document.getElementById('font-weight-btn').classList.remove('font-weight-active');
    document.getElementById('palette-btn').classList.remove('palette-active');
    const shapeBtn = document.getElementById('shape-btn');
    if (shapeBtn) shapeBtn.classList.remove('shape-active');
    const paymentServiceBtn = document.getElementById('payment-service-btn');
    if (paymentServiceBtn) paymentServiceBtn.classList.remove('payment-active');
    this.activeMenus.clear();
  }

  // Set initial selected states
  setInitialStates(currentFont, currentFontWeight, currentPalette, currentShape) {
    // Set font selection
    const fontOptions = document.querySelectorAll('.font-option');
    fontOptions.forEach(opt => {
      if (opt.getAttribute('data-font') === currentFont) {
        opt.classList.add('selected');
      }
    });

    // Set font weight selection
    const fontWeightOptions = document.querySelectorAll('.font-weight-option');
    fontWeightOptions.forEach(opt => {
      if (opt.getAttribute('data-weight') === currentFontWeight) {
        opt.classList.add('selected');
      }
    });

    // Set palette selection
    const paletteColors = document.querySelectorAll('#palette-popup .menu-button');
    paletteColors.forEach(el => {
      if (el.getAttribute('data-palette') === currentPalette) {
        el.classList.add('selected');
      }
    });

    // Set shape selection
    const shapeOptions = document.querySelectorAll('.shape-option');
    shapeOptions.forEach(opt => {
      if (opt.getAttribute('data-shape') === currentShape) {
        opt.classList.add('selected');
      }
    });
  }

  // Trigger custom events for communication with other modules
  triggerEvent(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }
}

// Export for use in other modules
window.UIController = UIController;

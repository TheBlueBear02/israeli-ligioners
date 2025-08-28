// WordCloud Manager - Handles canvas creation and wordcloud generation
class WordCloudManager {
  constructor() {
    this.canvas = null;
    this.currentFont = 'Georgia';
    this.currentFontWeight = '400';
    this.currentPalette = 'black';
    this.currentShape = 'cloud';
    this.currentEllipticity = 1;
  }

  // Function to create and configure the wordcloud canvas
  createWordCloudCanvas() {
    // Get the existing canvas from the DOM
    const canvas = document.getElementById('wordcloud-canvas');
    if (!canvas) {
      throw new Error('Canvas element with id "wordcloud-canvas" not found in the DOM.');
    }
    this.canvas = canvas;
    // Add branding tag to the parent container if not already present
    const parent = canvas.parentNode;
    this.createBrandingTag(parent);

    return canvas;
  }

  // Function to create branding tag
  createBrandingTag(container) {
    // Prevent duplicate branding tags
    if (container.querySelector('.branding-tag')) return;
    const brandingTag = document.createElement('a');
    brandingTag.className = 'branding-tag';
    brandingTag.href = 'https://donationwalls.com';
    brandingTag.target = '_blank';
    brandingTag.rel = 'noopener noreferrer';
    brandingTag.textContent = 'Powered by DonationWalls.com';
    brandingTag.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      z-index: 1000;
      transition: opacity 0.3s ease;
    `;
    
    // Add hover effect
    brandingTag.addEventListener('mouseenter', () => {
      brandingTag.style.opacity = '1';
      brandingTag.style.color = 'rgb(255, 255, 255)';
      brandingTag.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      // Hide tooltip when hovering over branding tag
      const tooltip = document.getElementById('tooltip');
      if (tooltip) {
        tooltip.style.opacity = '0';
      }
    });
    
    brandingTag.addEventListener('mouseleave', () => {
      brandingTag.style.opacity = '0.7';
      brandingTag.style.color = 'rgba(255, 255, 255, 0.7)';
    });
    
    // Add branding tag to container
    container.appendChild(brandingTag);
  }

  // Utility to resize canvas to match its displayed size (for crisp rendering)
  resizeCanvasToDisplaySize() {
    const canvas = this.canvas || document.getElementById('wordcloud-canvas');
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    // Use the parent element's width for 100% width
    const parent = canvas.parentElement;
    if (!parent) return;
    const displayWidth = parent.clientWidth;
    // Optionally, set a fixed aspect ratio or use parent height
    const aspectRatio = 500 / 900; // matches your default CSS (height/width)
    const displayHeight = Math.round(displayWidth * aspectRatio);
    // Only resize if necessary
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = displayWidth + 'px';
      canvas.style.height = displayHeight + 'px';
    }
  }

  // Function to create wordcloud with current data and settings
  createWordCloud(donors, paletteDefs) {
    if (!this.canvas) {
      this.createWordCloudCanvas();
    }
    this.resizeCanvasToDisplaySize();

    const wordList = donors.map(d => [d.name, d.amount]);
    const avgAmount = donors.reduce((sum, d) => sum + d.amount, 0) / donors.length;
    
    // Calculate font size parameters
    const minFontSize = 12;
    const maxFontSize = 48;
    const targetAvgFontSize = Math.max(
      minFontSize,
      maxFontSize - donors.length * 0.3
    );
    const baseFont = 5;
    const avgLog = Math.log(avgAmount + 1);
    const multiplier = (targetAvgFontSize - baseFont) / avgLog;
    
    // Get current palette settings
    const palette = paletteDefs[this.currentPalette];
    let colorOption = palette.color;
    if (Array.isArray(colorOption)) {
      colorOption = function() {
        const arr = palette.color;
        return arr[Math.floor(Math.random() * arr.length)];
      };
    }
    
    // Create wordcloud
    const shapeOption = this.currentShape === 'cloud' ? this.cloudShape : this.currentShape;

    WordCloud(document.getElementById('wordcloud-canvas'), {
      list: wordList,
      gridSize: 12,
      shape: shapeOption,
      ellipticity: this.currentEllipticity,
      weightFactor: function (size) {
        return baseFont + Math.log(size + 1) * multiplier;
      },
      fontFamily: this.currentFont,
      fontWeight: this.currentFontWeight,
      color: colorOption,
      rotateRatio: 0,
      rotationSteps: 1,
      backgroundColor: palette.backgroundColor,
      minSize: 8,
      drawOutOfBound: false,
      shuffle: true,
      shrinkToFit: true,
      hover: function(item, dimension, event) {
        const tooltip = document.getElementById('tooltip');
        if (item) {
          const donor = donors.find(d => d.name === item[0]);
          if (donor) {
            tooltip.innerText = `${donor.name}: £${donor.amount}`;
          } else {
            tooltip.innerText = `${item[0]}`;
          }
          tooltip.style.left = (event.clientX + 10) + 'px';
          tooltip.style.top = (event.clientY + 10 + window.scrollY) + 'px';
          tooltip.style.opacity = 1;
        } else {
          tooltip.style.opacity = 0;
        }
      }
    });
  }

  // Custom cloud shape function for wordcloud2.js
  cloudShape(theta) {
    // Enhanced cloud-like profile with more pronounced lobes and irregularity
    const t = theta % (2 * Math.PI);
    const lobe1 = 0.5 + 0.5 * Math.cos(t);
    const lobe2 = 0.5 + 0.5 * Math.cos(2 * t + Math.PI / 4);
    const lobe3 = 0.5 + 0.5 * Math.cos(3 * t + Math.PI / 2);
    const lobe4 = 0.5 + 0.5 * Math.cos(5 * t + Math.PI / 3); // extra lobe for more irregularity
    const lobe5 = 0.5 + 0.5 * Math.cos(7 * t + Math.PI / 5); // extra lobe for more irregularity
    const base = 0.55; // lower base for less circularity
    return base + 0.22 * lobe1 + 0.18 * lobe2 + 0.13 * lobe3 + 0.09 * lobe4 + 0.07 * lobe5;
  }

  // Update wordcloud with current settings
  updateWordCloud(donors, paletteDefs) {
    this.createWordCloud(donors, paletteDefs);
  }

  // Set font family
  setFont(fontFamily) {
    this.currentFont = fontFamily;
  }

  // Set font weight
  setFontWeight(weight) {
    this.currentFontWeight = weight;
  }

  // Set color palette
  setPalette(palette) {
    this.currentPalette = palette;
  }

  // Set shape
  setShape(shape) {
    this.currentShape = shape;
  }

  // Optionally set ellipticity (1 for circle)
  setEllipticity(value) {
    this.currentEllipticity = value;
  }

  setTheme(themeObj) {
    if (themeObj.palette) this.setPalette(themeObj.palette);
    if (themeObj.font) this.setFont(themeObj.font);
    if (themeObj.fontWeight) this.setFontWeight(themeObj.fontWeight);
    if (themeObj.shape) this.setShape(themeObj.shape);
    if (themeObj.ellipticity !== undefined) this.setEllipticity(themeObj.ellipticity);
  }

  getCurrentShape() {
    return this.currentShape;
  }
}

// Export for use in other modules
window.WordCloudManager = WordCloudManager;

// Example theme definitions for use in main.js
window.THEMES = {
  'classic-minimal': {
    palette: 'black',
    font: 'Georgia',
    fontWeight: '400',
    shape: 'circle',
    ellipticity: 1
  },
  'nature': {
    palette: 'green',
    font: 'Verdana',
    fontWeight: '500',
    shape: 'cloud',
    ellipticity: 1
  },
  'corporate': {
    palette: 'blue',
    font: 'Roboto',
    fontWeight: '700',
    shape: 'diamond',
    ellipticity: 1
  },
  'party': {
    palette: 'colorful',
    font: 'Rubik Spray Paint',
    fontWeight: '700',
    shape: 'star',
    ellipticity: 1
  }
};

// Ensure the canvas resizes on window resize
window.addEventListener('resize', function() {
  if (window.donationWallApp && window.donationWallApp.wordCloudManager) {
    window.donationWallApp.wordCloudManager.resizeCanvasToDisplaySize();
    // Optionally, re-render the wordcloud for best results
    if (window.donationWallApp.wordCloudManager.canvas) {
      window.donationWallApp.updateWordCloud && window.donationWallApp.updateWordCloud();
    }
  }
});

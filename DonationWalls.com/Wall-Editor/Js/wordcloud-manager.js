// WordCloud Manager - Handles canvas creation and wordcloud generation
class WordCloudManager {
  constructor() {
    this.canvas = null;
    this.currentFont = 'Verdana';
    this.currentFontWeight = '500';
    this.currentPalette = 'colorful';
    this.currentShape = 'cloud';
    this.currentEllipticity = 1;
  }

  // Function to create and configure the wordcloud canvas
  createWordCloudCanvas() {
    // Create container wrapper
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      display: inline-block;
      width: 1200px;
      height: 650px;
    `;
    
    const canvas = document.createElement('canvas');
    canvas.id = 'wordcloud-canvas';
    canvas.className = 'wall';
    canvas.width = 1200;
    canvas.height = 600;
    canvas.style.display = 'block';
    
    // Add canvas to container
    container.appendChild(canvas);
    
    // Insert container after the stats paragraph
    const statsParagraph = document.querySelector('#header');
    statsParagraph.parentNode.insertBefore(container, statsParagraph.nextSibling);
    
    // Create branding tag
    this.createBrandingTag(container);
    
    this.canvas = canvas;
    return canvas;
  }

  // Function to create branding tag
  createBrandingTag(container) {
    const brandingTag = document.createElement('a');
    brandingTag.href = 'https://donationwalls.com';
    brandingTag.target = '_blank';
    brandingTag.rel = 'noopener noreferrer';
    brandingTag.textContent = 'Powered by DonationWalls.com';
    brandingTag.style.cssText = `
      position: absolute;
      bottom: 0px;
      left: 10px;
      font-size: 18px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      background-color: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      z-index: 1000;
      transition: opacity 0.3s ease;
    `;
    
    // Add hover effect
    brandingTag.addEventListener('mouseenter', () => {
      brandingTag.style.opacity = '1';
      brandingTag.style.color = 'rgba(255, 255, 255, 0.9)';
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

  // Function to create wordcloud with current data and settings
  createWordCloud(donors, paletteDefs) {
    if (!this.canvas) {
      this.createWordCloudCanvas();
    }

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
    // Cloud-like profile using a combination of lobes
    // Map theta [0, 2pi) to radius multiplier [0.6, 1]
    const t = theta % (2 * Math.PI);
    const lobe1 = 0.5 + 0.5 * Math.cos(t);
    const lobe2 = 0.5 + 0.5 * Math.cos(2 * t + Math.PI / 4);
    const lobe3 = 0.5 + 0.5 * Math.cos(3 * t + Math.PI / 2);
    const base = 0.6;
    return base + 0.18 * lobe1 + 0.14 * lobe2 + 0.08 * lobe3;
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

  getCurrentShape() {
    return this.currentShape;
  }
}

// Export for use in other modules
window.WordCloudManager = WordCloudManager;

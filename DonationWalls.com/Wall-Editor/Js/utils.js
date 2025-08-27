// Utils - Helper functions and utilities
class Utils {
  constructor() {
    this.initializeRandomGenerators();
  }

  // Initialize random name and amount generators
  initializeRandomGenerators() {
    // Random names for donors
    this.randomNames = [
      'John Smith', 'Emma Wilson', 'Michael Brown', 'Sarah Davis', 'David Miller',
      'Lisa Garcia', 'James Johnson', 'Jennifer Lee', 'Robert Taylor', 'Amanda White',
      'Christopher Anderson', 'Nicole Martinez', 'Daniel Thompson', 'Stephanie Rodriguez',
      'Matthew Lewis', 'Rebecca Walker', 'Joshua Hall', 'Lauren Allen', 'Andrew Young',
      'Michelle King', 'Kevin Wright', 'Ashley Lopez', 'Brian Hill', 'Kimberly Scott',
      'Steven Green', 'Jessica Adams', 'Timothy Baker', 'Melissa Nelson', 'Jason Carter',
      'Amber Mitchell', 'Ryan Perez', 'Heather Roberts', 'Jacob Turner', 'Danielle Phillips',
      'Gary Campbell', 'Megan Parker', 'Eric Evans', 'Rachel Edwards', 'Stephen Collins',
      'Stephanie Stewart', 'Larry Morris', 'Crystal Rogers', 'Frank Reed', 'Tiffany Cook',
      'Scott Morgan', 'Christina Bell', 'Jeffrey Murphy', 'Erica Bailey', 'Brandon Rivera',
      'Tracy Cooper', 'Benjamin Richardson', 'Monica Cox', 'Samuel Howard', 'Angela Ward',
      'Gregory Torres', 'Brenda Peterson', 'Patrick Gray', 'Diana Ramirez', 'Douglas James',
      'Virginia Watson', 'Edward Brooks', 'Deborah Kelly', 'Ronald Sanders', 'Sharon Price',
      'Kenneth Bennett', 'Carol Wood', 'Paul Barnes', 'Janet Ross', 'George Henderson',
      'Diane Coleman', 'Frank Jenkins', 'Martha Perry', 'Harold Powell', 'Dorothy Long',
      'Henry Patterson', 'Betty Hughes', 'Carl Flores', 'Helen Washington', 'Arthur Butler',
      'Frances Simmons', 'Ralph Foster', 'Lois Gonzales', 'Eugene Bryant', 'Jean Alexander',
      'Russell Russell', 'Ruby Griffin', 'Bobby Diaz', 'Gloria Hayes', 'Victor Sanders',
      'Louise Price', 'Martin Bennett', 'Viola Wood', 'Ernest Barnes', 'Mildred Ross',
      'Phillip Henderson', 'Ethel Coleman', 'Harry Jenkins', 'Sylvia Perry', 'Wayne Powell',
      'Edna Long', 'Alan Patterson', 'Gladys Hughes', 'Roy Flores', 'Eleanor Washington',
      'Fred Butler', 'Lucille Simmons', 'Earl Foster', 'Thelma Gonzales', 'Clarence Bryant',
      'Vera Alexander', 'Clifford Russell', 'Beatrice Griffin', 'Leroy Diaz', 'Bernice Hayes'
    ];

    // Random amounts for donations (in pounds)
    this.randomAmounts = [
      5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
      55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
      110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
      225, 250, 275, 300, 325, 350, 375, 400, 425, 450,
      475, 500, 550, 600, 650, 700, 750, 800, 850, 900,
      950, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
      1900, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000,
      4250, 4500, 4750, 5000, 5500, 6000, 6500, 7000, 7500, 8000,
      8500, 9000, 9500, 10000, 11000, 12000, 13000, 14000, 15000, 16000,
      17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 32500, 35000
    ];
  }

  // Get a random name from the list
  getRandomName() {
    return this.randomNames[Math.floor(Math.random() * this.randomNames.length)];
  }

  // Get a random amount from the list
  getRandomAmount() {
    return this.randomAmounts[Math.floor(Math.random() * this.randomAmounts.length)];
  }

  // Generate a random donor object
  generateRandomDonor() {
    return {
      name: this.getRandomName(),
      amount: this.getRandomAmount()
    };
  }

  // Format currency amount
  formatCurrency(amount) {
    return amount.toLocaleString();
  }

  // Debounce function to limit function calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function to limit function calls
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Deep clone object
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }
}

// Export for use in other modules
window.Utils = Utils;

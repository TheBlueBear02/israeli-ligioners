// Data Manager - Handles donor data and statistics
class DataManager {
  constructor() {
    this.donors = [];
  }

  // Update statistics display
  updateStats() {
    const totalAmount = this.donors.reduce((sum, d) => sum + d.amount, 0);
    const totalDonors = this.donors.length;
    document.getElementById("totalAmount").innerText = totalAmount.toLocaleString();
    document.getElementById("totalDonors").innerText = totalDonors;
  }

  // Add donor to the list
  addDonor(name, amount) {
    this.donors.push({ name, amount });
  }

  // Add multiple donors
  addMultipleDonors(count, nameGenerator, amountGenerator) {
    for (let i = 0; i < count; i++) {
      this.donors.push({ 
        name: nameGenerator(), 
        amount: amountGenerator() 
      });
    }
  }

  // Remove last donor
  removeLastDonor() {
    if (this.donors.length > 0) {
      return this.donors.pop();
    }
    return null;
  }

  // Remove multiple donors
  removeMultipleDonors(count) {
    const removeCount = Math.min(count, this.donors.length);
    const removed = [];
    for (let i = 0; i < removeCount; i++) {
      removed.push(this.donors.pop());
    }
    return removed;
  }

  // Get donors array
  getDonors() {
    return this.donors;
  }

  // Set donors array
  setDonors(donors) {
    this.donors = donors;
  }
}

// Export for use in other modules
window.DataManager = DataManager;

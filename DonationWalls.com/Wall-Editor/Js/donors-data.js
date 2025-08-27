// Function to get a random integer between min and max (inclusive)
function getRandomAmount() {
  const min = 1;
  const max = 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to get a random name from the names list
function getRandomName() {
  const names = [
    "Alex Turner", "Sam Carter", "Morgan Lee", "Taylor Brooks", "Jordan Reed",
    "Casey Morgan", "Riley Quinn", "Jamie Parker", "Drew Bailey", "Avery Lane"
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// Example donor data
const donors = [
  { name: "Adaline Gibson", amount: getRandomAmount() },
  { name: "Hadleigh Osborne", amount: getRandomAmount() },
  { name: "Jad Foster", amount: getRandomAmount() },
  { name: "Amir Cohen", amount: getRandomAmount() },
  { name: "Lina Wong", amount: getRandomAmount() },
  { name: "John Smith", amount: getRandomAmount() },
  { name: "Priya Patel", amount: getRandomAmount() },
  { name: "Sofia Rossi", amount: getRandomAmount() },
  { name: "Noah Kim", amount: getRandomAmount() },
  { name: "Emily Johnson", amount: getRandomAmount() },
  { name: "Lucas Müller", amount: getRandomAmount() },
  { name: "Olivia Brown", amount: getRandomAmount() },
  { name: "Mateo Garcia", amount: getRandomAmount() },
  { name: "Chloe Dubois", amount: getRandomAmount() },
  { name: "Ethan Lee", amount: getRandomAmount() },
  { name: "Mia Novak", amount: getRandomAmount() },
  { name: "William Evans", amount: getRandomAmount() },
  { name: "Ava Wilson", amount: getRandomAmount() },
  { name: "Benjamin Clark", amount: getRandomAmount() },
  { name: "Isabella Martin", amount: getRandomAmount() },
  { name: "James Thompson", amount: getRandomAmount() },
  { name: "Charlotte White", amount: getRandomAmount() },
  { name: "Alexander Harris", amount: getRandomAmount() },
  { name: "Amelia Lewis", amount: getRandomAmount() },
  { name: "Daniel Walker", amount: getRandomAmount() },
  { name: "Grace Hall", amount: getRandomAmount() },
  { name: "Adaline Gibson", amount: getRandomAmount() },
  { name: "Hadleigh Osborne", amount: getRandomAmount() },
  { name: "Jad Foster", amount: getRandomAmount() },
  { name: "Amir Cohen", amount: getRandomAmount() },
  { name: "Lina Wong", amount: getRandomAmount() },
  { name: "John Smith", amount: getRandomAmount() },
  { name: "Priya Patel", amount: getRandomAmount() },
  { name: "Sofia Rossi", amount: getRandomAmount() },
  { name: "Noah Kim", amount: getRandomAmount() },
  { name: "Emily Johnson", amount: getRandomAmount() },
  { name: "Lucas Müller", amount: getRandomAmount() },
  { name: "Olivia Brown", amount: getRandomAmount() },
  { name: "Mateo Garcia", amount: getRandomAmount() },
  { name: "Chloe Dubois", amount: getRandomAmount() },
  { name: "Ethan Lee", amount: getRandomAmount() },
  { name: "Mia Novak", amount: getRandomAmount() },
  { name: "William Evans", amount: getRandomAmount() },
  { name: "Ava Wilson", amount: getRandomAmount() },
  { name: "Benjamin Clark", amount: getRandomAmount() },
  { name: "Isabella Martin", amount: getRandomAmount() },
  { name: "James Thompson", amount: getRandomAmount() },
  { name: "Charlotte White", amount: getRandomAmount() },
  { name: "Alexander Harris", amount: getRandomAmount() },
  { name: "Amelia Lewis", amount: getRandomAmount() },
  { name: "Daniel Walker", amount: getRandomAmount() },
  { name: "Grace Hall", amount: getRandomAmount() }
];

// Export functions and data for use in other files
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    donors,
    getRandomAmount,
    getRandomName
  };
}

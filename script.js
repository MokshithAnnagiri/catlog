const fs = require('fs');

// Function to load and parse JSON data
function loadJson(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject("Error reading JSON file: " + err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (parseError) {
        reject("Error parsing JSON data: " + parseError);
      }
    });
  });
}

// Function to decode base-n values to decimal
function decodeValue(value, base) {
  return parseInt(value, base);
}

// Function to calculate the constant term using Lagrange interpolation
function calculateConstantTerm(points) {
  let constant = 0;

  for (let i = 0; i < points.length; i++) {
    const [xi, yi] = points[i];
    let li = 1;

    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        const [xj] = points[j];
        li *= xj / (xj - xi);
      }
    }

    constant += yi * li;
  }

  return Math.round(constant); // Round to the nearest integer
}

// Main function to process the JSON input and find the secret
async function findSecret(filePath) {
  try {
    const data = await loadJson(filePath);

    const keys = data.keys;
    const n = keys.n;
    const k = keys.k;
    const points = [];

    // Decode each root and prepare points for interpolation
    for (let i = 1; i <= n; i++) {
      const root = data[i.toString()];

      // Check if the root exists and has 'base' and 'value'
      if (!root || !root.base || !root.value) {
        console.error(`Root with key ${i} is missing 'base' or 'value'`);
        continue;
      }

      const x = i;
      const y = decodeValue(root.value, root.base);
      points.push([x, y]);

      // Stop once we have enough points
      if (points.length === k) break;
    }

    // Ensure we have enough points to solve the polynomial
    if (points.length < k) {
      console.error("Insufficient points to solve for the constant term.");
      return;
    }

    // Calculate the constant term (secret)
    const secret = calculateConstantTerm(points);
    console.log("Secret (constant term 'c'):", secret);

  } catch (error) {
    console.error(error);
  }
}

// Run the program with the provided JSON file path
findSecret('testcase1.json');
findSecret('testcase2.json');

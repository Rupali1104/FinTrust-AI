// Generate a random score between min and max (inclusive)
function generateRandomScore(min = 60, max = 80) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    generateRandomScore
}; 
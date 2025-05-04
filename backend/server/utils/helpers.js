// Generate a random score between min and max (inclusive)
function generateRandomScore(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    generateRandomScore
}; 
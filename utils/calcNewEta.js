function calculateNewEta(createdAt, eta) {
  const finishedAt = new Date(createdAt.getTime() + eta * 60000);
  const currentTime = new Date();

  if (finishedAt <= currentTime) return 0;
  else {
    const diffTime = Math.abs(currentTime - finishedAt);
    let diffMins = Math.round(((diffTime % 86400000) % 3600000) / 60000);
    return diffMins;
  }
}

module.exports = calculateNewEta;

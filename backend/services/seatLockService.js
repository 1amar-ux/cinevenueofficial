const redis = require("../config/redis");

// Lock seat for 5 minutes
exports.lockSeat = async (showId, seatNumbers, userId) => {
  for (let seat of seatNumbers) {
    const key = `show:${showId}:seat:${seat}`;
    const exists = await redis.get(key);

    if (exists) {
      throw new Error(`${seat} already locked`);
    }

    await redis.set(key, userId, "EX", 300);
  }
  return true;
};

// Remove lock
exports.unlockSeat = async (showId, seatNumbers) => {
  for (let seat of seatNumbers) {
    await redis.del(`show:${showId}:seat:${seat}`);
  }
};

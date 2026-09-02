const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (amount) => {
  const options = {
    amount: amount * 100, // Razorpay works in paise
    currency: "INR",
    receipt: "cinevenue_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);
  return order;
};

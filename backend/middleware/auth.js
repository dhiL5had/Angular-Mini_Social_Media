const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const { email, password } = jwt.verify(token, 'secret');
    req.userData = { email, userId };
    next();
  } catch (err) {
    res.status(401).json({ message: "Auth Failed" });
  }

}
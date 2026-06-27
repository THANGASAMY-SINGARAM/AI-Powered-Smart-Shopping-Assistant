const User = require('../models/user');

module.exports = async function admin(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('role');

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

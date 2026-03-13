const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { culinaryProfile } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (culinaryProfile) {
      user.culinaryProfile = culinaryProfile;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

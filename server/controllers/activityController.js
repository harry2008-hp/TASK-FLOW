const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

exports.getActivityLogs = async (req, res, next) => {
  try {
    let query = {};
    
    // Regular users see only their own logs; Admin sees all logs
    if (req.user.role !== 'Admin') {
      query.user = req.user._id;
    }

    const logs = await ActivityLog.find(query).sort({ timestamp: -1 });

    // Fetch and bind user contexts manually if in fallback JSON mode
    const users = await User.find({});
    const userMap = {};
    users.forEach(u => {
      userMap[String(u._id)] = {
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar
      };
    });

    const populatedLogs = logs.map(log => {
      const l = log.toObject ? log.toObject() : { ...log };
      if (l.user) {
        l.user = userMap[String(l.user)] || { _id: l.user, name: 'System / User' };
      }
      return l;
    });

    res.status(200).json({
      status: 'success',
      results: populatedLogs.length,
      data: { logs: populatedLogs }
    });
  } catch (err) {
    next(err);
  }
};

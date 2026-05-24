const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

// Get all notifications for current user
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ timestamp: -1 });

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications }
    });
  } catch (err) {
    next(err);
  }
};

// Mark single notification or all notifications as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      // Mark all as read
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true } }
      );
      
      return res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read.'
      });
    }

    // Mark single notification as read
    const notification = await Notification.findById(id);
    if (!notification) {
      return next(new AppError('No notification found with that ID', 404));
    }

    if (String(notification.recipient) !== String(req.user._id)) {
      return next(new AppError('You do not have permission to modify this notification.', 403));
    }

    const updated = await Notification.findByIdAndUpdate(id, { $set: { isRead: true } }, { new: true });

    res.status(200).json({
      status: 'success',
      data: { notification: updated }
    });
  } catch (err) {
    next(err);
  }
};

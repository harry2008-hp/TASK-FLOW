const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Log task activity helper
const logActivity = async (userId, action, details, targetId = '') => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
      targetId: String(targetId)
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// Create a Notification helper
const createNotification = async (recipientId, title, message, type = 'info') => {
  try {
    await Notification.create({
      recipient: recipientId,
      title,
      message,
      type
    });
  } catch (err) {
    console.error('Failed to trigger notification:', err.message);
  }
};

// Create a new task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, tags, assignedTo } = req.body;

    if (!title || !dueDate) {
      return next(new AppError('Please provide task title and a valid due date!', 400));
    }

    // Resolve assignee if provided
    let assignedUserId = null;
    if (assignedTo) {
      const userToAssign = await User.findOne({ 
        $or: [{ _id: assignedTo }, { email: assignedTo }] 
      });
      if (userToAssign) {
        assignedUserId = userToAssign._id;
      }
    }

    const newTask = await Task.create({
      title,
      description: description || '',
      dueDate,
      priority: priority || 'Medium',
      status: status || 'Pending',
      tags: tags || [],
      assignedTo: assignedUserId,
      createdBy: req.user._id,
    });

    // Log the creation activity
    await logActivity(req.user._id, 'Task Created', `Created task titled "${title}"`, newTask._id);

    // Send notifications to the assignee if they are not the creator
    if (assignedUserId && String(assignedUserId) !== String(req.user._id)) {
      await createNotification(
        assignedUserId,
        'New Task Assigned',
        `You have been assigned the task: "${title}" by ${req.user.name}`,
        'info'
      );
    }

    res.status(201).json({
      status: 'success',
      data: { task: newTask }
    });
  } catch (err) {
    next(err);
  }
};

// Fetch tasks (Admin: all tasks, User: own tasks)
exports.getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, tag } = req.query;
    
    // Construct query object
    let query = {};

    // Access control: Admin sees all tasks. Regular User sees their own created/assigned tasks
    if (req.user.role !== 'Admin') {
      query.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    // Search query filter
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      // Handle or-logic gracefully
      if (query.$or) {
        // Nested evaluation for user context + search
        const contextFilters = [...query.$or];
        query = {
          $and: [
            { $or: contextFilters },
            {
              $or: [
                { title: searchRegex },
                { description: searchRegex }
              ]
            }
          ]
        };
      } else {
        query.$or = [
          { title: searchRegex },
          { description: searchRegex }
        ];
      }
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // Execute query with sorting
    let tasks = await Task.find(query).sort({ dueDate: 1 });

    // Fetch and bind user contexts manually if in fallback JSON mode
    // (since .populate() in JSON mode is a stub)
    // This is clean and robust!
    const users = await User.find({});
    const userMap = {};
    users.forEach(u => {
      userMap[String(u._id)] = {
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role
      };
    });

    const populatedTasks = tasks.map(task => {
      // Create lean object representation
      const t = task.toObject ? task.toObject() : { ...task };
      if (t.assignedTo) {
        t.assignedTo = userMap[String(t.assignedTo)] || { _id: t.assignedTo, name: 'Unknown User' };
      }
      if (t.createdBy) {
        t.createdBy = userMap[String(t.createdBy)] || { _id: t.createdBy, name: 'Unknown User' };
      }
      return t;
    });

    res.status(200).json({
      status: 'success',
      results: populatedTasks.length,
      data: { tasks: populatedTasks }
    });
  } catch (err) {
    next(err);
  }
};

// Update task details or status
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, status, tags, assignedTo } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }

    // Access control: Admin or task owner/assignee can update
    const isOwner = String(task.createdBy) === String(req.user._id);
    const isAssignee = task.assignedTo && String(task.assignedTo) === String(req.user._id);
    if (req.user.role !== 'Admin' && !isOwner && !isAssignee) {
      return next(new AppError('You do not have permission to update this task.', 403));
    }

    // Check assignee change
    let assignedUserId = undefined;
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === '') {
        assignedUserId = null;
      } else {
        const userToAssign = await User.findOne({ 
          $or: [{ _id: assignedTo }, { email: assignedTo }] 
        });
        if (userToAssign) {
          assignedUserId = userToAssign._id;
        }
      }
    }

    // Capture changes for notifications and logs
    const statusChanged = status && status !== task.status;
    const oldStatus = task.status;

    // Construct update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (assignedUserId !== undefined) updateData.assignedTo = assignedUserId;

    const updatedTask = await Task.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    // Log the update action
    await logActivity(
      req.user._id, 
      'Task Updated', 
      `Updated task "${updatedTask.title}" (${statusChanged ? `Status: ${oldStatus} ➜ ${status}` : 'details modified'})`,
      updatedTask._id
    );

    // Send notifications if status completed
    if (statusChanged && status === 'Completed') {
      // Notify creator if assignee completed it
      if (isAssignee && !isOwner) {
        await createNotification(
          task.createdBy,
          'Task Completed',
          `"${updatedTask.title}" has been completed by ${req.user.name}!`,
          'success'
        );
      }
    }

    // Send notifications if assigned user changed
    if (assignedUserId !== undefined && assignedUserId !== null && String(assignedUserId) !== String(task.assignedTo)) {
      await createNotification(
        assignedUserId,
        'Task Assigned',
        `Task "${updatedTask.title}" has been assigned to you by ${req.user.name}`,
        'info'
      );
    }

    res.status(200).json({
      status: 'success',
      data: { task: updatedTask }
    });
  } catch (err) {
    next(err);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }

    // Access control: Admin or task creator can delete
    const isOwner = String(task.createdBy) === String(req.user._id);
    if (req.user.role !== 'Admin' && !isOwner) {
      return next(new AppError('You do not have permission to delete this task.', 403));
    }

    await Task.findByIdAndDelete(id);

    // Log the deletion action
    await logActivity(req.user._id, 'Task Deleted', `Deleted task "${task.title}"`, id);

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

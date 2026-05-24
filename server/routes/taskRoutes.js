const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(taskController.createTask)
  .get(taskController.getTasks);

router.route('/:id')
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;

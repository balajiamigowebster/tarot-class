const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');

router.get('/students/all', accessController.getAllStudents);
router.post('/students', accessController.addStudent);
router.delete('/students/:id', accessController.deleteStudent);
router.get('/:phone', accessController.checkAccess);

module.exports = router;

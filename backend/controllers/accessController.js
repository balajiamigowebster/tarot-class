const AllowedStudent = require('../models/AllowedStudent');

exports.checkAccess = async (req, res) => {
  const { phone } = req.params;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  try {
    const student = await AllowedStudent.findOne({
      where: { phone_number: phone }
    });

    if (!student) {
      return res.json({ success: true, hasAccess: false, status: 'NOT_FOUND' });
    }

    if (student.status === 'active') {
      return res.json({ success: true, hasAccess: true, status: 'PAID' }); // Kept PAID to maintain frontend compatibility
    } else {
      return res.json({ success: true, hasAccess: false, status: student.status });
    }

  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await AllowedStudent.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(students);
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { phone_number, name } = req.body;
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const newStudent = await AllowedStudent.create({ phone_number, name });
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: error.message || 'Failed to add student' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await AllowedStudent.findByPk(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone_number, name } = req.body;
    const student = await AllowedStudent.findByPk(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    await student.update({ phone_number, name });
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message || 'Failed to update student' });
  }
};

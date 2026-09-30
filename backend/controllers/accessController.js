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

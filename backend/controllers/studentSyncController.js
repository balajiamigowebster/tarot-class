const AllowedStudent = require('../models/AllowedStudent');

exports.saveStudent = async (req, res) => {
    try {
        // 1. Validate Secret Token
        const clientToken = req.headers['x-secret-token'] || req.body.secret_token;
        const serverToken = process.env.CLASS_SYNC_SECRET;

        if (!clientToken || clientToken !== serverToken) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid or missing secret token'
            });
        }

        // 2. Extract Payload
        const { phone_number, name, order_id, status } = req.body;

        if (!phone_number) {
            return res.status(400).json({
                success: false,
                message: 'Bad Request: phone_number is required'
            });
        }

        const studentStatus = status || 'active';

        // 3. Database Operation (Insert or Update via Sequelize upsert)
        // Upsert returns an array [instance, created]
        const [student, created] = await AllowedStudent.upsert({
            phone_number: phone_number,
            name: name || null,
            order_id: order_id || null,
            status: studentStatus
        });

        // 4. Send Success Response
        return res.status(200).json({
            success: true,
            message: created ? 'Student synced and created successfully' : 'Student synced and updated successfully',
            data: student
        });

    } catch (error) {
        console.error('Error syncing student:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

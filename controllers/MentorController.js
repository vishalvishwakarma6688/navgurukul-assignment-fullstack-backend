import * as MentorService from '../services/MentorService.js';
import { sendCsv } from '../utils/csv.js';

export const getDashboard = async (req, res, next) => {
    try {
        const dashboard = await MentorService.getMentorDashboard(req.user.id);
        return res.status(200).json(dashboard);
    } catch (error) {
        return next(error);
    }
};

export const exportDashboardCsv = async (req, res, next) => {
    try {
        const csv = await MentorService.getMentorDashboardCsv(req.user.id);
        return sendCsv(res, 'mentor-dashboard-export.csv', csv);
    } catch (error) {
        return next(error);
    }
};

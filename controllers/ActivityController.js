import * as ActivityService from '../services/ActivityService.js';

export const getActivities = async (req, res, next) => {
    try {
        const activities = await ActivityService.getActivities(req.user.id, req.query);
        return res.status(200).json(activities);
    } catch (error) {
        return next(error);
    }
};

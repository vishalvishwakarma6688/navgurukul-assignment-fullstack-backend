import * as DashboardService from '../services/DashboardService.js';
import { sendCsv } from '../utils/csv.js';

export const getDashboard = async (req, res, next) => {
    try {
        const dashboard = await DashboardService.getDashboardData(req.user.id);
        return res.status(200).json(dashboard);
    } catch (error) {
        return next(error);
    }
};

export const getTimeSeries = async (req, res, next) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
        const timeSeries = await DashboardService.getTimeSeriesData(req.user.id, startDate, endDate);

        return res.status(200).json(timeSeries);
    } catch (error) {
        return next(error);
    }
};

export const getAggregate = async (req, res, next) => {
    try {
        const aggregate = await DashboardService.getAggregateData(req.user.id);
        return res.status(200).json(aggregate);
    } catch (error) {
        return next(error);
    }
};

export const exportDashboardCsv = async (req, res, next) => {
    try {
        const csv = await DashboardService.getStudentDashboardCsv(req.user.id);
        return sendCsv(res, 'student-dashboard-export.csv', csv);
    } catch (error) {
        return next(error);
    }
};

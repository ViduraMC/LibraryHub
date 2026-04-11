import axiosInstance from './axiosInstance.js';

export const createReport = async (reportData) => {
    const response = await axiosInstance.post('/reports', reportData);
    return response.data;
};

export const getReports = async (archived = false) => {
    const response = await axiosInstance.get('/reports', {
        params: archived ? { archived: 'true' } : {},
    });
    return response.data;
};

export const getReportById = async (id) => {
    const response = await axiosInstance.get(`/reports/${id}`);
    return response.data;
};

export const updateReport = async (id, updateData) => {
    const response = await axiosInstance.put(`/reports/${id}`, updateData);
    return response.data;
};

export const finalizeReport = async (id) => {
    const response = await axiosInstance.patch(`/reports/${id}/finalize`);
    return response.data;
};

export const deleteReport = async (id) => {
    const response = await axiosInstance.delete(`/reports/${id}`);
    return response.data;
};

export const restoreReport = async (id) => {
    const response = await axiosInstance.patch(`/reports/${id}/restore`);
    return response.data;
};

export const permanentlyDeleteReport = async (id) => {
    const response = await axiosInstance.delete(`/reports/${id}/permanent`);
    return response.data;
};

export const downloadReport = async (id, reportTitle = 'report') => {
    const response = await axiosInstance.get(`/reports/${id}/download`, {
        responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const safeTitle = reportTitle.replace(/[^\w\- ]/g, '').replace(/ /g, '_');
    link.setAttribute('download', `${safeTitle}_report.csv`);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
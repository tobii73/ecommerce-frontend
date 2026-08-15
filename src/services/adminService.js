import axios from '../api/axios';

export const getAllUsers = async (accessToken) => {
    return await axios.get('/admin/users', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const getStats = async (accessToken) => {
    return await axios.get('/admin/stats', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const getBusinesses = async (accessToken) => {
    return await axios.get('/admin/businesses', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const UpdateUserRole = async (userId, role, accessToken) => {
    return await axios.put(
        `/admin/users/${userId}/role`,
        { role },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
}

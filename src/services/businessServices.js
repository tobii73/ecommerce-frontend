import axios from "../api/axios";


export const getMyBusiness = async (accessToken) => {
    return await axios.get(`/business/my-business`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
};

export const createBusiness = async (businessData, accessToken) => {
    return await axios.post(
        `/business/add`,
        businessData,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};

export const updateBusiness = async (businessId, businessData, accessToken) => {
    return await axios.put(
        `/business/update/${businessId}`,
        businessData,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};

export const deleteBusiness = async (businessId, accessToken) => {
    return await axios.delete(
        `/business/delete/${businessId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};
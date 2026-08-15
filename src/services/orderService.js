import axios from "../api/axios";


export const createOrder = async (items, accessToken) => {
    return await axios.post(
        `/orders/create`,
        {
            items:items.map(item => ({
                product_id: item._id,
                quantity: item.quantity
            }))
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};

export const getMyOrders = async (accessToken) => {
    return await axios.get(
        `/orders/my-orders`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};
export const getOrderById = async (orderId, accessToken) => {
    return await axios.get(
        `/orders/${orderId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};

export const getMySales = async (accessToken) => {
    return await axios.get("/orders/my-sales", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
};
export const updateOrderStatus = async (orderId, status, accessToken) =>{
    return await axios.put(
        `/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
};
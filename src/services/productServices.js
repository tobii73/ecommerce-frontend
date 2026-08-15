import axios from "../api/axios";

export const getMyProducts = async (accessToken) => {
    return await axios.get(
        `/products/my-products`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};

export const createProduct = async (productData, imageFile, accessToken) => {
    const formData = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value);
    });

    formData.append("image", imageFile);

    return await axios.post(
        `/products/add`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};

export const updateProduct = async (productId, productData, accessToken) => {
    return await axios.put(
        `/products/update/${productId}`,
        productData,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};

export const deleteProduct = async (productId, accessToken) => {
    return await axios.delete(
        `/products/delete/${productId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
};

export const getAllProducts = async () => {
    return await axios.get(
        `/products/get`
    );
};

export const getProductById = async (productId) => {
    return await axios.get(`/products/${productId}`);
};

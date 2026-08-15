import { createContext, useState, useEffect } from "react";
import { readStoredJSON, writeStoredJSON } from "../utils/storage";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {

    const [cart, setCart] = useState(() => {
        return readStoredJSON("cart", [], Array.isArray);
    });


    useEffect(() => {

        writeStoredJSON("cart", cart);

    }, [cart]);

    return (
        <CartContext.Provider
            value={{
                cart,
                setCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Button } from "react-bootstrap";
import { createOrder } from "../services/orderService";
import {AuthContext} from "../context/AuthContext"
import { useNavigate } from "react-router-dom";
import { SuccessModal } from "../components/SuccessModal";
import { formatCurrency } from "../utils/formatCurrency";
import { getOrderErrorMessage } from "../utils/getOrderErrorMessage";
import { ProductImage } from "../components/ProductImage";
import "../styles/pages/Cart.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export const Cart = () => {

    const { cart, setCart } = useContext(CartContext);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loadingOrder, setLoadingOrder] = useState(false);
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCreateOrder = async () => {
        if (cart.length === 0) {
            return;
        }

        if (!auth.user || !auth.accessToken) {
            navigate("/login", {
                state: { from: "/cart" }
            });
            return;
        }

        try {
            setLoadingOrder(true);
            setError("");

            await createOrder(cart, auth.accessToken);

            // La orden se creó correctamente
            setCart([]);
            setShowSuccess(true);

        } catch (error) {
            setError(getOrderErrorMessage(error, "No se pudo completar la compra."));

        } finally {
            setLoadingOrder(false);
        }
    };

    const increaseQuantity = (productId) => {
        setError("");
        setCart(currentCart =>
            currentCart.map(product =>
                product._id === productId
                    ? product.quantity < product.stock ? {
                        ...product,
                        quantity: product.quantity + 1
                    } : product
                    : product
            )
        );

    };


    const decreaseQuantity = (productId) => {
        setCart(currentCart =>
            currentCart.map(product =>
                product._id === productId
                    ? {
                        ...product,
                        quantity: product.quantity - 1
                    }
                    : product
            )
        );
    };


    const removeProduct = (productId) => {

        setCart(currentCart =>
            currentCart.filter(product =>
                product._id !== productId
            )
        );

    };


    const total = cart.reduce(
        (accumulator, product) =>
            accumulator + product.price * product.quantity,
        0
    );

    const cartQuantity = cart.reduce(
    (total, product) => total + product.quantity,
    0
    );


    return (
        <main className="cart-page container">
            <header className="cart-page__header">
                <div>
                    <p className="cart-page__eyebrow">Tu selección</p>
                    <h1>Carrito</h1>
                </div>
                {cart.length > 0 && (
                    <p className="cart-page__count">
                        {cartQuantity} unidad{cartQuantity === 1 ? "" : "es"}
                    </p>
                )}
            </header>

            {cart.length === 0 ? (
                <section className="cart-empty-state">
                    <h2>Tu carrito está vacío</h2>
                    <p>Agregá productos para poder ver el resumen de tu compra.</p>
                    <Button onClick={() => navigate("/")}>Ver productos</Button>
                </section>
            ) : (
                <div className="cart-layout">
                    <section className="cart-products" aria-labelledby="cart-products-title">
                        <header className="cart-products__header">
                            <h2 id="cart-products-title">Productos seleccionados</h2>
                            <span>{cart.length} producto{cart.length === 1 ? "" : "s"}</span>
                        </header>

                        {cart.map(product => (
                            <article className="cart-item" key={product._id}>
                                <ProductImage product={product} className="cart-item__image" />

                                <div className="cart-item__info">
                                    <h3>{product.name}</h3>
                                    <p className="cart-item__unit-price">
                                        {formatCurrency(product.price)} por unidad
                                    </p>
                                    <div className="cart-item__quantity" aria-label={`Cantidad de ${product.name}`}>
                                        <Button
                                            variant="light"
                                            onClick={() => decreaseQuantity(product._id)}
                                            disabled={product.quantity <= 1}
                                            aria-label={`Quitar una unidad de ${product.name}`}
                                        >
                                            −
                                        </Button>
                                        <span>{product.quantity}</span>
                                        <Button
                                            variant="light"
                                            onClick={() => increaseQuantity(product._id)}
                                            disabled={product.quantity >= product.stock}
                                            aria-label={`Agregar una unidad de ${product.name}`}
                                        >
                                            +
                                        </Button>
                                    </div>
                                    <p className="cart-item__stock">
                                        {product.stock - product.quantity} unidad{product.stock - product.quantity === 1 ? "" : "es"} disponible{product.stock - product.quantity === 1 ? "" : "s"}
                                    </p>
                                </div>

                                <div className="cart-item__summary">
                                    <Button
                                        variant="link"
                                        className="cart-item__remove-button"
                                        onClick={() => removeProduct(product._id)}
                                        aria-label={`Eliminar ${product.name}`}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                    <strong>{formatCurrency(product.price * product.quantity)}</strong>
                                </div>
                            </article>
                        ))}
                    </section>

                    <aside className="cart-summary" aria-labelledby="cart-summary-title">
                        <h2 id="cart-summary-title">Resumen de compra</h2>
                        <div className="cart-summary__line">
                            <span>Productos ({cartQuantity})</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="cart-summary__line cart-summary__line--total">
                            <strong>Total</strong>
                            <strong>{formatCurrency(total)}</strong>
                        </div>
                        <p className="cart-summary__note">
                            El detalle final de cada producto estará disponible en tu pedido.
                        </p>
                        {error && <p className="text-danger mb-3">{error}</p>}
                        <Button
                            className="cart-summary__checkout-button"
                            onClick={handleCreateOrder}
                            disabled={loadingOrder}
                        >
                            {loadingOrder
                                ? "Procesando compra..."
                                : auth.user && auth.accessToken
                                    ? "Confirmar compra"
                                    : "Iniciar sesión para comprar"}
                        </Button>
                    </aside>
                </div>
            )}

            <SuccessModal
                show={showSuccess}
                message="La compra se realizó correctamente."
                onHide={() => setShowSuccess(false)}
            />
        </main>
    );
};

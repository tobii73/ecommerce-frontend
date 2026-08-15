import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getOrderById } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";
import { getOrderErrorMessage } from "../utils/getOrderErrorMessage";
import { ProductImage } from "../components/ProductImage";
import { Skeleton } from "../components/LoadingSkeleton";
import "../styles/pages/OrderDetail.css";

const getStatusLabel = status => ({
    pending: "Pendiente",
    confirmed: "Confirmado",
    delivered: "Entregado",
    cancelled: "Cancelado"
}[status] || status || "Sin estado");

export const OrderDetail = () => {

    const { order_id } = useParams();
    const { auth } = useContext(AuthContext);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadOrder = async () => {

            try {

                const response = await getOrderById(
                    order_id,
                    auth.accessToken
                );

                setOrder(response.data);

            } catch (error) {

                setError(getOrderErrorMessage(error, "No se pudo cargar el pedido."));

            } finally {

                setLoading(false);

            }

        };

        loadOrder();

    }, [order_id, auth.accessToken]);


    if (loading) {
        return (
            <main className="order-detail-page container" aria-busy="true">
                <Skeleton className="order-detail-skeleton__back-link" />
                <header className="order-detail-page__header">
                    <Skeleton className="order-detail-skeleton__title" />
                    <Skeleton className="order-detail-skeleton__id" />
                </header>
                <section className="order-detail-layout">
                    <div className="order-detail-items-card">
                        <Skeleton className="order-detail-skeleton__section-title" />
                        {Array.from({ length: 3 }, (_, index) => (
                            <div className="order-detail-item" key={index}>
                                <Skeleton className="order-detail-skeleton__image" />
                                <div className="order-detail-item__info">
                                    <Skeleton className="order-detail-skeleton__name" />
                                    <Skeleton className="order-detail-skeleton__text" />
                                </div>
                                <Skeleton className="order-detail-skeleton__subtotal" />
                            </div>
                        ))}
                    </div>
                    <aside className="order-detail-summary-card">
                        <Skeleton className="order-detail-skeleton__summary-title" />
                        <Skeleton className="order-detail-skeleton__summary-line" />
                        <Skeleton className="order-detail-skeleton__summary-line" />
                        <Skeleton className="order-detail-skeleton__total" />
                    </aside>
                </section>
            </main>
        );
    }


    if (error) {
        return <p className="text-danger mt-4">{error}</p>;
    }


    if (!order) {
        return <p className="mt-4">Pedido no encontrado.</p>;
    }


    return (
        <main className="order-detail-page container">
            <Button as={Link} to="/orders/my-orders" variant="outline-secondary" className="order-detail-page__back-link">
                Volver a mis pedidos
            </Button>

            <header className="order-detail-page__header">
                <div>
                    <p className="order-detail-page__eyebrow">Detalle de compra</p>
                    <h1>Pedido #{order._id}</h1>
                </div>
                <span className="order-detail-page__status">
                    {getStatusLabel(order.status)}
                </span>
            </header>

            <section className="order-detail-layout">
                <section className="order-detail-items-card" aria-labelledby="order-products-title">
                    <h2 id="order-products-title">Productos</h2>
                    {order.items.map(item => (
                        <article className="order-detail-item" key={item.product_id}>
                            <ProductImage
                                product={item}
                                className="order-item-image order-detail-item__image"
                            />
                            <div className="order-detail-item__info">
                                <span className="order-detail-item__status">
                                    {getStatusLabel(item.status || order.status)}
                                </span>
                                <h3>{item.name}</h3>
                                <p>
                                    {item.quantity} unidad{item.quantity === 1 ? "" : "es"} · {formatCurrency(item.price)} c/u
                                </p>
                            </div>
                            <strong className="order-detail-item__subtotal">
                                {formatCurrency(item.price * item.quantity)}
                            </strong>
                        </article>
                    ))}
                </section>

                <aside className="order-detail-summary-card" aria-labelledby="order-summary-title">
                    <h2 id="order-summary-title">Resumen del pedido</h2>
                    <div className="order-detail-summary-card__line">
                        <span>Productos</span>
                        <span>{order.items.reduce((total, item) => total + item.quantity, 0)}</span>
                    </div>
                    <div className="order-detail-summary-card__line">
                        <span>Estado</span>
                        <strong>{getStatusLabel(order.status)}</strong>
                    </div>
                    <div className="order-detail-summary-card__line order-detail-summary-card__line--total">
                        <strong>Total</strong>
                        <strong>{formatCurrency(order.total)}</strong>
                    </div>
                </aside>
            </section>
        </main>
    );
};

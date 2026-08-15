import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getMyOrders } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";
import { getOrderErrorMessage } from "../utils/getOrderErrorMessage";
import { ProductImage } from "../components/ProductImage";
import { Skeleton } from "../components/LoadingSkeleton";
import "../styles/pages/MyOrders.css";

const getOrderDate = order => {
    if (!order.created_at) return "Fecha no disponible";

    const date = new Date(order.created_at);
    if (Number.isNaN(date.getTime())) return "Fecha no disponible";

    return new Intl.DateTimeFormat("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
};

const getStatusLabel = status => ({
    pending: "Pendiente",
    confirmed: "Confirmado",
    delivered: "Entregado",
    cancelled: "Cancelado"
}[status] || status || "Sin estado");

export const MyOrders = () => {

    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadOrders = async () => {

            try {

                const response = await getMyOrders(
                    auth.accessToken
                );

                setOrders(response.data);

            } catch (error) {

                setError(getOrderErrorMessage(error, "No se pudieron cargar tus pedidos."));

            } finally {

                setLoading(false);

            }

        };

        loadOrders();

    }, [auth.accessToken]);

    const ordersByDate = useMemo(() => orders.reduce((groups, order) => {
        const date = getOrderDate(order);

        if (!groups[date]) groups[date] = [];
        groups[date].push(order);

        return groups;
    }, {}), [orders]);

    if (loading) {
        return (
            <main className="my-orders-page container" aria-busy="true">
                <header className="my-orders-page__header">
                    <Skeleton className="my-orders-skeleton__title" />
                    <Skeleton className="my-orders-skeleton__count" />
                </header>
                <div className="my-orders-skeleton__filters">
                    <Skeleton />
                    <Skeleton />
                </div>
                {Array.from({ length: 2 }, (_, groupIndex) => (
                    <section className="purchase-group purchase-group--skeleton" key={groupIndex}>
                        <Skeleton className="my-orders-skeleton__date" />
                        {Array.from({ length: 2 }, (_, orderIndex) => (
                            <div className="purchase-order" key={orderIndex}>
                                <Skeleton className="my-orders-skeleton__image" />
                                <div className="purchase-order__info">
                                    <Skeleton className="my-orders-skeleton__status" />
                                    <Skeleton className="my-orders-skeleton__name" />
                                    <Skeleton className="my-orders-skeleton__text" />
                                </div>
                                <div className="purchase-order__actions">
                                    <Skeleton className="my-orders-skeleton__button" />
                                </div>
                            </div>
                        ))}
                    </section>
                ))}
            </main>
        );
    }

    if (error) {
        return <p className="text-danger mt-4">{error}</p>;
    }

    return (
        <main className="my-orders-page container">
            <header className="my-orders-page__header">
                <div>
                    <p className="my-orders-page__eyebrow">Historial de compras</p>
                    <h1>Mis pedidos</h1>
                </div>
                <p className="my-orders-page__count">
                    {orders.length} pedido{orders.length === 1 ? "" : "s"}
                </p>
            </header>

            <div className="my-orders-page__filters" aria-label="Resumen de pedidos">
                <span>Todos tus pedidos en un solo lugar</span>
                <span>Podés consultar el detalle de cada compra</span>
            </div>

            {orders.length === 0 ? (
                <section className="my-orders-empty-state">
                    <h2>Aún no tenés pedidos</h2>
                    <p>Cuando realices una compra, vas a poder verla desde acá.</p>
                </section>
            ) : (
                Object.entries(ordersByDate).map(([date, ordersForDate]) => (
                    <section className="purchase-group" key={date}>
                        <h2>{date}</h2>

                        {ordersForDate.map(order => (
                            <article className="purchase-order" key={order._id}>
                                <div className="purchase-order__items">
                                    {order.items.map(item => (
                                        <div className="purchase-order__item" key={item.product_id}>
                                            <ProductImage
                                                product={item}
                                                className="order-item-image purchase-order__image"
                                            />
                                            <div className="purchase-order__info">
                                                <span className="purchase-order__status">
                                                    {getStatusLabel(item.status || order.status)}
                                                </span>
                                                <h3>{item.name}</h3>
                                                <p>
                                                    {item.quantity} unidad{item.quantity === 1 ? "" : "es"} · {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="purchase-order__summary">
                                    <strong>Total: {formatCurrency(order.total)}</strong>
                                    <Button onClick={() => navigate(`/orders/${order._id}`)}>
                                        Ver detalle
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </section>
                ))
            )}
        </main>
    );
};

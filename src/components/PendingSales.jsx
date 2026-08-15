import React ,{ useContext, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Spinner } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { getMySales, updateOrderStatus } from "../services/orderService";
import { SuccessModal } from "./SuccessModal";
import { formatCurrency } from "../utils/formatCurrency";
import { getOrderErrorMessage } from "../utils/getOrderErrorMessage";

export const PendingSales = () => {
    const { auth } = useContext(AuthContext);

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmingOrderId, setConfirmingOrderId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const loadPendingSales = async () => {
            setError("");

            try {
                const response = await getMySales(auth.accessToken);
                setSales(response.data);
            } catch (error) {
                setError(getOrderErrorMessage(error, "No se pudieron cargar las ventas pendientes."));
            } finally {
                setLoading(false);
            }
        };

        loadPendingSales();
    }, [auth.accessToken]);

    const handleConfirm = async (orderId) => {
        setConfirmingOrderId(orderId);
        setError("");

        try {
            await updateOrderStatus(
                orderId,
                "confirmed",
                auth.accessToken
            );

            // /my-sales devuelve sólo items pending. Al confirmarlos, este
            // pedido deja de formar parte de la lista del vendedor.
            setSales(currentSales =>
                currentSales.filter(sale => sale._id !== orderId)
            );
            setSuccessMessage("La venta se confirmó correctamente.");
        } catch (error) {
            setError(getOrderErrorMessage(error, "No se pudo confirmar la venta."));
        } finally {
            setConfirmingOrderId(null);
        }
    };

    return (
        <aside className="pending-sales" aria-labelledby="pending-sales-title">
            <div className="pending-sales__header">
                <h2 id="pending-sales-title">Ventas pendientes</h2>
                <Badge bg="warning" text="dark" className='p-2'>
                    {sales.length}
                </Badge>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="pending-sales__loading">
                    <Spinner animation="border" size="sm" />
                    <span>Cargando ventas...</span>
                </div>
            ) : sales.length === 0 ? (
                <p className="text-muted">No tenés ventas pendientes.</p>
            ) : (
                <div className="pending-sales__list">
                    {sales.map(sale => (
                        <Card key={sale._id} className="pending-sales__card">
                            <Card.Body>
                                <Card.Title className="pending-sales__order-id">
                                    Pedido #{sale._id}
                                </Card.Title>

                                {sale.created_at && (
                                    <Card.Subtitle className="mb-3 text-muted">
                                        {new Date(sale.created_at).toLocaleString("es-AR")}
                                    </Card.Subtitle>
                                )}

                                {sale.items.map(item => (
                                    <div
                                        key={item.product_id}
                                        className="pending-sales__item"
                                    >
                                        <strong>{item.name}</strong>
                                        <span>
                                            {item.quantity} × {formatCurrency(item.price)}
                                        </span>
                                    </div>
                                ))}

                                <div className="pending-sales__subtotal">
                                    <span>Subtotal</span>
                                    <strong>{formatCurrency(sale.subtotal)}</strong>
                                </div>

                                <Button
                                    variant="success"
                                    className="w-100 mt-3"
                                    disabled={confirmingOrderId !== null}
                                    onClick={() => handleConfirm(sale._id)}
                                >
                                    {confirmingOrderId === sale._id
                                        ? "Confirmando..."
                                        : "Confirmar pedido"}
                                </Button>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
            <SuccessModal
                show={Boolean(successMessage)}
                message={successMessage}
                onHide={() => setSuccessMessage("")}
            />
        </aside>
    );
};

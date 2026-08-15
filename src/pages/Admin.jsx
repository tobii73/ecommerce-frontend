import { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Form, Table } from "react-bootstrap";

import { AuthContext } from "../context/AuthContext";
import {
    getAllUsers,
    getBusinesses,
    getStats,
    UpdateUserRole
} from "../services/adminService";
import { SuccessModal } from "../components/SuccessModal";
import { Skeleton } from "../components/LoadingSkeleton";
import "../styles/pages/Admin.css";


const STAT_LABELS = {
    users: "Usuarios",
    customers: "Clientes",
    sellers: "Vendedores",
    admins: "Administradores",
    businesses: "Negocios",
    products: "Productos",
    orders: "Pedidos"
};


export const Admin = () => {
    const { auth } = useContext(AuthContext);

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadAdminData = async () => {
            setError("");

            try {
                const [statsResponse, usersResponse, businessesResponse] =
                    await Promise.all([
                        getStats(auth.accessToken),
                        getAllUsers(auth.accessToken),
                        getBusinesses(auth.accessToken)
                    ]);

                setStats(statsResponse.data);
                setUsers(usersResponse.data);
                setBusinesses(businessesResponse.data);
                setSelectedRoles(
                    Object.fromEntries(
                        usersResponse.data.map(user => [user._id, user.role])
                    )
                );
            } catch (error) {
                setError(
                    error.response?.data?.detail ||
                    "No se pudo cargar la información administrativa."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAdminData();
    }, [auth.accessToken]);

    const handleRoleSelection = (userId, role) => {
        setSelectedRoles(currentRoles => ({
            ...currentRoles,
            [userId]: role
        }));
    };

    const handleRoleUpdate = async (user) => {
        const newRole = selectedRoles[user._id];

        if (!newRole || newRole === user.role) {
            return;
        }

        setUpdatingUserId(user._id);
        setError("");
        setSuccess("");

        try {
            const response = await UpdateUserRole(
                user._id,
                newRole,
                auth.accessToken
            );

            setUsers(currentUsers =>
                currentUsers.map(currentUser =>
                    currentUser._id === user._id
                        ? response.data
                        : currentUser
                )
            );

            const statsResponse = await getStats(auth.accessToken);
            setStats(statsResponse.data);
            setSuccess(`El rol de ${user.username} fue actualizado.`);
        } catch (error) {
            setSelectedRoles(currentRoles => ({
                ...currentRoles,
                [user._id]: user.role
            }));
            setError(
                error.response?.data?.detail ||
                "No se pudo actualizar el rol del usuario."
            );
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (loading) {
        return (
            <main className="admin-page container" aria-busy="true">
                <p className="visually-hidden">Cargando panel administrativo...</p>
                <Skeleton className="admin-skeleton__title" />

                <section className="admin-skeleton__section">
                    <Skeleton className="admin-skeleton__heading" />
                    <div className="row g-3">
                        {Array.from({ length: 8 }, (_, index) => (
                            <div className="col-6 col-md-4 col-lg-3" key={index}>
                                <Card className="admin-skeleton__stat-card">
                                    <Card.Body>
                                        <Skeleton className="admin-skeleton__stat-label" />
                                        <Skeleton className="admin-skeleton__stat-value" />
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="admin-skeleton__section">
                    <Skeleton className="admin-skeleton__heading" />
                    <div className="table-responsive admin-skeleton__table-wrapper">
                        <Table className="admin-skeleton__table">
                            <thead>
                                <tr>
                                    {Array.from({ length: 5 }, (_, index) => (
                                        <th key={index}><Skeleton /></th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 4 }, (_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {Array.from({ length: 5 }, (_, cellIndex) => (
                                            <td key={cellIndex}><Skeleton /></td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </section>

                <section className="admin-skeleton__section">
                    <Skeleton className="admin-skeleton__heading" />
                    <div className="table-responsive admin-skeleton__table-wrapper">
                        <Table className="admin-skeleton__table">
                            <thead>
                                <tr>
                                    {Array.from({ length: 6 }, (_, index) => (
                                        <th key={index}><Skeleton /></th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 3 }, (_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {Array.from({ length: 6 }, (_, cellIndex) => (
                                            <td key={cellIndex}><Skeleton /></td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="admin-page container">
            <header className="admin-page__header">
                <div>
                    <p className="admin-page__eyebrow">Administración</p>
                    <h1>Panel administrativo</h1>
                </div>
                <p>Gestioná usuarios, negocios y métricas de la plataforma.</p>
            </header>

            {error && <Alert variant="danger">{error}</Alert>}
            <SuccessModal
                show={Boolean(success)}
                message={success}
                onHide={() => setSuccess("")}
            />

            <section className="admin-section">
                <h2>Resumen</h2>

                {stats ? (
                    <div className="row g-3">
                        {Object.entries(STAT_LABELS).map(([key, label]) => (
                            <div className="col-6 col-md-4 col-lg-3" key={key}>
                                <Card className="admin-stat-card">
                                    <Card.Body>
                                        <Card.Title>{label}</Card.Title>
                                        <Card.Text>{stats[key]}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay estadísticas disponibles.</p>
                )}
            </section>

            <section className="admin-section">
                <h2>Usuarios</h2>

                {users.length === 0 ? (
                    <p>No hay usuarios registrados.</p>
                ) : (
                    <div className="table-responsive admin-table-wrapper">
                    <Table className="admin-table" hover>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Rol actual</th>
                                <th>Nuevo rol</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                const isCurrentAdmin = user._id === auth.user._id;
                                const selectedRole = selectedRoles[user._id];
                                const isUpdating = updatingUserId === user._id;

                                return (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <Form.Select
                                                value={selectedRole || user.role}
                                                disabled={isCurrentAdmin || isUpdating}
                                                onChange={event =>
                                                    handleRoleSelection(
                                                        user._id,
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="seller">Seller</option>
                                                <option value="admin">Admin</option>
                                            </Form.Select>
                                        </td>
                                        <td>
                                            <Button
                                                disabled={
                                                    isCurrentAdmin ||
                                                    isUpdating ||
                                                    selectedRole === user.role
                                                }
                                                onClick={() => handleRoleUpdate(user)}
                                            >
                                                {isUpdating ? "Guardando..." : "Guardar"}
                                            </Button>
                                            {isCurrentAdmin && (
                                                <small className="d-block mt-1">
                                                    Sesión actual
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                    </div>
                )}
            </section>

            <section className="admin-section">
                <h2>Negocios</h2>

                {businesses.length === 0 ? (
                    <p>No hay negocios registrados.</p>
                ) : (
                    <div className="table-responsive admin-table-wrapper">
                    <Table className="admin-table" hover>
                        <thead>
                            <tr>
                                <th>Negocio</th>
                                <th>Categoría</th>
                                <th>Propietario</th>
                                <th>Email</th>
                                <th>Productos</th>
                                <th>Creado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {businesses.map(business => (
                                <tr key={business._id}>
                                    <td>{business.name}</td>
                                    <td>{business.category || "Sin categoría"}</td>
                                    <td>{business.owner_username || "No disponible"}</td>
                                    <td>{business.owner_email || "No disponible"}</td>
                                    <td>{business.product_count}</td>
                                    <td>
                                        {business.created_at
                                            ? new Date(
                                                business.created_at
                                            ).toLocaleDateString("es-AR")
                                            : "No disponible"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    </div>
                )}
            </section>
        </main>
    );
};

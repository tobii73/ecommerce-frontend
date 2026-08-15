import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { Badge, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faRightFromBracket, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { BrandLogo } from "./BrandLogo";
import "../styles/components/AppNavbar.css";

export const AppNavbar = () => {

    const {cart, setCart} = useContext(CartContext);
    const { auth, logout } = useContext(AuthContext);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setCart([]);
        logout();
        setShowLogoutConfirm(false);
    };

    const cartQuantity = cart.reduce(
    (total, product) => total + product.quantity,
    0
    );

    return (
        <Navbar className="app-navbar" data-bs-theme="dark">
            <Container>

                <Navbar.Brand as={Link} to="/">
                    <BrandLogo />
                </Navbar.Brand>

                <Nav className="me-auto">

                    <Nav.Link as={Link} to="/">
                        Inicio
                    </Nav.Link>

                    {auth.user && auth.accessToken && (
                        <>
                            <Nav.Link as={Link} to="/business">
                                Negocios
                            </Nav.Link>

                            <Nav.Link as={Link} to="/orders/my-orders">
                                Mis pedidos
                            </Nav.Link>

                            {auth.user.role === "seller" && (
                                <Nav.Link as={Link} to="/products">
                                    Productos
                                </Nav.Link>
                            )}

                            {auth.user.role === "admin" && (
                                <Nav.Link as={Link} to="/admin">
                                    Admin
                                </Nav.Link>
                            )}
                        </>
                    )}
                    <Nav.Link as={Link} to="/cart" className="app-navbar__cart-link" aria-label="Ir al carrito">
                        <FontAwesomeIcon icon={faCartShopping} />
                        <Badge className="app-navbar__cart-badge" bg="light" text="dark">
                            {cartQuantity}
                        </Badge>
                    </Nav.Link>
                </Nav>
                

                {auth.user && auth.accessToken ? (

                    <Button
                        variant="outline-light"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        Cerrar sesión
                    </Button>

                ) : (

                    <div className="d-flex gap-2">

                        <Button
                            as={Link}
                            to="/login"
                            variant="outline-light"
                        >
                            Iniciar sesión
                        </Button>

                        <Button
                            as={Link}
                            to="/register"
                            variant="light"
                        >
                            Registrarse
                        </Button>

                    </div>

                )}

            </Container>
            <Modal
                show={showLogoutConfirm}
                onHide={() => setShowLogoutConfirm(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-warning me-2"
                        />
                        Cerrar sesión
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Realmente querés cerrar sesión? Al continuar también se vaciará el carrito.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />
                        Cerrar sesión
                    </Button>
                </Modal.Footer>
            </Modal>
        </Navbar>
    );
};

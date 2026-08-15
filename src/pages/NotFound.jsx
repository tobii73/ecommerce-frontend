import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapSigns } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export const NotFound = () => (
    <main className="container py-5 text-center">
        <FontAwesomeIcon
            icon={faMapSigns}
            className="text-warning mb-3"
            size="4x"
        />
        <h1 className="mb-3">404</h1>
        <h2>Página no encontrada</h2>
        <p className="mb-4">
            La dirección ingresada no existe o la página fue movida.
        </p>
        <Button as={Link} to="/" variant="success">
            Volver al inicio
        </Button>
    </main>
);

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { Button, Modal } from "react-bootstrap";

export const SuccessModal = ({ show, message, onHide }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>
                <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="text-success me-2"
                />
                Operación exitosa
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
            <Button variant="success" onClick={onHide}>
                Aceptar
            </Button>
        </Modal.Footer>
    </Modal>
);

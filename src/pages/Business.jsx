import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { getMyBusiness, createBusiness, updateBusiness, deleteBusiness } from '../services/businessServices';
import { getCurrentUser } from "../services/authServices";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faTrash } from '@fortawesome/free-solid-svg-icons';
import { PendingSales } from '../components/PendingSales';
import { SuccessModal } from '../components/SuccessModal';
import { getErrorMessage } from '../utils/getErrorMessage';
import { hasValidationErrors, trimFormValues, validateBusiness } from '../utils/formValidation';
import { FormErrors } from '../components/FormErrors';
import { PRODUCT_CATEGORIES } from '../constants/productCategories';
import { getMyProducts } from '../services/productServices';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/LoadingSkeleton';
import '../styles/pages/Business.css';

export const Business = () => {

    const {auth, setAuth} = useContext(AuthContext)

    const [business, setBusiness] = useState(null);
    const [loadingBusiness, setLoadingBusiness] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: ""
    });

    const [editing, setEditing] = useState(false);

    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [creating, setCreating] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [productSummary, setProductSummary] = useState({
        count: 0,
        stock: 0
    });

    const handleChange = (e) => {
      const { name, value } = e.target;

      setFormData(current => ({
          ...current,
          [name]: value
      }));
      setFieldErrors(current => ({ ...current, [name]: "" }));
    };

    const handleEdit = () => {
        setError("");
        setFieldErrors({});
        setFormData({
            name: business.name,
            description: business.description || "",
            category: business.category || ""
        });

        setEditing(true);
        };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        const validationErrors = validateBusiness(formData);
        setFieldErrors(validationErrors);
        if (hasValidationErrors(validationErrors)) return;
        setUpdating(true);

        try {
            const response = await updateBusiness(
                business._id,
                trimFormValues(formData),
                auth.accessToken
            );

            setBusiness(response.data);
            setEditing(false);
            setSuccessMessage("El negocio se actualizó correctamente.");

        } catch (error) {
            setError(getErrorMessage(error, "No se pudo actualizar el negocio."));
        } finally {
            setUpdating(false)
        }
    };

    const handleClose = () => {
        setEditing(false);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      const validationErrors = validateBusiness(formData);
      setFieldErrors(validationErrors);
      if (hasValidationErrors(validationErrors)) return;
      setCreating(true);

      try {
          const response = await createBusiness(
              trimFormValues(formData),
              auth.accessToken
          );
          setBusiness(response.data);
          setProductSummary({ count: 0, stock: 0 });

          const userResponse = await getCurrentUser(auth.accessToken);

          setAuth({
            ...auth,
            user: userResponse.data
          });

          setFormData({
              name: "",
              description: "",
              category: ""
          });
          setSuccessMessage("El negocio se creó correctamente.");

      } catch (error) {
          setError(getErrorMessage(error, "No se pudo crear el negocio."));
      } finally {
          setCreating(false);
      }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError("");

        try {

            await deleteBusiness(
                business._id,
                auth.accessToken
            );

            setBusiness(null);
            setProductSummary({ count: 0, stock: 0 });
            const userResponse = await getCurrentUser(auth.accessToken);
            setAuth({
                ...auth,
                user:userResponse.data
            })
            setShowDeleteConfirm(false);
            setSuccessMessage("El negocio se eliminó correctamente.");

        } catch (error) {
            setError(getErrorMessage(error, "No se pudo eliminar el negocio."));

        } finally {

            setDeleting(false);

        }
    };

    useEffect(() => {

        const fetchBusiness = async () => {
            try {
                const response = await getMyBusiness(auth.accessToken);
                setBusiness(response.data);

                try {
                    const productsResponse = await getMyProducts(auth.accessToken);
                    const products = productsResponse.data;

                    setProductSummary({
                        count: products.length,
                        stock: products.reduce(
                            (total, product) => total + product.stock,
                            0
                        )
                    });
                } catch {
                    setProductSummary({ count: 0, stock: 0 });
                }
            } catch (error) {
                if (error.response?.status === 404) {
                  return;
                }
                setError(getErrorMessage(error, "No se pudo cargar el negocio."));
            } finally {
                setLoadingBusiness(false)
            }
        };

        fetchBusiness();

    }, [auth.accessToken]);

  return (
    <div className="business-page">
        <h1 className="business-page__title">Mi negocio</h1>
        <div className={`business-dashboard ${business || loadingBusiness ? "" : "business-dashboard--empty"}`}>
        <main className="business-dashboard__main">
        {loadingBusiness ? (
            <section className="business-summary-card business-summary-card--skeleton" aria-busy="true">
                <p className="visually-hidden">Cargando negocio...</p>
                <Skeleton className="business-skeleton__category" />
                <Skeleton className="business-skeleton__title" />
                <Skeleton className="business-skeleton__description" />
                <div className="business-summary-card__metrics">
                    <div><Skeleton className="business-skeleton__metric" /></div>
                    <div><Skeleton className="business-skeleton__metric" /></div>
                </div>
                <Skeleton className="business-skeleton__button" />
                <div className="business-skeleton__actions">
                    <Skeleton />
                    <Skeleton />
                </div>
            </section>
        ) :business ? (
            <section className="business-summary-card">
                <p className="business-summary-card__category">{business.category}</p>
                <h2>{business.name}</h2>
                <p className="business-summary-card__description">{business.description}</p>

                <div className="business-summary-card__metrics" aria-label="Resumen del negocio">
                    <div>
                        <strong>{productSummary.count}</strong>
                        <span>productos publicados</span>
                    </div>
                    <div>
                        <strong>{productSummary.stock}</strong>
                        <span>unidades disponibles</span>
                    </div>
                </div>

                <Button as={Link} to="/products" className="business-summary-card__products-link">
                    Administrar productos
                </Button>

                <div className="business-summary-card__actions">
                    <Button variant="outline-primary" onClick={handleEdit} disabled={deleting}>
                        Editar
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting}
                    >
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        Eliminar
                    </Button>
                </div>
                <Modal
                    show={editing}
                    onHide={() => !updating && handleClose()}
                    backdrop={updating ? "static" : true}
                    keyboard={!updating}
                >

                    <Modal.Header closeButton={!updating}>
                        <Modal.Title>Editar negocio</Modal.Title>
                    </Modal.Header>

                    <Form onSubmit={handleUpdate}>

                        <Modal.Body>

                            <Form.Group className="mb-3">
                                <Form.Label>Nombre</Form.Label>

                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <FormErrors errors={fieldErrors} />
                            {error && <p className="text-danger mb-0">{error}</p>}

                            <Form.Group className="mb-3">
                                <Form.Label>Descripción</Form.Label>

                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Categoría</Form.Label>

                                <Form.Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccioná una categoría</option>
                                    {PRODUCT_CATEGORIES.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                        </Modal.Body>

                        <Modal.Footer>

                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                disabled={updating}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="success"
                                type="submit"
                                disabled={updating}
                            >
                                {updating ? "Guardando..." : "Guardar cambios"}
                            </Button>

                        </Modal.Footer>

                    </Form>

                </Modal>

                <Modal
                    show={showDeleteConfirm}
                    onHide={() => !deleting && setShowDeleteConfirm(false)}
                    centered
                    backdrop={deleting ? "static" : true}
                    keyboard={!deleting}
                >
                    <Modal.Header closeButton={!deleting}>
                        <Modal.Title>
                            <FontAwesomeIcon
                                icon={faTriangleExclamation}
                                className="text-warning me-2"
                            />
                            Eliminar negocio
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>¿Realmente querés eliminar tu negocio?</p>
                        <p className="mt-2">
                            Al hacerlo perderás todos los productos que tenés
                            publicados. Esta acción no se puede deshacer.
                        </p>
                        {error && <p className="text-danger mb-0">{error}</p>}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            disabled={deleting}
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            <FontAwesomeIcon icon={faTrash} className="me-2" />
                            {deleting ? "Eliminando..." : "Aceptar"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </section>

        ) : (
            <section className="business-create-card" aria-labelledby="business-create-title">
                <header className="business-create-card__header">
                    <h2 id="business-create-title">Creá tu negocio</h2>
                    <p>Completá estos datos para empezar a publicar productos.</p>
                </header>
            <Form onSubmit={handleSubmit} className="business-create-form">
                <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>

                    <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nombre de tu negocio"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>

                    <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descripción de tu negocio"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Categoría</Form.Label>

                    <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Seleccioná una categoría</option>
                        {PRODUCT_CATEGORIES.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <FormErrors errors={fieldErrors} />
                {error && <p className="text-danger">{error}</p>}

                <Button variant="success" type="submit" disabled={creating}>
                    {creating ? "Creando..." : "Crear negocio"}
                </Button>
            </Form>
            </section>
        )}
        </main>

        {loadingBusiness ? (
            <aside className="pending-sales pending-sales--skeleton" aria-busy="true">
                <div className="pending-sales__header">
                    <Skeleton className="business-skeleton__pending-title" />
                    <Skeleton className="business-skeleton__badge" />
                </div>
                <Skeleton className="business-skeleton__sale-card" />
                <Skeleton className="business-skeleton__sale-card" />
            </aside>
        ) : business && <PendingSales />}
        </div>
        <SuccessModal
            show={Boolean(successMessage)}
            message={successMessage}
            onHide={() => setSuccessMessage("")}
        />
    </div>
  )
}

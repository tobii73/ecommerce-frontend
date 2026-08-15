import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMyProducts, createProduct, updateProduct, deleteProduct } from "../services/productServices";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { SuccessModal } from "../components/SuccessModal";
import { getErrorMessage } from "../utils/getErrorMessage";
import { formatCurrency } from "../utils/formatCurrency";
import { hasValidationErrors, trimFormValues, validateProduct } from "../utils/formValidation";
import { FormErrors } from "../components/FormErrors";
import { ProductImage } from "../components/ProductImage";
import { PRODUCT_CATEGORIES } from "../constants/productCategories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Table from "react-bootstrap/Table";
import "../styles/pages/Products.css";
import { Skeleton } from "../components/LoadingSkeleton";

export const Products = () => {

    const { auth } = useContext(AuthContext);
    // Create Products hooks
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);

    // Update Products hooks
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [updating, setUpdating] = useState(false);


    // Delete Products hooks
    const [deletingId, setDeletingId] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: ""
    });



    const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(current => ({
        ...current,
        [name]: value
    }));
    setFieldErrors(current => ({ ...current, [name]: "" }));
    };

    const resetImage = () => {
        setImageFile(null);
        setImagePreview("");
    };

    const closeCreateModal = () => {
        if (creating) return;

        setShowCreate(false);
        setError("");
        setFieldErrors({});
        resetImage();
    };

    const handleImageChange = event => {
        const selectedImage = event.target.files?.[0];

        if (!selectedImage) {
            resetImage();
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(selectedImage.type)) {
            resetImage();
            setFieldErrors(current => ({
                ...current,
                image: "La imagen debe ser JPG, PNG o WebP."
            }));
            return;
        }

        if (selectedImage.size > 5 * 1024 * 1024) {
            resetImage();
            setFieldErrors(current => ({
                ...current,
                image: "La imagen no puede superar los 5 MB."
            }));
            return;
        }

        setImageFile(selectedImage);
        setImagePreview(URL.createObjectURL(selectedImage));
        setFieldErrors(current => ({ ...current, image: "" }));
    };

    useEffect(() => () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);
    const handleCreate = async (e) => {
      e.preventDefault();
      setError("");
      const validationErrors = validateProduct(formData);
      if (!imageFile) {
          validationErrors.image = "Debés seleccionar una imagen para el producto.";
      }
      setFieldErrors(validationErrors);
      if (hasValidationErrors(validationErrors)) return;
      setCreating(true);

      try {
          const response = await createProduct(
              trimFormValues(formData),
              imageFile,
              auth.accessToken
          );

          setProducts(current => [...current, response.data]);

          setShowCreate(false);
          setSuccessMessage("El producto se creó correctamente.");

          setFormData({
              name: "",
              description: "",
              price: "",
              stock: "",
              category: ""
          });
          resetImage();

      } catch (error) {
          setError(getErrorMessage(error, "No se pudo crear el producto."));

      } finally {

          setCreating(false);

      }
    };

    const handleEditClick = (product) => {

      setSelectedProduct(product);
      setError("");
      setFieldErrors({});

      setFormData({
          name: product.name,
          description: product.description || "",
          price: product.price,
          stock: product.stock,
          category: product.category || ""
      });

      setShowEdit(true);
    };

    const handleUpdate = async (e) => {

      e.preventDefault();
      setError("");
      const validationErrors = validateProduct(formData);
      setFieldErrors(validationErrors);
      if (hasValidationErrors(validationErrors)) return;
      setUpdating(true);

      try {

          const response = await updateProduct(
              selectedProduct._id,
              trimFormValues(formData),
              auth.accessToken
          );

          setProducts(current =>
              current.map((product) =>
                  product._id === selectedProduct._id
                      ? response.data
                      : product
              )
          );

          setShowEdit(false);
          setSelectedProduct(null);
          setSuccessMessage("El producto se actualizó correctamente.");

      } catch (error) {
          setError(getErrorMessage(error, "No se pudo actualizar el producto."));

      } finally {

          setUpdating(false);

      }
    };

    const handleDelete = async () => {
      if (!productToDelete) return;

      const productId = productToDelete._id;

      setDeletingId(productId);
      setError("");

      try {

          await deleteProduct(
              productId,
              auth.accessToken
          );

          setProducts(current =>
              current.filter(
                  product => product._id !== productId
              )
          );
          setProductToDelete(null);
          setSuccessMessage("El producto se eliminó correctamente.");

      } catch (error) {
          setError(getErrorMessage(error, "No se pudo eliminar el producto."));

      } finally {

          setDeletingId(null);

      }
    };

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response = await getMyProducts(
                    auth.accessToken
                );

                setProducts(response.data);

            } catch (error) {
                setError(getErrorMessage(error, "No se pudieron cargar los productos."));

            } finally {

                setLoadingProducts(false);

            }
        };

        fetchProducts();

    }, [auth.accessToken]);


    if (loadingProducts) {
        return (
            <main className="products-page container" aria-busy="true">
                <header className="products-page__header">
                    <div>
                        <Skeleton className="products-skeleton__eyebrow" />
                        <Skeleton className="products-skeleton__title" />
                    </div>
                    <Skeleton className="products-skeleton__create-button" />
                </header>

                <section className="table-responsive products-table-wrapper">
                    <p className="visually-hidden">Cargando productos...</p>
                    <Table className="products-table products-table--skeleton">
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Producto</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }, (_, index) => (
                                <tr key={index}>
                                    <td><Skeleton className="products-skeleton__image" /></td>
                                    <td><Skeleton className="products-skeleton__name" /></td>
                                    <td><Skeleton className="products-skeleton__description" /></td>
                                    <td><Skeleton className="products-skeleton__category" /></td>
                                    <td><Skeleton className="products-skeleton__price" /></td>
                                    <td><Skeleton className="products-skeleton__stock" /></td>
                                    <td>
                                        <div className="products-skeleton__actions">
                                            <Skeleton />
                                            <Skeleton />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </section>
            </main>
        );
    }


    return (
        <main className="products-page container">

            <header className="products-page__header">
                <div>
                    <p className="products-page__eyebrow">Panel de vendedor</p>
                    <h1>Mis productos</h1>
                </div>
            {
              <Button
                className="products-page__create-button"
                onClick={() => {
                    setError("");
                    setFieldErrors({});
                    resetImage();
                    setShowCreate(true);
                }}
                disabled={deletingId !== null}
              >
                Crear producto
              </Button>
            }
            </header>
            <section className="products-page__content">

                {error && !showCreate && !showEdit && (
                    <p className="text-danger">{error}</p>
                )}

                {products.length === 0 ? (

                    <p>No tenés productos creados.</p>

                ) : (

                    <div className="table-responsive products-table-wrapper">
                        <Table className="products-table" hover>
                            <thead>
                                <tr>
                                    <th scope="col">Imagen</th>
                                    <th scope="col">Producto</th>
                                    <th scope="col">Descripción</th>
                                    <th scope="col">Categoría</th>
                                    <th scope="col">Precio</th>
                                    <th scope="col">Stock</th>
                                    <th scope="col" className="products-table__actions-heading">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <ProductImage
                                                product={product}
                                                className="products-table__image"
                                            />
                                        </td>
                                        <td className="products-table__name">{product.name}</td>
                                        <td className="products-table__description">{product.description || "Sin descripción"}</td>
                                        <td><span className="products-table__category">{product.category}</span></td>
                                        <td className="products-table__price">{formatCurrency(product.price)}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <div className="products-table__actions">
                                                <Button
                                                    className="products-table__edit-button"
                                                    onClick={() => handleEditClick(product)}
                                                    disabled={deletingId !== null}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => {
                                                        setError("");
                                                        setProductToDelete(product);
                                                    }}
                                                    disabled={deletingId !== null}
                                                >
                                                    {deletingId === product._id
                                                        ? "Eliminando..."
                                                        : "Eliminar"
                                                    }
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </section>
            {
                <Modal
                  show={showCreate}
                  onHide={closeCreateModal}
                  backdrop={creating ? "static" : true}
                  keyboard={!creating}
                >
                  <Modal.Header closeButton={!creating}>
                      <Modal.Title>
                          Crear producto
                      </Modal.Title>
                  </Modal.Header>

                  <Form onSubmit={handleCreate}>

                      <Modal.Body>

                          <Form.Group className="mb-3">
                              <Form.Label>Nombre</Form.Label>

                              <Form.Control
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  placeholder="Nombre del producto"
                              />
                          </Form.Group>


                          <Form.Group className="mb-3">
                              <Form.Label>Descripción</Form.Label>

                              <Form.Control
                                  as="textarea"
                                  name="description"
                                  value={formData.description}
                                  onChange={handleChange}
                                  placeholder="Descripción del producto"
                              />
                          </Form.Group>


                          <Form.Group className="mb-3">
                              <Form.Label>Precio</Form.Label>

                              <Form.Control
                                  type="number"
                                  name="price"
                                  value={formData.price}
                                  onChange={handleChange}
                                  min="0"
                                  step="0.01"
                              />
                          </Form.Group>


                          <Form.Group className="mb-3">
                              <Form.Label>Stock</Form.Label>

                              <Form.Control
                                  type="number"
                                  name="stock"
                                  value={formData.stock}
                                  onChange={handleChange}
                                  min="1"
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

                          <Form.Group className="mb-3">
                              <Form.Label>Imagen</Form.Label>
                              <Form.Control
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={handleImageChange}
                              />
                              <Form.Text className="text-muted">
                                  Formatos permitidos: JPG, PNG o WebP. Máximo 5 MB.
                              </Form.Text>
                          </Form.Group>

                          {imagePreview && (
                              <img
                                  src={imagePreview}
                                  alt="Vista previa del producto"
                                  className="product-image-preview mb-3"
                              />
                          )}

                          <FormErrors errors={fieldErrors} />
                          {error && <p className="text-danger mb-0">{error}</p>}

                      </Modal.Body>

                      <Modal.Footer>

                          <Button
                              variant="secondary"
                              onClick={closeCreateModal}
                              disabled={creating}
                          >
                              Cancelar
                          </Button>

                          <Button
                              variant="success"
                              type="submit"
                              disabled={creating}
                          >
                              {creating
                                  ? "Creando..."
                                  : "Crear producto"
                              }
                          </Button>

                      </Modal.Footer>

                  </Form>

                </Modal>
            }
            {
              <Modal
                  show={showEdit}
                  onHide={() => !updating && setShowEdit(false)}
                  backdrop={updating ? "static" : true}
                  keyboard={!updating}
              >
                <Modal.Header closeButton={!updating}>

                    <Modal.Title>
                        Editar producto
                    </Modal.Title>

                </Modal.Header>

                <Form onSubmit={handleUpdate}>

                    <Modal.Body>

                        <Form.Group className="mb-3">

                            <Form.Label>
                                Nombre
                            </Form.Label>

                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />

                        </Form.Group>


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Descripción
                            </Form.Label>

                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />

                        </Form.Group>


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Precio
                            </Form.Label>

                            <Form.Control
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />

                        </Form.Group>


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Stock
                            </Form.Label>

                            <Form.Control
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="1"
                            />

                        </Form.Group>


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Categoría
                            </Form.Label>

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
                        {error && <p className="text-danger mb-0">{error}</p>}

                    </Modal.Body>


                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={() => setShowEdit(false)}
                            disabled={updating}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="success"
                            type="submit"
                            disabled={updating}
                        >
                            {updating
                                ? "Guardando..."
                                : "Guardar cambios"
                            }
                        </Button>

                    </Modal.Footer>
                </Form>
            </Modal>
            }
            <Modal
                show={Boolean(productToDelete)}
                onHide={() => !deletingId && setProductToDelete(null)}
                centered
                backdrop={deletingId ? "static" : true}
                keyboard={!deletingId}
            >
                <Modal.Header closeButton={!deletingId}>
                    <Modal.Title>
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-warning me-2"
                        />
                        Eliminar producto
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>
                        ¿Realmente querés eliminar
                        {" "}<strong>{productToDelete?.name}</strong>?
                    </p>
                    <p className="mt-2">
                        Esta acción eliminará el producto y su imagen. No se puede deshacer.
                    </p>
                    {error && <p className="text-danger mb-0">{error}</p>}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        disabled={Boolean(deletingId)}
                        onClick={() => setProductToDelete(null)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        disabled={Boolean(deletingId)}
                        onClick={handleDelete}
                    >
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        {deletingId ? "Eliminando..." : "Eliminar producto"}
                    </Button>
                </Modal.Footer>
            </Modal>
            <SuccessModal
                show={Boolean(successMessage)}
                message={successMessage}
                onHide={() => setSuccessMessage("")}
            />
        </main>
    );
};

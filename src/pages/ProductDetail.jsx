import { useContext, useEffect, useRef, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";

import { CartContext } from "../context/CartContext";
import { ProductImage } from "../components/ProductImage";
import { getAllProducts, getProductById } from "../services/productServices";
import { formatCurrency } from "../utils/formatCurrency";
import { getErrorMessage } from "../utils/getErrorMessage";
import { Skeleton } from "../components/LoadingSkeleton";
import "../styles/pages/ProductDetail.css";

export const ProductDetail = () => {
    const { productId } = useParams();
    const { cart, setCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState("");
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const navigationInProgress = useRef(false);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            setError("");
            setRelatedProducts([]);

            try {
                const response = await getProductById(productId);
                setProduct(response.data);

                try {
                    const catalogResponse = await getAllProducts();
                    const related = catalogResponse.data
                        .filter(candidate =>
                            candidate._id !== response.data._id &&
                            candidate.category === response.data.category
                        )
                        .slice(0, 4);

                    setRelatedProducts(related);
                } catch {
                    setRelatedProducts([]);
                }
            } catch (requestError) {
                setError(getErrorMessage(
                    requestError,
                    "No se pudo cargar el producto."
                ));
            } finally {
                setLoading(false);
                navigationInProgress.current = false;
                setIsNavigating(false);
            }
        };

        loadProduct();
    }, [productId]);

    const addToCart = (goToCart = false) => {
        const existingProduct = cart.find(item => item._id === product._id);
        const currentQuantity = existingProduct?.quantity || 0;

        if (product.stock <= 0) {
            setCartMessage("Este producto no tiene stock disponible.");
            return;
        }

        if (currentQuantity >= product.stock) {
            setCartMessage(`No podés agregar más de ${product.stock} unidades.`);
            return;
        }

        setCart(currentCart => {
            const productInCart = currentCart.find(
                item => item._id === product._id
            );

            if (productInCart) {
                return currentCart.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentCart, { ...product, quantity: 1 }];
        });

        setCartMessage("Producto agregado al carrito.");

        if (goToCart) {
            navigate("/cart");
        }
    };

    const handleRelatedProductClick = event => {
        if (navigationInProgress.current) {
            event.preventDefault();
            return;
        }

        navigationInProgress.current = true;
        setIsNavigating(true);
    };

    if (loading) {
        return (
            <main className="product-detail-page container" aria-busy="true">
                <section className="product-detail-layout product-detail-layout--skeleton">
                    <Skeleton className="product-detail-skeleton__image" />
                    <div className="product-detail-skeleton__info">
                        <Skeleton className="product-detail-skeleton__category" />
                        <Skeleton className="product-detail-skeleton__title" />
                        <Skeleton className="product-detail-skeleton__description" />
                    </div>
                    <aside className="product-detail-purchase-card">
                        <Skeleton className="product-detail-skeleton__price" />
                        <Skeleton className="product-detail-skeleton__stock" />
                        <Skeleton className="product-detail-skeleton__button" />
                        <Skeleton className="product-detail-skeleton__button" />
                    </aside>
                </section>
            </main>
        );
    }

    if (error || !product) {
        return (
            <div className="container mt-4">
                <p className="text-danger">
                    {error || "Producto no encontrado."}
                </p>
                <Button as={Link} to="/" variant="outline-secondary">
                    Volver al catálogo
                </Button>
            </div>
        );
    }

    const quantityInCart = cart.find(
        item => item._id === product._id
    )?.quantity || 0;
    const cannotAddToCart = product.stock <= 0 || quantityInCart >= product.stock;

    return (
        <main className="product-detail-page container">
            <Button as={Link} to="/" variant="outline-secondary" className="product-detail-page__back-link">
                Volver al catálogo
            </Button>

            <section className="product-detail-layout">
                <div className="product-detail-gallery">
                    <ProductImage product={product} className="product-detail-image" />
                </div>

                <section className="product-detail-info">
                    <p className="product-detail-info__category">{product.category}</p>
                    <h1>{product.name}</h1>
                    <p className="product-detail-info__description">{product.description}</p>
                </section>

                <aside className="product-detail-purchase-card">
                    <p className="product-detail-purchase-card__price">
                        {formatCurrency(product.price)}
                    </p>
                    <p className="product-detail-purchase-card__stock">
                        Stock disponible: <strong>{product.stock}</strong>
                    </p>
                    <Button
                        className="product-detail-purchase-card__buy-button"
                        onClick={() => addToCart(true)}
                        disabled={cannotAddToCart}
                    >
                        {cannotAddToCart ? "Sin stock disponible" : "Comprar ahora"}
                    </Button>
                    <Button
                        className="product-detail-purchase-card__cart-button"
                        onClick={() => addToCart()}
                        disabled={cannotAddToCart}
                    >
                        {product.stock <= 0
                            ? "Sin stock"
                            : quantityInCart >= product.stock
                                ? "Stock máximo en el carrito"
                                : "Agregar al carrito"}
                    </Button>

                    {cartMessage && (
                        <p className={cannotAddToCart ? "text-danger product-detail-purchase-card__message" : "text-success product-detail-purchase-card__message"}>
                            {cartMessage}
                        </p>
                    )}
                </aside>
            </section>

            <aside
                className={`related-products mt-5 ${isNavigating ? "related-products--loading" : ""}`}
                aria-labelledby="related-products-title"
                aria-busy={isNavigating}
            >
                <h2 id="related-products-title">Productos relacionados</h2>

                {isNavigating && (
                    <p className="related-products__loading">
                        <Spinner animation="border" size="sm" aria-hidden="true" />
                        Cargando producto...
                    </p>
                )}

                {relatedProducts.length === 0 ? (
                    <p>No hay otros productos de esta categoría por el momento.</p>
                ) : (
                    <div className="related-products__list">
                        {relatedProducts.map(relatedProduct => (
                            <Card
                                key={relatedProduct._id}
                                className="related-products__card"
                            >
                                <Card.Body>
                                    <Link
                                        to={`/products/${relatedProduct._id}`}
                                        aria-label={`Ver ${relatedProduct.name}`}
                                        onClick={handleRelatedProductClick}
                                    >
                                        <ProductImage
                                            product={relatedProduct}
                                            className="related-products__image"
                                        />
                                    </Link>
                                    <Card.Title as="h3">
                                        <Link
                                            to={`/products/${relatedProduct._id}`}
                                            onClick={handleRelatedProductClick}
                                        >
                                            {relatedProduct.name}
                                        </Link>
                                    </Card.Title>
                                    <Card.Text>
                                        {formatCurrency(relatedProduct.price)}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
            </aside>
        </main>
    );
};

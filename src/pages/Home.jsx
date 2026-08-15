import React, { useEffect, useState, useContext, useMemo } from "react";
import { getAllProducts } from "../services/productServices";
import { CartContext } from "../context/CartContext";
import Button from 'react-bootstrap/Button';
import { formatCurrency } from "../utils/formatCurrency";
import { ProductImage } from "../components/ProductImage";
import { PRODUCT_CATEGORIES } from "../constants/productCategories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Carousel, Form, InputGroup } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import alfajoresBanner from "../assets/banners/alfajores-banner.png";
import tecnologiaBanner from "../assets/banners/tecnologia-banner.png";
import mascotasBanner from "../assets/banners/mascotas-banner.png";
import modaBanner from "../assets/banners/moda-banner.png";
import "../styles/pages/Home.css";
import { ProductCardSkeleton, Skeleton } from "../components/LoadingSkeleton";

const carouselSlides = [
  {
    image: alfajoresBanner,
    category: "Supermercado",
    eyebrow: "Un clásico para disfrutar",
    title: "Alfajores que alegran el día",
    description: "Encontrá tus favoritos y sumalos al carrito.",
    buttonText: "Ver supermercado"
  },
  {
    image: tecnologiaBanner,
    category: "Tecnología",
    eyebrow: "Día del Niño",
    title: "Elegí el regalo ideal",
    description: "Tecnología, juegos y accesorios para sorprender.",
    buttonText: "Explorar tecnología"
  },
  {
    image: mascotasBanner,
    category: "Mascotas",
    eyebrow: "Para quienes son parte de la familia",
    title: "Todo para tus mascotas",
    description: "Alimento, accesorios y cuidados para cada día.",
    buttonText: "Ver productos para mascotas"
  },
  {
    image: modaBanner,
    category: "Moda",
    eyebrow: "Renová tu estilo",
    title: "Zapatillas en 3 y 6 cuotas",
    description: "Sin interés para que elijas el par que más te gusta.",
    buttonText: "Ver moda"
  }
];

export const Home = () => {

  const { cart, setCart } = useContext(CartContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cartMessages, setCartMessages] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  

  const addToCart = (product) => {
    const existingProduct = cart.find(
        item => item._id === product._id
    );
    const currentQuantity = existingProduct?.quantity || 0;

    if (product.stock <= 0) {
        setCartMessages(current => ({
            ...current,
            [product._id]: "Este producto no tiene stock disponible."
        }));
        return;
    }

    if (currentQuantity >= product.stock) {
        setCartMessages(current => ({
            ...current,
            [product._id]: `No podés agregar más de ${product.stock} unidades.`
        }));
        return;
    }

    if (existingProduct) {

        setCart(currentCart =>
            currentCart.map(item =>
                item._id === product._id
                    ? {
                        ...item,
                        quantity: item.quantity + 1
                    }
                    : item
            )
        );

    } else {

        setCart(currentCart => [
            ...currentCart,
            {
                ...product,
                quantity: 1
            }
        ]);

    }

    setCartMessages(current => ({
        ...current,
        [product._id]: "Producto agregado al carrito."
    }));
  };  

  useEffect(() => {

    const fetchProducts = async () => {

        try {

            const response = await getAllProducts();

            setProducts(response.data);

        } catch (error) {
            setLoadError(
                error.response?.data?.detail ||
                "No se pudieron cargar los productos."
            );

        } finally {

            setLoadingProducts(false);

        }

    };

    fetchProducts();

  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    setSelectedCategory(
      PRODUCT_CATEGORIES.includes(categoryFromUrl) ? categoryFromUrl : ""
    );
  }, [searchParams]);

  const availableCategories = useMemo(
    () => PRODUCT_CATEGORIES.filter(category =>
      products.some(product => product.category === category)
    ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLocaleLowerCase("es-AR");

    return products.filter(product => {
      const matchesName = product.name
        .toLocaleLowerCase("es-AR")
        .includes(normalizedSearchTerm);
      const matchesCategory = !selectedCategory ||
        product.category === selectedCategory;

      return matchesName && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleSearch = event => {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setSelectedCategory("");
    setSearchParams({});
  };

  const handleCategoryChange = event => {
    const category = event.target.value;
    setSelectedCategory(category);
    setSearchParams(category ? { category } : {});
  };

  if (loadingProducts) {
    return (
      <main className="home-page" aria-busy="true" aria-live="polite">
        <section className="home-hero">
          <Skeleton className="home-hero-skeleton" />
        </section>
        <section className="home-catalog container">
          <p className="visually-hidden">Cargando productos...</p>
          <Skeleton className="home-skeleton__heading" />
          <Skeleton className="home-skeleton__filters" />
          <div className="product-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </main>
    );
  }
  return (
    <main className="home-page">

        <section className="home-hero" aria-label="Promociones destacadas">
          <Carousel fade interval={5000} pause={false} ride="carousel">
            {carouselSlides.map(slide => (
              <Carousel.Item key={slide.category}>
                <img className="home-hero__image" src={slide.image} alt="" />
                <div className="home-hero__content">
                  <p className="home-hero__eyebrow">{slide.eyebrow}</p>
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                  <Button as={Link} to={`/?category=${encodeURIComponent(slide.category)}`}>
                    {slide.buttonText}
                  </Button>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </section>

      <section className="home-catalog container" aria-labelledby="catalog-title">
        <p className="home-catalog__eyebrow">Catálogo</p>
        <h2 id="catalog-title">Encontrá lo que necesitás</h2>

        {loadError && <p className="text-danger">{loadError}</p>}

        <Form onSubmit={handleSearch} className="home-filters mb-4">
          <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
            <InputGroup>
              <Form.Control
                type="search"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="Buscar por nombre"
                aria-label="Buscar productos por nombre"
              />
              <Button type="submit" aria-label="Buscar">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
            </InputGroup>

            <Form.Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              aria-label="Filtrar productos por categoría"
            >
              <option value="">Todas las categorías</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>

            {(searchTerm || selectedCategory) && (
              <Button type="button" variant="outline-secondary" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </Form>

        {products.length > 0 && (
          <p className="mb-3">
            {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"} encontrado{filteredProducts.length === 1 ? "" : "s"}
          </p>
        )}

        {products.length === 0 ? (

            <p>No hay productos disponibles.</p>

        ) : (

            filteredProducts.length === 0 ? (
              <div>
                <p>No encontramos productos con esos filtros.</p>
                <Button variant="outline-secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
            <div className="product-grid">
            {filteredProducts.map((product) => {
                const quantityInCart = cart.find(
                    item => item._id === product._id
                )?.quantity || 0;
                const reachedStock = quantityInCart >= product.stock;

                return (

                <article key={product._id} className="home-product-card">

                    <Link to={`/products/${product._id}`} aria-label={`Ver ${product.name}`}>
                      <ProductImage product={product} className="home-product-card__image" />
                    </Link>

                    <div className="home-product-card__body">
                    <h3 className="home-product-card__title">
                      <Link to={`/products/${product._id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    <p>
                        Precio: {formatCurrency(product.price)}
                    </p>

                    <p>
                        Categoría: {product.category}
                    </p>
                    <Button
                      variant="success"
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0 || reachedStock}
                    >
                      {product.stock <= 0
                          ? "Sin stock"
                          : reachedStock
                              ? "Stock máximo en el carrito"
                              : "Agregar al carrito"}
                    </Button>

                    {cartMessages[product._id] && (
                        <p className={
                            reachedStock || product.stock <= 0
                                ? "text-danger"
                                : "text-success"
                        }>
                            {cartMessages[product._id]}
                        </p>
                    )}

                    </div>
                </article>

                );
            })}
            </div>
            )

        )}

      </section>
    </main>
  )
}

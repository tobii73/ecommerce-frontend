import { Link } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import "../styles/components/AppFooter.css";

export const AppFooter = () => (
  <footer className="app-footer">
    <div className="container app-footer__content">
      <div className="app-footer__brand">
        <BrandLogo />
        <p>Una forma simple de descubrir y comprar productos de negocios locales.</p>
      </div>

      <div>
        <h2>Navegación</h2>
        <nav className="app-footer__links" aria-label="Navegación del pie de página">
          <Link to="/">Inicio</Link>
          <Link to="/cart">Carrito</Link>
          <Link to="/orders/my-orders">Mis pedidos</Link>
        </nav>
      </div>

      <div>
        <h2>Redes sociales</h2>
        <nav className="app-footer__links" aria-label="Redes sociales">
          <Link to="/social/instagram">Instagram</Link>
          <Link to="/social/facebook">Facebook</Link>
          <Link to="/social/x">X</Link>
        </nav>
      </div>
    </div>
    <div className="app-footer__bottom">
      © {new Date().getFullYear()} JD. Proyecto de práctica.
    </div>
  </footer>
);

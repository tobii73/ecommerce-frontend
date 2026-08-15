import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping } from "@fortawesome/free-solid-svg-icons";
import "../styles/components/BrandLogo.css";

export const BrandLogo = () => (
  <span className="brand-logo">
    <span className="brand-logo__icon" aria-hidden="true">
      <FontAwesomeIcon icon={faBagShopping} />
    </span>
    <span className="brand-logo__text">JD</span>
  </span>
);

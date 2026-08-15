import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export const ProductImage = ({ product, className = "" }) => {
    const [hasError, setHasError] = useState(false);

    if (!product.image_url || hasError) {
        return (
            <div className={`product-image-placeholder ${className}`}>
                <FontAwesomeIcon icon={faImage} />
                <span>Sin imagen</span>
            </div>
        );
    }

    return (
        <img
            src={product.image_url}
            alt={product.name}
            className={`product-image ${className}`}
            onError={() => setHasError(true)}
        />
    );
};

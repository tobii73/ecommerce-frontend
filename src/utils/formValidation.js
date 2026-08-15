const validateText = (value, label, { min = 2, max, required = true }) => {
    const trimmedValue = value.trim();

    if (required && !trimmedValue) return `${label} es obligatorio.`;
    if (!required && !trimmedValue) return "";
    if (trimmedValue.length < min) return `${label} debe tener al menos ${min} caracteres.`;
    if (trimmedValue.length > max) return `${label} no puede superar los ${max} caracteres.`;
    return "";
};

export const validateProduct = product => ({
    name: validateText(product.name, "El nombre", { max: 80 }),
    description: validateText(product.description, "La descripción", {
        min: 5,
        max: 500
    }),
    category: validateText(product.category, "La categoría", { max: 60 }),
    price:
        !String(product.price).trim()
            ? "El precio es obligatorio."
            : !Number.isFinite(Number(product.price)) || Number(product.price) <= 0
                ? "El precio debe ser mayor que cero."
                : "",
    stock:
        !String(product.stock).trim()
            ? "El stock es obligatorio."
            : !Number.isInteger(Number(product.stock)) || Number(product.stock) < 0
                ? "El stock debe ser un número entero igual o mayor que cero."
                : ""
});

export const validateBusiness = business => ({
    name: validateText(business.name, "El nombre", { max: 80 }),
    description: validateText(business.description, "La descripción", {
        min: 5,
        max: 500
    }),
    category: validateText(business.category, "La categoría", { max: 60 })
});

export const hasValidationErrors = errors => Object.values(errors).some(Boolean);

export const trimFormValues = values => Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value
    ])
);

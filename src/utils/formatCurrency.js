const arsFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const formatCurrency = value => {
    const numericValue = Number(value);
    return arsFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
};

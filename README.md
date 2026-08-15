# JD Ecommerce — Frontend

Aplicación de ecommerce desarrollada con React. Permite explorar productos, filtrarlos por nombre o categoría, administrar un carrito, crear pedidos y gestionar negocios, productos y usuarios según el rol autenticado.

El proyecto fue creado como práctica para consolidar conocimientos de React y consumo de APIs desarrolladas con Python/FastAPI.

## Demo

Podés probar la aplicación publicada en Vercel: [JD Ecommerce](https://ecommerce-frontend-theta-teal-23.vercel.app/).

## Tecnologías

- React 19 y Vite
- React Router
- Axios
- React Bootstrap y Font Awesome
- CSS modular por página y componente
- API REST propia desarrollada con FastAPI

## Funcionalidades principales

### Cliente

- Registro e inicio de sesión.
- Catálogo público con carrusel, buscador y filtro por categoría.
- Detalle de producto con productos relacionados.
- Carrito persistente con validación de stock.
- Acción de compra inmediata y creación de pedidos.
- Historial de pedidos y detalle de cada compra.

### Vendedor

- Creación y edición de un negocio.
- Gestión de productos: crear, editar y eliminar.
- Carga de imágenes de productos.
- Resumen de productos, unidades disponibles y ventas pendientes.

### Administración

- Visualización de métricas generales.
- Gestión de roles de usuarios.
- Consulta de negocios registrados.

## Experiencia de usuario

- Diseño responsive basado en una paleta azul común.
- Estados de carga mediante loading skeletons en las vistas que consultan datos.
- Mensajes visibles de error y modales de éxito.
- Confirmaciones para acciones irreversibles, como eliminar productos o negocios.
- Página 404 para rutas inexistentes.

## Ejecutar el proyecto localmente

### Requisitos

- Node.js 18 o superior.
- El backend de FastAPI ejecutándose localmente o desplegado.

### Instalación

```bash
git clone https://github.com/tobii73/ecommerce-frontend.git
cd ecommerce-frontend
npm install
```

Copiá el archivo de variables de entorno:

```bash
copy .env.example .env.local
```

Luego configurá la URL del backend en `.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Iniciá la aplicación:

```bash
npm run dev
```

Para generar una versión de producción:

```bash
npm run build
```

## Estructura relevante

```text
src/
├── components/   # Componentes reutilizables: navbar, footer, modales y skeletons
├── context/      # Estado global de autenticación y carrito
├── pages/        # Vistas y rutas de la aplicación
├── services/     # Peticiones a la API
├── styles/       # Estilos globales, por componente y por página
└── utils/        # Validaciones, formateo y manejo de errores
```

## Decisiones técnicas para explicar el proyecto

- El carrito usa actualizaciones funcionales (`setCart(current => ...)`) para evitar perder cambios por estados desactualizados.
- El frontend valida el stock para mejorar la experiencia, pero el backend mantiene la validación definitiva al crear un pedido.
- Las imágenes se cargan como `FormData` para enviarlas junto con los datos del producto.
- Los filtros del carrusel se reflejan en la URL mediante parámetros como `?category=Mascotas`.
- Los tokens y el carrito se recuperan de forma segura desde almacenamiento local, contemplando valores inválidos.
- Los errores HTTP se traducen a mensajes entendibles para el usuario.

## Próximas mejoras

- Incorporar filtros avanzados y paginación cuando el catálogo crezca.
- Agregar recuperación de contraseña y verificación de email.
- Incluir pruebas automatizadas para componentes y servicios.
- Reemplazar los enlaces sociales de ejemplo por perfiles reales al publicar el proyecto.

# Análisis técnico del frontend Ecommerce

Fecha del análisis: 13 de agosto de 2026.

## 1. Resumen ejecutivo

El proyecto es una SPA de ecommerce construida con React 19 y Vite 8. Consume el backend FastAPI de forma directa mediante Axios y ya cubre registro, login, catálogo público, carrito persistente, creación y consulta de pedidos, creación/edición de negocios y CRUD de productos.

La estructura es adecuada para el tamaño actual: páginas, servicios HTTP, contextos y componentes están separados. Sin embargo, antes de seguir ampliando el panel del vendedor conviene corregir la protección por roles, centralizar el manejo del token, completar errores y estados de carga, y resolver algunas inconsistencias entre rutas y permisos.

El punto natural para incorporar las ventas pendientes es el panel de negocio o una subvista asociada. El backend ya ofrece `GET /orders/my-sales`, pero el frontend todavía no tiene un servicio ni una interfaz que lo consuma.

## 2. Alcance revisado

Se revisaron:

- Configuración de Vite y dependencias NPM.
- Entrada de React y composición de providers.
- Router y rutas protegidas.
- Contextos de autenticación y carrito.
- Cliente Axios y todos los servicios HTTP.
- Navbar y protección de rutas.
- Todas las páginas actuales.
- CSS global y estilos residuales del template.
- Correspondencia entre frontend y endpoints del backend.
- Resultado del lint y tentativa de build.

No hay tests automatizados, TypeScript, variables de entorno para la API, interceptores Axios, gestión global de errores ni una librería específica de consultas/cache.

## 3. Tecnologías

- React 19.2.8.
- React DOM 19.2.8.
- Vite 8.2.0.
- React Router DOM 7.18.2.
- Axios 1.19.0.
- Bootstrap 5.3.8 y React Bootstrap 2.10.10.
- Oxlint 1.75.0.

Comandos disponibles:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## 4. Estructura

```text
ecommerce-frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   │   ├── AppNavbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/
│   │   ├── Admin.jsx
│   │   ├── Business.jsx
│   │   ├── Cart.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── MyOrders.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── Products.jsx
│   │   └── Register.jsx
│   ├── routes/AppRouter.jsx
│   ├── services/
│   │   ├── authServices.js
│   │   ├── businessServices.js
│   │   ├── orderService.js
│   │   └── productServices.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

## 5. Arranque y composición

`main.jsx` monta la aplicación en `#root` bajo `StrictMode` y compone:

```text
AuthProvider
└── CartProvider
    └── App
        └── BrowserRouter
            ├── AppNavbar
            └── AppRouter
```

La navbar y todas las rutas tienen acceso a ambos contextos. En desarrollo, `StrictMode` puede ejecutar ciertos efectos dos veces para detectar efectos secundarios problemáticos; esto debe considerarse si aparecen requests duplicados.

## 6. Rutas de la interfaz

| Ruta | Página | Protección actual |
|---|---|---|
| `/` | `Home` | Pública |
| `/register` | `Register` | Pública |
| `/login` | `Login` | Pública |
| `/cart` | `Cart` | Pública |
| `/orders/my-orders` | `MyOrders` | Usuario autenticado |
| `/orders/:order_id` | `OrderDetail` | Usuario autenticado |
| `/admin` | `Admin` | Usuario autenticado, no exige admin |
| `/business` | `Business` | Intenta admitir seller/admin, pero no se aplica |
| `/products` | `Products` | Cualquier usuario autenticado |

React Router puede resolver correctamente las rutas estáticas y dinámicas por ranking, aunque conviene anteponer `/` de forma consistente en todos los paths por claridad.

## 7. Autenticación

### Estado

`AuthContext` conserva en `localStorage`:

```text
auth.user
auth.accessToken
auth.refreshToken
```

Al iniciar, recupera ese JSON. `logout` limpia estado y almacenamiento local. No existe verificación inicial de vigencia del access token ni renovación automática mediante refresh token.

### Login

1. Envía email/password a `/user/login`.
2. Obtiene access y refresh token.
3. Consulta `/user/me` con el access token.
4. Guarda usuario y tokens en contexto/localStorage.

El formulario muestra mensajes de conexión y errores del backend, pero no redirige después del login.

### Protección de rutas

`ProtectedRoute` sólo comprueba `auth.user`. `AppRouter` pasa `allowedRoles={["seller", "admin"]}` para `/business`, pero el componente no recibe ni evalúa esa prop. Por lo tanto:

- Cualquier usuario autenticado puede abrir `/business`.
- Cualquier usuario autenticado puede abrir `/admin`.
- Cualquier usuario autenticado puede abrir `/products`, aunque el backend exige seller.

El backend sigue protegiendo los datos, pero la UX mostrará pantallas que después fallan con 403.

## 8. Carrito

`CartContext` guarda el array completo de productos en `localStorage` y persiste cada modificación mediante `useEffect`.

`Home` permite añadir productos e incrementar cantidades. Si el producto ya existe, se actualiza mediante `map`; si no, se agrega con `quantity: 1`.

`Cart` permite:

- Incrementar hasta el stock conocido.
- Decrementar hasta una unidad.
- Eliminar productos.
- Calcular cantidad total e importe total.
- Crear una orden enviando sólo `product_id` y `quantity`.

El carrito es público, pero el botón Comprar intenta usar `auth.accessToken` aunque el usuario no esté autenticado. El resultado será normalmente un 401 mostrado sólo en consola. El stock y precio visibles son una copia local potencialmente desactualizada; correctamente, el backend vuelve a validarlos al comprar.

## 9. Servicios y contrato con el backend

El cliente Axios usa una URL fija:

```js
baseURL: "http://127.0.0.1:8000"
```

No usa `VITE_API_URL`, por lo que requiere editar código para otro entorno. Cada servicio protegido repite manualmente el header Bearer.

### Auth

| Función | Endpoint |
|---|---|
| `register` | `POST /user/registration` |
| `login` | `POST /user/login` |
| `getCurrentUser` | `GET /user/me` |

Faltan consumo de `/user/refresh` y logout/revocación del lado servidor.

### Negocio

| Función | Endpoint |
|---|---|
| `getMyBusiness` | `GET /business/my-business` |
| `createBusiness` | `POST /business/add` |
| `updateBusiness` | `PUT /business/update/{id}` |
| `deleteBusiness` | `DELETE /business/delete/{id}` |

### Productos

| Función | Endpoint |
|---|---|
| `getAllProducts` | `GET /products/get` |
| `getMyProducts` | `GET /products/my-products` |
| `createProduct` | `POST /products/add` |
| `updateProduct` | `PUT /products/update/{id}` |
| `deleteProduct` | `DELETE /products/delete/{id}` |

### Pedidos

| Función | Endpoint |
|---|---|
| `createOrder` | `POST /orders/create` |
| `getMyOrders` | `GET /orders/my-orders` |
| `getOrderById` | `GET /orders/{id}` |

Todavía faltan:

- `getMySales(accessToken)` para `GET /orders/my-sales`.
- `updateOrderStatus(orderId, status, accessToken)` para `PUT /orders/{id}/status`.

## 10. Páginas

### `Home`

Lista el catálogo público y permite agregar al carrito. No muestra errores al usuario, filtros, búsqueda, paginación ni estado de producto agotado. Mantiene un `console.log(cart)`.

### `Register`

Valida username, email y contraseña antes de enviar. Hay una diferencia con el backend: el frontend exige username de 4 a 24 caracteres y permite guion, mientras el backend admite de 3 a 50 pero sólo alfanuméricos y `_`. Una entrada puede pasar una capa y fallar en la otra. La variable `response` no se usa.

### `Login`

Guarda sesión correctamente, pero no navega a otra página al tener éxito. Mantiene logs de depuración y un enlace fijo a Business incluso antes de conocer el rol.

### `Business`

Carga el negocio propio y, ante 404, muestra el formulario de creación. Crear un negocio refresca `/user/me` para recibir el rol seller actualizado. Editar actualiza la tarjeta local.

Problema funcional: `handleDelete` invoca `deleteBusiness`, pero la función no está importada. Además no hay botón de eliminar en el JSX actual, por lo que `handleDelete`, `deleting` y `logout` quedan sin uso. Si se añadiera el botón sin corregir el import, produciría `ReferenceError`.

### `Products`

Implementa listado, alta, edición y eliminación con modales. Los valores numéricos del formulario permanecen como strings; Pydantic suele convertirlos, pero conviene normalizarlos explícitamente. Los fallos sólo se imprimen en consola y no hay mensajes visibles.

La ruta está disponible para cualquier autenticado, aunque el backend limita todas las operaciones privadas a seller.

### `Cart`

Implementa la compra y vacía el carrito al tener éxito. No muestra confirmación, ID del pedido ni error visible. Tampoco redirige a login si falta sesión o a la orden creada tras comprar.

### `MyOrders`

Lista los pedidos del comprador con estado general, total e items. Permite navegar al detalle. El enlace a esta página no aparece actualmente en la navbar.

### `OrderDetail`

Consulta una orden del comprador por ID y muestra todos sus items. Los errores 400, 401 y 404 se transforman en un único mensaje genérico.

### `Admin`

Es únicamente un placeholder y no exige rol admin desde el frontend.

## 11. Hallazgos priorizados

### Prioridad alta

1. **`ProtectedRoute` ignora `allowedRoles`.** Las rutas de seller/admin no están realmente protegidas en la interfaz.
2. **El panel de ventas aún no existe.** Falta servicio, estado, UI y acción para confirmar los items de `/orders/my-sales`.
3. **Compra sin autenticación.** `/cart` es público y Comprar envía un token vacío, sin orientación al usuario.
4. **No hay manejo de expiración ni refresh automático.** Una sesión persistida puede aparentar estar activa y provocar 401 hasta que el usuario cierre sesión manualmente.
5. **Tokens en `localStorage`.** Es práctico para este proyecto, pero cualquier XSS podría leerlos; requiere evitar contenido inseguro y definir conscientemente la estrategia de sesión.

### Prioridad media

1. `deleteBusiness` se usa sin importación y la funcionalidad de eliminar no se renderiza.
2. La navbar enseña Business y Products a cualquier autenticado, sin considerar roles.
3. La URL del backend está fija en código y no depende del entorno.
4. Cada llamada repite el header de autorización; un interceptor puede centralizar token, 401 y refresh.
5. Casi todas las mutaciones registran errores sólo en consola.
6. No hay validación visible consistente en negocio y producto.
7. `length=None` en el backend y ausencia de paginación en UI pueden generar listados grandes.
8. El modelo monetario usa números JS y el backend usa float; ambos pueden presentar precisión inexacta.

### Prioridad baja / mantenimiento

- Logs de depuración en Login, Home y ProtectedRoute.
- Imports/variables sin uso reportados por Oxlint.
- README conserva el texto genérico de Vite y no documenta la aplicación.
- `App.css` mantiene estilos completos del template que aparentemente no utiliza la UI actual.
- No existe página 404 (`path="*"`).
- No hay componentes compartidos para loading, error, cards o formularios.
- `React` se importa explícitamente en varios archivos aunque el JSX transform moderno no siempre lo requiere.
- Existen textos vistos con caracteres mal decodificados en la terminal; debe verificarse UTF-8 en editor y archivos.

## 12. Resultado de calidad

`npm run lint` terminó sin errores, con seis advertencias:

- `response` sin uso en `Register.jsx`.
- Regla de Fast Refresh por exportar contexto y provider juntos en ambos contextos.
- `logout`, `deleting` y `handleDelete` sin uso en `Business.jsx`.

Se intentó `npm run build`, pero Vite no pudo escribir su archivo temporal dentro de `node_modules/.vite-temp` porque el frontend está fuera de la raíz actualmente autorizada para escritura. Este resultado no demuestra un fallo del código; el build debe repetirse en el workspace del frontend o con permisos correspondientes.

No hay suites de tests configuradas.

## 13. Integración recomendada de `/orders/my-sales`

Para cumplir la idea de mostrar pedidos pendientes junto al CRUD de productos:

1. Añadir a `orderService.js`:

```js
export const getMySales = async (accessToken) =>
    axios.get("/orders/my-sales", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

export const updateOrderStatus = async (orderId, status, accessToken) =>
    axios.put(
        `/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
```

2. Crear un componente como `PendingSales.jsx` para separar la carga, error, lista y confirmación.
3. Renderizarlo en `Business.jsx` si la intención visual es tenerlo junto a la administración del negocio, o reorganizar `/business` como dashboard con dos columnas/tabs: productos y ventas pendientes.
4. Tras confirmar una venta, quitarla del estado local o volver a consultar `/my-sales`.
5. Recordar que el endpoint devuelve sólo items propios y un `subtotal`; no debe esperarse `user_id`, `total` global ni productos de otros vendedores.
6. Proteger la vista con rol seller y mostrar mensajes específicos para 401/403.

Una estructura escalable sería:

```text
BusinessDashboard
├── BusinessSummary
├── ProductManager
└── PendingSales
```

Actualmente `Products` vive en una ruta separada. Puede mantenerse y agregarse un acceso desde Business, o integrarse como componente del dashboard según la experiencia deseada.

## 14. Orden recomendado de trabajo

1. Corregir `ProtectedRoute` para roles y ajustar la navbar.
2. Añadir `getMySales` y `updateOrderStatus` al servicio de órdenes.
3. Crear la lista de ventas pendientes y conectarla al panel de negocio.
4. Mejorar estados de carga, confirmación y error de compras/ventas.
5. Centralizar Axios, URL por entorno y manejo de 401/refresh.
6. Unificar validaciones con el backend.
7. Agregar tests de los flujos críticos y reemplazar el README genérico.

## 15. Mapa para próximos cambios

- Sesión y usuario: `AuthContext.jsx`, `authServices.js`, `ProtectedRoute.jsx`.
- Carrito: `CartContext.jsx`, `Home.jsx`, `Cart.jsx`.
- Catálogo público: `Home.jsx`, `productServices.js`.
- Gestión de productos: `Products.jsx`, `productServices.js`.
- Negocio/dashboard: `Business.jsx`, `businessServices.js`.
- Compras del cliente: `MyOrders.jsx`, `OrderDetail.jsx`, `orderService.js`.
- Ventas del seller: nuevo componente/página y `orderService.js`.
- Navegación: `AppRouter.jsx`, `AppNavbar.jsx`.
- Configuración HTTP: `api/axios.js`.

Este documento refleja el comportamiento observado y sirve como mapa para decidir e implementar el próximo cambio sin perder de vista el contrato existente con el backend.

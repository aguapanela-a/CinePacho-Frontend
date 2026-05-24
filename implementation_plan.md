# Plan de Implementación — Funcionalidades Faltantes CinePacho

## Resumen
Implementar las funcionalidades que faltan en el frontend según el documento de requerimientos de negocio e integrar la estructura correcta de datos para el flujo de pago.

---

## 1. Sistema de Evaluación (Reviews)

### [NEW] `src/components/ReviewModal.jsx`
- Modal con sistema de estrellas (1-5) para calificar película y servicio del cine
- Campo de texto para comentario opcional
- Persistencia en `localStorage` (hasta que se conecte al backend)

### [MODIFY] `src/pages/Profile.jsx`
- Agregar botón "Evaluar" en cada orden del historial de compras
- Abrir `ReviewModal` al hacer clic

---

## 2. Canje de Puntos por Boleta Gratis

### [MODIFY] `src/pages/Profile.jsx`
- Botón "Canjear Boleta Gratis" visible cuando `basePoints >= 100`
- Al canjear: descuenta 100 puntos, genera un "cupón" con vigencia de 6 meses
- Mostrar cupón activo con fecha de expiración

---

## 3. Fecha de Inicio de Contrato en Empleados

### [MODIFY] `src/pages/admin/AdminEmployees.jsx`
- Agregar campo `fechaContrato` (tipo `date`) al formulario de creación y edición
- Mostrar columna "Fecha Contrato" en la tabla

---

## 4. Cargos Correctos del Negocio

### [MODIFY] `src/pages/admin/AdminEmployees.jsx`
- Reemplazar opciones de cargo: Director, Cajero, Despachador de comida, Encargado de sala, Aseador
- Agregar todos los multiplex faltantes: Plaza Central, Las Américas, Santafé
- Agregar alerta visual cuando el cargo lleve más de 3 meses sin rotar

---

## 5. Reportes con Gráficas (2 reportes de prueba)

### [MODIFY] `src/pages/admin/AdminReports.jsx`
- **Reporte 1:** Gráfica de barras de ventas mensuales por multiplex (SVG puro, sin librería externa)
- **Reporte 2:** Tabla/gráfica del estudio estadístico de Titán — Movilidad de empleados (salario vs antigüedad)

### [MODIFY] `src/pages/manager/ManagerReports.jsx`
- Implementar vista con datos de prueba relevantes a un solo multiplex

---

## 6. Sincronización de Datos en ShowtimePicker y Cartelera

### [MODIFY] `src/components/movie-modal/ShowtimePicker.jsx`
- Asegurar que la sala NO sea seleccionable por el usuario (regla de negocio: la sala viene predefinida por la función/screening seleccionada).
- Mostrar en el resumen de selección el número de sala correspondiente de forma informativa (ej: "Sala 3").

### [MODIFY] `src/components/MovieModal.jsx`
- Heredar el ID de la función (`screeningId`) y la sala correspondiente para inyectarlos correctamente en el ítem del carrito al momento de añadir la selección de asientos.

---

## 7. Estructura de Datos en Checkout / Pago

### [MODIFY] Componente de Pago (`src/pages/Checkout.jsx` o similar)
- Al hacer clic en el botón de proceder al pago, interceptar la información del carrito.
- Mapear y estructurar los datos enviando única y exclusivamente los arreglos con IDs y cantidades en el formato exacto requerido por el backend.

**Payload JSON requerido para la solicitud de pago:**
```json
{
  "seats": [
    { "seatId": "750e8400-e29b-41d4-a716-446655440000" },
    { "seatId": "750e8400-e29b-41d4-a716-446655440001" }
  ],
  "snacks": [
    {
      "snackId": "950e8400-e29b-41d4-a716-446655440000",
      "quantity": 2
    },
    {
      "snackId": "950e8400-e29b-41d4-a716-446655440001",
      "quantity": 1
    }
  ]
}
Verificación
Verificar que la app compila sin errores (npm run build)

Ejecutar lint y resolver cualquier error restante (npm run lint)

Navegar cada flujo modificado manualmente

Alineación Backend / Endpoints
El Frontend debe consumir y ajustarse estrictamente a las especificaciones de los siguientes endpoints:

Autenticación e Identidad
POST /api/auth/register - Registro de compradores (BUYER).

POST /api/auth/login - Retorna token, userType y name.

GET /api/auth/verify?token=... - Verificación de correo electrónico.

Gestión de Sedes y Salas (Multiplex & Rooms)
GET /api/admin/multiplexes - Lista de sedes (ADMIN ve todas, MANAGER ve solo la suya).

GET /api/admin/multiplexes/{id} - Detalle del multiplex incluyendo su arreglo interno de rooms.

POST /api/admin/multiplexes - Creación de multiplex (Solo ADMIN, restricción de 5 a 15 salas).

PUT /api/admin/multiplexes/{id} - Actualización de multiplex (Solo ADMIN).

DELETE /api/admin/multiplexes/{id} - Eliminación de multiplex (Solo ADMIN).

POST /api/admin/{multiplexId}/rooms - Crear sala vinculada a un multiplex (40 sillas generales, 20 preferenciales).

DELETE /api/admin/rooms/{id} - Desactivación lógica de una sala.

Gestión de Sillas (Seats)
GET /api/seats/{roomId} - Consulta de disponibilidad de sillas y estados (AVAILABLE, BLOCKED, SOLD).

PUT /api/seats/{seatId}/changeStatus - Cambiar estado de silla (Requiere Bearer token. AVAILABLE pasa a BLOCKED por 10 min).

Cartelera y Funciones (Movies & Screenings)
GET /api/admin/movie/search?query={text}&page={numero} - Búsqueda de películas en TMDB.

POST /api/admin/movie/select/{movieId} - Persistir película de TMDB en la base de datos local.

POST /api/admin/movie/createScreening - Programar función (movieId, roomId, y dateTime en formato yyyy-MM-dd HH:mm:ss).

PUT /api/admin/movie/changeStatus/{idScreening}?status={status} - Cambiar estado de la función (ACTIVE, CANCELLED, COMPLETED).

Tienda de Alimentos (Snacks)
GET /api/admin/snacks - Obtener lista de snacks (Solo ADMIN).

GET /api/admin/snacks/{id} - Obtener snack específico (Solo ADMIN).

POST /api/admin/snacks - Crear nuevo snack (Solo ADMIN, precio > 0).

PUT /api/admin/snacks/{id} - Actualizar datos de un snack (Solo ADMIN).

DELETE /api/admin/snacks/{id} - Eliminar snack (Solo ADMIN).

Personal (Employees)
POST /api/admin/register_employee - Registro de EMPLOYEE o MANAGER. (El MANAGER está limitado por el AccessValidator del backend para interactuar únicamente con su multiplexId asignado).

Pasarela de Pagos
POST /api/payments/create-intent - Generar intención de pago enviando el payload estructurado con seats y snacks.

Notas de Consistencia y Seguridad en Frontend
Persistencia de Contexto: src/context/AppContext.jsx debe almacenar la entidad user completa incluyendo obligatoriamente el parámetro multiplexId devuelto tras el Login.

Manejo de Roles: El frontend debe validar los permisos basándose estrictamente en los 4 tipos de usuario oficiales (ADMIN, MANAGER, EMPLOYEE, BUYER) para bloquear o permitir vistas.

Inyección de Tokens: Absolutamente todas las peticiones (a excepción de las de /api/auth/) deben adjuntar de manera obligatoria el encabezado Authorization: Bearer {token}.

Desacoplamiento de Datos: src/pages/manager/ManagerReports.jsx no debe poseer strings hardcodeados (como el nombre de sedes como "Titán") y debe responder dinámicamente a la información retornada por la API.


---

### 📄 2. `notas_desarrollo.md` (Actualizado con correcciones de typos técnicos)
*Se corrigieron observaciones para que Cursor sepa exactamente qué refactorizar a nivel de código.*

```markdown
# NOTAS DE DESARROLLO - CinePacho Frontend

Este documento contiene notas para desarrolladores sobre implementaciones completadas, correcciones pendientes y próximas implementaciones para el frontend de CinePacho.

---

## AdminEmployees.jsx
**Ubicación:** `src/pages/admin/AdminEmployees.jsx`

### ✅ Implementaciones Completadas
- Campo `fechaContrato` en formulario de creación y edición
- Columna "Fecha Contrato" en tabla de empleados
- Actualización de roles a: Director, Cajero, Despachador de comida, Encargado de sala, Aseador
- Agregados multiplexes: Plaza Central, Las Américas, Santafé
- Alerta visual cuando fechaRotación > 3 meses desde última rotación

### ⚠️ Correcciones Pendientes
- **[CRÍTICO]** Corregir typo en la clave del objeto: cambiar `"indentityCard"` por `"identityCard"` en el estado `newEmployee` para que coincida con las validaciones del backend.
- Conectar la función `registerEmployee` de `employeeService` para que realice peticiones HTTP reales usando Axios/Fetch hacia `/api/admin/register_employee`.
- Cambiar las mutaciones de borrado (`handleDeleteEmployee`) y edición de locales a asíncronas con persistencia en API.

### 📝 Próximas Implementaciones
- Implementar paginación y filtros avanzados (por cargo, por multiplex, por estado).
- Agregar historial de cambios de rol/salario y validación de formato de cédula colombiana.

---

## AdminReports.jsx
**Ubicación:** `src/pages/admin/AdminReports.jsx`

### ✅ Implementaciones Completadas
- Gráfico de barras SVG para ventas mensuales por multiplex (Ene-Jun 2026).
- Tabla de estudio de movilidad de empleados (salario vs antigüedad) para Titán.

### ⚠️ Correcciones Pendientes
- Migrar los datos de ventas y movilidad de estados estáticos (Mocks) a llamadas dinámicas de la API.
- Implementar filtros de fecha y multiplex dinámicos en vez de rangos fijos.

---

## ManagerReports.jsx
**Ubicación:** `src/pages/manager/ManagerReports.jsx`

### ⚠️ Correcciones Pendientes
- **[CRÍTICO]** Eliminar el string estático `'Titán'`. El componente debe leer dinámicamente `user.multiplexId` desde el contexto global de la aplicación (`AppContext`) para renderizar el informe exclusivo de la sede asociada al Manager.

---

## CashierDashboard.jsx
**Ubicación:** `src/pages/cajero/CashierDashboard.jsx`

### ✅ Implementaciones Completadas
- Punto de venta (POS) para cajero con selección de películas y snacks.
- Módulo de búsqueda de clientes por Cédula o Email para asignación de puntos en compras.

### ⚠️ Correcciones Pendientes
- Desvincular el multiplex estático e inyectar `user.multiplexId`.
- Conectar el flujo de confirmación de compra para que envíe el JSON limpio al endpoint del backend en vez de solo simular la impresión en pantalla.

---

## Profile.jsx
**Ubicación:** `src/pages/Profile.jsx`

### ⚠️ Correcciones Pendientes
- Migrar el almacenamiento de las reseñas (Reviews), los cupones activos generados y los balances de puntos desde el `localStorage` local hacia los respectivos endpoints REST que proveerá el Backend.

---

## ShowtimePicker.jsx & MovieModal.jsx
**Ubicación:** `src/components/movie-modal/ShowtimePicker.jsx` y `src/components/MovieModal.jsx`

### ✅ Validaciones Técnicas Aplicadas
- De acuerdo con la lógica de negocio, el cliente externo NO tiene permiso para seleccionar ni modificar el número de sala. La sala se lee de forma informativa basándose en la configuración de la función (`screeningId`). El selector de salas queda encapsulado exclusivamente dentro del módulo operativo de Taquilla / Cajeros.

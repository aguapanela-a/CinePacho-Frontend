# Plan de Implementación — Funcionalidades Faltantes CinePacho

## Resumen
Implementar las 6 funcionalidades que faltan en el frontend según el documento de requerimientos de negocio.

---

## 1. Sistema de Evaluación (Reviews)

### [NEW] `src/components/ReviewModal.jsx`
- Modal con sistema de estrellas (1-5) para calificar película y servicio del cine
- Campo de texto para comentario opcional
- Persistencia en `localStorage` (hasta que se conecte al backend)

### [MODIFY] [Profile.jsx](file:///c:/Users/Juanes/Desktop/General/frontendcinepacho/src/pages/Profile.jsx)
- Agregar botón "Evaluar" en cada orden del historial de compras
- Abrir `ReviewModal` al hacer clic

---

## 2. Canje de Puntos por Boleta Gratis

### [MODIFY] [Profile.jsx](file:///c:/Users/Juanes/Desktop/General/frontendcinepacho/src/pages/Profile.jsx)
- Botón "Canjear Boleta Gratis" visible cuando `basePoints >= 100`
- Al canjear: descuenta 100 puntos, genera un "cupón" con vigencia de 6 meses
- Mostrar cupón activo con fecha de expiración

---

## 3. Fecha de Inicio de Contrato en Empleados

### [MODIFY] [AdminEmployees.jsx](file:///c:/Users/Juanes/Desktop/General/frontendcinepacho/src/pages/admin/AdminEmployees.jsx)
- Agregar campo `fechaContrato` (tipo `date`) al formulario de creación y edición
- Mostrar columna "Fecha Contrato" en la tabla

---

## 4. Cargos Correctos del Negocio

### [MODIFY] [AdminEmployees.jsx](file:///c:/Users/Juanes/Desktop/General/frontendcinepacho/src/pages/admin/AdminEmployees.jsx)
- Reemplazar opciones de cargo: Director, Cajero, Despachador de comida, Encargado de sala, Aseador
- Agregar todos los multiplex faltantes: Plaza Central, Las Américas, Santafé
- Agregar alerta visual cuando el cargo lleve más de 3 meses sin rotar

---

## 5. Reportes con Gráficas (2 reportes de prueba)

### [MODIFY] [AdminReports.jsx](file:///c:/Users/Juanes/Desktop/General/frontendcinepacho/src/pages/admin/AdminReports.jsx)
- **Reporte 1:** Gráfica de barras de ventas mensuales por multiplex (SVG puro, sin librería externa)
- **Reporte 2:** Tabla/gráfica del estudio estadístico de Titán — Movilidad de empleados (salario vs antigüedad)

### [MODIFY] [ManagerReports.jsx](file:///c:/Users/Juanes/Desktop/General/frontendcinepacho/src/pages/manager/ManagerReports.jsx)
- Implementar vista con datos de prueba relevantes a un solo multiplex

---

## 6. Número de Sala en ShowtimePicker

### [MODIFY] [ShowtimePicker.jsx](file:///c:/Users/Juanes/Desktop/General/frontendcinepacho/src/components/movie-modal/ShowtimePicker.jsx)
- Agregar selector de sala (Sala 1 a Sala 15) entre el selector de formato y la selección de hora
- Mostrar sala seleccionada en el resumen de selección

### [MODIFY] [MovieModal.jsx](file:///c:/Users/Juanes/Desktop/General/frontendcinepacho/src/components/MovieModal.jsx)
- Agregar estado `selectedRoom` y pasarlo a `ShowtimePicker`
- Incluir info de sala en el item del carrito

---

## Verificación
- Verificar que la app compila sin errores (`npm run build`)
- Ejecutar lint y resolver cualquier error restante (`npm run lint`)
- Navegar cada flujo modificado manualmente

## Alineación Backend / Endpoints
- Frontend actual requiere estos endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/verify?token=...`
  - `GET /api/admin/multiplexes`
  - `GET /api/admin/multiplexes/{id}`
  - `POST /api/admin/multiplexes`
  - `PUT /api/admin/multiplexes/{id}`
  - `DELETE /api/admin/multiplexes/{id}`
  - `GET /api/admin/snacks`
  - `GET /api/admin/snacks/{id}`
  - `POST /api/admin/snacks`
  - `PUT /api/admin/snacks/{id}`
  - `DELETE /api/admin/snacks/{id}`
  - `GET /api/admin/rooms`
  - `GET /api/admin/rooms/{id}`
  - `POST /api/admin/rooms`
  - `DELETE /api/admin/rooms/{id}`
  - `POST /api/admin/register_employee`
  - `GET /api/admin/search?query={text}`
  - `POST /api/admin/select/{movieId}`
  - `POST /api/admin/{multiplexName}/createScreening`
  - `PUT /api/admin/{multiplexName}/{idScreening}/status?status={status}`
  - `POST /api/payments/create-intent`

- La respuesta de login debe ser coherente para el frontend:
  - `token`
  - `userType`
  - `name`
  - `multiplexId` (para manager/empleado vinculado a sede)
  - `position` / `role` si el backend distingue manager de empleado

- Notas de consistencia:
  - `frontendcinepacho/src/context/AppContext.jsx` debe guardar el `user` completo con `multiplexId`
  - `frontendcinepacho/src/pages/Login.jsx` debe usar `src/services/authService.js`
  - Si el backend soporta `MANAGER`, el enum `UserType` debe incluirlo; si no, frontend debe usar `position` en lugar de `userType === 'MANAGER'`
  - `frontendcinepacho/src/pages/manager/ManagerReports.jsx` no debe depender de valores hardcodeados como `Titán`

- Recomendación de backend adicional:
  - Implementar endpoints de manager para datos de multiplex específicos (empleados, inventario, ventas) si se quiere reemplazar los mocks actuales

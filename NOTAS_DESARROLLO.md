# NOTAS DE DESARROLLO - CinePacho Frontend

Este documento contiene notas para desarrolladores sobre implementaciones completadas, correcciones pendientes y próximas implementaciones para el frontend de CinePacho.

---

## 📋 Tabla de Contenidos

- [AdminEmployees.jsx](#adminemployeesjsx)
- [AdminReports.jsx](#adminreportsjsx)
- [ManagerReports.jsx](#managerreportsjsx)
- [CashierDashboard.jsx](#cashierdashboardjsx)
- [Profile.jsx](#profilejsx)
- [ShowtimePicker.jsx](#showtimepickerjsx)
- [MovieModal.jsx](#moviemodaljsx)

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
- El typo "indentityCard" debe corregirse a "identityCard" en el estado newEmployee
- La función registerEmployee del servicio employeeService debe conectarse al backend real
- La eliminación de empleados es solo local (handleDeleteEmployee) - debe conectarse a API
- La edición de empleados es solo local - debe conectarse a API
- La fecha de rotación se calcula automáticamente como +3 meses desde fechaContrato
  - Esto debería ser configurable por el negocio

### 📝 Próximas Implementaciones
- Implementar paginación para listas grandes de empleados
- Agregar filtros avanzados (por cargo, por multiplex, por estado)
- Implementar exportación de empleados a Excel/PDF
- Agregar historial de cambios de rol/salario por empleado
- Implementar sistema de notificaciones para rotaciones pendientes
- Agregar validación de formato de cédula colombiana
- Implementar subida de foto de empleado
- Agregar campo de horarios de trabajo

### 💡 Notas de Negocio
- Los roles están alineados con los requerimientos del negocio
- La alerta de rotación se muestra cuando han pasado 3+ meses desde la última rotación
- Los multiplexes incluyen todos los sedes de CinePacho

---

## AdminReports.jsx

**Ubicación:** `src/pages/admin/AdminReports.jsx`

### ✅ Implementaciones Completadas
- Gráfico de barras SVG para ventas mensuales por multiplex (Ene-Jun 2026)
- Tabla de estudio de movilidad de empleados (salario vs antigüedad) para Titán
- Estadísticas generales de ventas, boletas, snacks, clientes
- Comparación de rendimiento por multiplex con barras de progreso

### ⚠️ Correcciones Pendientes
- Los datos de ventas son estáticos/mock - deben conectarse a API real
- Los datos de movilidad de empleados son estáticos - deben conectarse a API
- Los gráficos SVG son básicos - considerar librería como Recharts o Chart.js
- No hay filtros de fecha - los reportes son fijos a Ene-Jun 2026
- No hay exportación de reportes (PDF/Excel)

### 📝 Próximas Implementaciones
- Implementar selector de rango de fechas para reportes
- Agregar filtros por multiplex específico
- Implementar reporte de tendencias de ventas por película
- Agregar reporte de rendimiento de empleados individuales
- Implementar reporte de ocupación de salas por horario
- Agregar reporte de productos más vendidos (snacks)
- Implementar comparación año vs año
- Agregar alertas automáticas cuando métricas caen por debajo de umbral
- Implementar descarga de reportes en PDF/Excel
- Agregar gráficos interactivos con tooltips

### 💡 Notas de Negocio
- Los reportes son visuales para análisis rápido
- El estudio de movilidad muestra relación salario-antigüedad
- Los multiplexes incluidos: Titán, Gran Estación, Unicentro, Plaza Central

---

## ManagerReports.jsx

**Ubicación:** `src/pages/manager/ManagerReports.jsx`

### ✅ Implementaciones Completadas
- Dashboard de reportes para gerente de multiplex específico (Titán)
- Gráfico de barras SVG para ventas diarias de la última semana
- Lista de películas top con barras de progreso
- Métricas de operaciones: ocupación promedio, ticket promedio, salas activas, satisfacción
- Stats cards: ventas del mes, boletas vendidas, snacks vendidos, clientes atendidos

### ⚠️ Correcciones Pendientes
- Los datos son estáticos/mock - deben conectarse a API real del multiplex
- El multiplex está hardcodeado a 'Titán' - debe ser dinámico desde user.multiplexId
- Los gráficos SVG son básicos - considerar librería como Recharts
- No hay filtros de fecha - los datos son fijos a última semana

### 📝 Próximas Implementaciones
- Conectar multiplexId dinámicamente desde el usuario autenticado
- Implementar selector de rango de fechas
- Agregar reporte de rendimiento por empleado del multiplex
- Implementar reporte de ocupación por sala
- Agregar reporte de productos más vendidos en el multiplex
- Implementar comparación con otros multiplexes (benchmarking)
- Agregar alertas para métricas bajo rendimiento
- Implementar exportación de reportes del multiplex

### 💡 Notas de Negocio
- Los reportes del gerente son locales a su multiplex asignado
- Las métricas ayudan al gerente a tomar decisiones operativas
- La satisfacción del cliente es clave para el negocio

---

## CashierDashboard.jsx

**Ubicación:** `src/pages/cajero/CashierDashboard.jsx`

### ✅ Implementaciones Completadas
- Punto de venta (POS) para cajero con selección de películas y snacks
- **Selección de sala (Sala 1-15) al vender boletas - RESPONSABILIDAD DEL CAJERO**
- Búsqueda de cliente por CC o email para sistema de fidelización
- Sistema de puntos por compra (10 puntos por transacción)
- Carrito de compras con cálculo de total
- Modal de selección de función con horarios y formatos
- Modal de venta exitosa con confirmación

### ⚠️ Correcciones Pendientes
- Los datos de clientes son estáticos (mockCustomers) - deben conectarse a API real
- La venta no se persiste en backend - solo es visual
- Los puntos no se guardan en el perfil del cliente real
- No hay impresión de tickets/receipts
- No hay integración con sistema de pago real (Stripe, etc.)
- El multiplex está hardcodeado a 'Titán' - debe ser dinámico desde user.multiplexId

### 📝 Próximas Implementaciones
- Conectar multiplexId dinámicamente desde el usuario autenticado
- Implementar integración con sistema de pagos (Stripe/PayU)
- Agregar impresión de tickets/receipts
- Implementar persistencia de ventas en backend
- Conectar sistema de puntos real con perfil de cliente
- Agregar validación de stock de snacks en tiempo real
- Implementar descuentos y promociones
- Agregar manejo de efectivo y cambio
- Implementar reembolsos y anulaciones
- Agregar reporte de cierre de caja del cajero

### 💡 Notas de Negocio
- **El cajero selecciona la sala - NO el cliente** (corrección aplicada)
- El sistema de fidelización incentiva clientes recurrentes
- Los puntos se acumulan por compra, no por valor
- El POS debe ser rápido y eficiente para no hacer fila

---

## Profile.jsx

**Ubicación:** `src/pages/Profile.jsx`

### ✅ Implementaciones Completadas
- Sistema de evaluación (reviews) con modal de estrellas (1-5)
- Evaluación de película y servicio del cine
- Persistencia de reviews en localStorage
- Botón "Evaluar" en cada orden del historial
- Sistema de canje de puntos por boleta gratis (100 puntos = 1 boleta)
- Generación de cupón con vigencia de 6 meses
- Visualización de cupones activos con fecha de expiración
- Historial de compras con detalles
- Barra de progreso de puntos acumulados

### ⚠️ Correcciones Pendientes
- Las reviews se guardan en localStorage - deben persistir en backend
- Los puntos se guardan en localStorage - deben conectarse a API real
- Los cupones se guardan en localStorage - deben conectarse a API real
- No hay validación de que el usuario realmente asistió a la función
- No hay límite de reviews por película (posible spam)
- No hay moderación de reviews (contenido inapropiado)

### 📝 Próximas Implementaciones
- Conectar reviews a backend real con validación de asistencia
- Implementar moderación automática de reviews
- Agregar límite de 1 review por película por usuario
- Conectar puntos a backend real con transacciones
- Implementar sistema de notificaciones de cupones por expirar
- Agregar historial de canjes de puntos
- Implementar sistema de niveles de fidelización
- Agregar referidos para ganar puntos extra
- Implementar descuentos especiales por nivel

### 💡 Notas de Negocio
- El sistema de fidelización incentiva compras recurrentes
- Las reviews ayudan a mejorar la calidad del servicio
- Los cupones tienen vigencia de 6 meses para uso razonable
- 100 puntos = 1 boleta gratis (aprox 10 compras de boletas)

---

## ShowtimePicker.jsx

**Ubicación:** `src/components/movie-modal/ShowtimePicker.jsx`

### ✅ Implementaciones Completadas
- Selector de fecha para función (7 días siguientes)
- Selector de formato (2D, 3D, IMAX, VIP)
- Selector de horario de función
- Resumen de selección mostrado al usuario
- Validación para proceder a selección de asientos
- Precios dinámicos por formato

### ⚠️ Correcciones Pendientes
- **NO incluye selector de sala - esto es responsabilidad del CAJERO** (corrección aplicada)
- Los horarios son estáticos - deben conectarse a API real
- Los formatos disponibles no dependen de la película
- No hay validación de disponibilidad de asientos
- No hay indicador de ocupación de la sala

### 📝 Próximas Implementaciones
- Conectar horarios a backend real por película y multiplex
- Implementar validación de disponibilidad de asientos en tiempo real
- Agregar indicador de ocupación (poco/muchos asientos disponibles)
- Implementar filtros por tipo de contenido (doblado/subtitulado)
- Agregar selector de idioma (español/inglés)
- Implementar pre-reserva temporal de asientos
- Agregar notificación de cambios de horario
- Implementar sugerencias de horarios cercanos

### 💡 Notas de Negocio
- **El cliente NO selecciona la sala - esto lo hace el cajero**
- Los formatos tienen precios diferentes (VIP más caro)
- Los horarios son fijos por película en cada multiplex
- La selección de fecha es limitada a 7 días para evitar saturación

---

## MovieModal.jsx

**Ubicación:** `src/components/MovieModal.jsx`

### ✅ Implementaciones Completadas
- Modal de detalles de película con información completa
- Selección de fecha, formato y horario (ShowtimePicker)
- Selección de asientos interactiva (SeatSelector)
- Cálculo dinámico de precio según formato y cantidad de asientos
- Agregar al carrito con detalles completos
- Validación de selección antes de proceder
- Cierre con tecla Escape
- **NO incluye selector de sala - esto es responsabilidad del CAJERO** (corrección aplicada)

### ⚠️ Correcciones Pendientes
- La información de la película es estática - debe conectarse a API real
- La disponibilidad de asientos no se valida en tiempo real
- No hay pre-reserva temporal de asientos
- No hay límite de asientos por transacción
- El multiplex está hardcodeado en algunos casos

### 📝 Próximas Implementaciones
- Conectar datos de película a backend real
- Implementar validación de disponibilidad de asientos en tiempo real
- Agregar pre-reserva temporal (5-10 minutos) para evitar conflictos
- Implementar límite de asientos por transacción (ej. máximo 10)
- Agregar selector de multiplex si el usuario puede elegir sede
- Implementar sugerencias de películas similares
- Agregar trailer de película en el modal
- Implementar notificación de cambios de horario
- Agregar información de contenido parental (clasificación)

### 💡 Notas de Negocio
- El cliente selecciona fecha, formato, horario y asientos
- **El cajero selecciona la sala al momento de la venta**
- El precio varía según formato (VIP más caro)
- Los asientos se agregan al carrito para checkout

---

## 🚀 Cómo Ejecutar el App con el Mock

### Paso 1: Iniciar el Mock Server
```bash
cd c:\Users\Juanes\Desktop\General\frontendcinepacho
npm run mock
```

El mock server se iniciará en el puerto 8010.

### Paso 2: Iniciar el Frontend (en otra terminal)
```bash
cd c:\Users\Juanes\Desktop\General\frontendcinepacho
npm run dev
```

### Paso 3: Probar con diferentes roles
- `admin@cinepacho.com` → ADMIN → `/admin/dashboard`
- `gerente@cinepacho.com` → MANAGER → `/manager/dashboard`
- `cajero@cinepacho.com` → EMPLOYEE → `/cajero`
- `cliente@correo.com` → BUYER → `/`

---

## 📝 Última Actualización
**Fecha:** 23 de Mayo de 2026
**Estado:** Frontend funcional con mock server
**Build:** Exitoso sin errores

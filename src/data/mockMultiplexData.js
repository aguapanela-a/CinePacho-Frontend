/**
 * mockMultiplexData.js
 * 
 * Datos mock centralizados que simulan la respuesta del backend.
 * Cuando los endpoints estén listos, solo se reemplazan estos imports
 * por llamadas fetch() sin cambiar la estructura de los componentes.
 *
 * Estructura alineada con las entidades del backend:
 *   - MultiplexEntity (por crear)
 *   - EmployeeEntity (ya existe: position, multiplexId)
 *   - Inventario de snacks (por crear)
 */

// ─── MULTIPLEX ─────────────────────────────────────────────
export const multiplexes = [
  {
    id: 'titan',
    name: 'Titán',
    address: 'Av. Boyacá #80-94, Bogotá',
    salas: 8,
    status: 'active',
    managerId: 2,
  },
  {
    id: 'unicentro',
    name: 'Unicentro',
    address: 'Cra. 15 #124-30, Bogotá',
    salas: 12,
    status: 'active',
    managerId: 5,
  },
  {
    id: 'gran-estacion',
    name: 'Gran Estación',
    address: 'Cll. 26 #62-47, Bogotá',
    salas: 10,
    status: 'active',
    managerId: 8,
  },
  {
    id: 'embajador',
    name: 'Embajador',
    address: 'Cll. 24 #6-01, Bogotá',
    salas: 6,
    status: 'active',
    managerId: null,
  },
  {
    id: 'plaza-central',
    name: 'Plaza Central',
    address: 'Cra. 65 #11-50, Bogotá',
    salas: 7,
    status: 'active',
    managerId: null,
  },
]

// ─── EMPLEADOS ─────────────────────────────────────────────
// position: rol interno del empleado en el cine
// multiplexId: sede a la que pertenece (1 empleado = 1 multiplex)
export const employees = [
  // ── Titán ──
  {
    id: 1,
    name: 'Laura González',
    email: 'laura@cinepacho.com',
    phone: '3001234567',
    identityCard: '1012345678',
    position: 'Cajero',
    multiplexId: 'titan',
    status: 'active',
    startDate: '2025-03-15',
  },
  {
    id: 2,
    name: 'Diego Martínez',
    email: 'diego@cinepacho.com',
    phone: '3109876543',
    identityCard: '1023456789',
    position: 'Manager',
    multiplexId: 'titan',
    status: 'active',
    startDate: '2024-01-10',
  },
  {
    id: 3,
    name: 'Valentina Ruiz',
    email: 'valentina@cinepacho.com',
    phone: '3201234567',
    identityCard: '1034567890',
    position: 'Cajero',
    multiplexId: 'titan',
    status: 'active',
    startDate: '2025-06-20',
  },
  {
    id: 4,
    name: 'Andrés López',
    email: 'andres@cinepacho.com',
    phone: '3154567890',
    identityCard: '1045678901',
    position: 'Proyeccionista',
    multiplexId: 'titan',
    status: 'active',
    startDate: '2025-02-01',
  },

  // ── Unicentro ──
  {
    id: 5,
    name: 'Carlos Ramírez',
    email: 'carlos@cinepacho.com',
    phone: '3119876543',
    identityCard: '1056789012',
    position: 'Manager',
    multiplexId: 'unicentro',
    status: 'active',
    startDate: '2024-05-12',
  },
  {
    id: 6,
    name: 'Sofía Hernández',
    email: 'sofia@cinepacho.com',
    phone: '3187654321',
    identityCard: '1067890123',
    position: 'Cajero',
    multiplexId: 'unicentro',
    status: 'active',
    startDate: '2025-08-05',
  },
  {
    id: 7,
    name: 'Julián Castro',
    email: 'julian@cinepacho.com',
    phone: '3001122334',
    identityCard: '1078901234',
    position: 'Supervisor',
    multiplexId: 'unicentro',
    status: 'inactive',
    startDate: '2025-01-15',
  },

  // ── Gran Estación ──
  {
    id: 8,
    name: 'Camila Torres',
    email: 'camila@cinepacho.com',
    phone: '3204567890',
    identityCard: '1089012345',
    position: 'Manager',
    multiplexId: 'gran-estacion',
    status: 'active',
    startDate: '2024-08-20',
  },
  {
    id: 9,
    name: 'Ana Torres',
    email: 'ana@cinepacho.com',
    phone: '3205678901',
    identityCard: '1090123456',
    position: 'Cajero',
    multiplexId: 'gran-estacion',
    status: 'inactive',
    startDate: '2025-04-10',
  },
  {
    id: 10,
    name: 'Miguel Ángel Pérez',
    email: 'miguel@cinepacho.com',
    phone: '3006789012',
    identityCard: '1001234567',
    position: 'Cajero',
    multiplexId: 'gran-estacion',
    status: 'active',
    startDate: '2025-11-01',
  },
]

// ─── INVENTARIO DE SNACKS POR MULTIPLEX ────────────────────
export const inventory = [
  // ── Titán ──
  { id: 1,  name: 'Palomitas Grandes',    category: 'Palomitas', price: 18000, stock: 45,  minStock: 20, multiplexId: 'titan' },
  { id: 2,  name: 'Palomitas Medianas',   category: 'Palomitas', price: 14000, stock: 60,  minStock: 25, multiplexId: 'titan' },
  { id: 3,  name: 'Coca-Cola 500ml',      category: 'Bebidas',   price: 8000,  stock: 120, minStock: 50, multiplexId: 'titan' },
  { id: 4,  name: 'Nachos con Queso',     category: 'Snacks',    price: 15000, stock: 8,   minStock: 15, multiplexId: 'titan' },
  { id: 5,  name: 'Hot Dog',              category: 'Snacks',    price: 12000, stock: 30,  minStock: 15, multiplexId: 'titan' },
  { id: 6,  name: 'Combo Mega Cine',      category: 'Combos',    price: 45000, stock: 25,  minStock: 10, multiplexId: 'titan' },

  // ── Unicentro ──
  { id: 7,  name: 'Palomitas Grandes',    category: 'Palomitas', price: 18000, stock: 55,  minStock: 20, multiplexId: 'unicentro' },
  { id: 8,  name: 'Palomitas Medianas',   category: 'Palomitas', price: 14000, stock: 40,  minStock: 25, multiplexId: 'unicentro' },
  { id: 9,  name: 'Coca-Cola 500ml',      category: 'Bebidas',   price: 8000,  stock: 3,   minStock: 50, multiplexId: 'unicentro' },
  { id: 10, name: 'Nachos con Queso',     category: 'Snacks',    price: 15000, stock: 22,  minStock: 15, multiplexId: 'unicentro' },
  { id: 11, name: 'Agua Cristal 600ml',   category: 'Bebidas',   price: 5000,  stock: 80,  minStock: 30, multiplexId: 'unicentro' },

  // ── Gran Estación ──
  { id: 12, name: 'Palomitas Grandes',    category: 'Palomitas', price: 18000, stock: 0,   minStock: 20, multiplexId: 'gran-estacion' },
  { id: 13, name: 'Coca-Cola 500ml',      category: 'Bebidas',   price: 8000,  stock: 95,  minStock: 50, multiplexId: 'gran-estacion' },
  { id: 14, name: 'Combo Mega Cine',      category: 'Combos',    price: 45000, stock: 12,  minStock: 10, multiplexId: 'gran-estacion' },
  { id: 15, name: 'Hot Dog',              category: 'Snacks',    price: 12000, stock: 5,   minStock: 15, multiplexId: 'gran-estacion' },
]

// ─── VENTAS RECIENTES POR MULTIPLEX ────────────────────────
export const recentSales = [
  { id: 1, description: 'Combo Mega Cine',             amount: 45000, time: 'Hace 1 min',  multiplexId: 'titan' },
  { id: 2, description: '2 Boletas Preferenciales',    amount: 30000, time: 'Hace 3 min',  multiplexId: 'titan' },
  { id: 3, description: 'Nachos + Gaseosa',            amount: 23000, time: 'Hace 5 min',  multiplexId: 'titan' },
  { id: 4, description: '3 Boletas Generales',         amount: 33000, time: 'Hace 2 min',  multiplexId: 'unicentro' },
  { id: 5, description: 'Palomitas Grandes x2',        amount: 36000, time: 'Hace 4 min',  multiplexId: 'unicentro' },
  { id: 6, description: 'Combo Familiar',              amount: 65000, time: 'Hace 1 min',  multiplexId: 'gran-estacion' },
  { id: 7, description: 'Boleta General',              amount: 11000, time: 'Hace 7 min',  multiplexId: 'gran-estacion' },
]

// ─── SOLICITUDES DE DESPIDO PENDIENTES (para admin) ────────
export const dismissalRequests = [
  {
    id: 1,
    employeeId: 9,
    employeeName: 'Ana Torres',
    multiplexId: 'gran-estacion',
    multiplexName: 'Gran Estación',
    requestedBy: 'Camila Torres',
    cause: 'Inasistencias reiteradas sin justificación (5 faltas en el último mes)',
    date: '2026-05-14',
    status: 'pending',
  },
]

// ─── SOLICITUDES DE STOCK PENDIENTES (para admin) ──────────
export const stockRequests = [
  {
    id: 1,
    itemName: 'Nachos con Queso',
    quantity: 30,
    multiplexId: 'titan',
    multiplexName: 'Titán',
    requestedBy: 'Diego Martínez',
    date: '2026-05-15',
    status: 'pending',
    reason: 'Stock por debajo del mínimo, alta demanda este fin de semana',
  },
  {
    id: 2,
    itemName: 'Coca-Cola 500ml',
    quantity: 100,
    multiplexId: 'unicentro',
    multiplexName: 'Unicentro',
    requestedBy: 'Carlos Ramírez',
    date: '2026-05-15',
    status: 'pending',
    reason: 'Quedan solo 3 unidades, agotamiento inminente',
  },
]

// ─── HELPERS ───────────────────────────────────────────────

/** Obtiene un multiplex por su ID */
export const getMultiplexById = (id) => multiplexes.find(m => m.id === id)

/** Obtiene empleados filtrados por multiplex */
export const getEmployeesByMultiplex = (multiplexId) =>
  employees.filter(e => e.multiplexId === multiplexId)

/** Obtiene inventario filtrado por multiplex */
export const getInventoryByMultiplex = (multiplexId) =>
  inventory.filter(i => i.multiplexId === multiplexId)

/** Obtiene ventas recientes filtradas por multiplex */
export const getSalesByMultiplex = (multiplexId) =>
  recentSales.filter(s => s.multiplexId === multiplexId)

/** Cuenta empleados activos de un multiplex */
export const countActiveEmployees = (multiplexId) =>
  employees.filter(e => e.multiplexId === multiplexId && e.status === 'active').length

/** Obtiene el manager de un multiplex */
export const getMultiplexManager = (multiplexId) =>
  employees.find(e => e.multiplexId === multiplexId && e.position === 'Manager')

/** Items con stock bajo (por debajo del mínimo) */
export const getLowStockItems = (multiplexId) =>
  inventory.filter(i => i.multiplexId === multiplexId && i.stock <= i.minStock)

/** Formatea un precio en pesos colombianos */
export const formatCOP = (value) =>
  '$' + value.toLocaleString('es-CO')

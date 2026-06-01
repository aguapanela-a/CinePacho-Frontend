// // import express from 'express';
// // import cors from 'cors';

// // const app = express();

// // // Middlewares para procesar JSON y permitir peticiones (CORS no es estrictamente necesario 
// // // porque usamos el proxy de Vite, pero es buena práctica en el mock)
// // app.use(cors());
// // app.use(express.json());

// // // 1. Simular Verificación de Correo (GET)
// // app.get('/api/auth/verify', (req, res) => {
// //   console.log('Mock: Verificación de correo solicitada con token:', req.query.token);
// //   res.send('Correo verificado correctamente');
// // });

// // // 2. Simular Registro (POST)
// // app.post('/api/auth/register', (req, res) => {
// //   console.log('Mock: Petición de registro recibida:', req.body);

// //   // Simulamos la respuesta exitosa (RegisterResponseDTO)
// //   res.status(201).json({
// //     userType: req.body.userType || 'BUYER',
// //     username: req.body.name || 'Nuevo Usuario',
// //     message: 'Usuario registrado con éxito. Por favor, revisa tu correo electrónico para verificar tu cuenta.'
// //   });
// // });

// // // 3. Simular Login Unificado (POST)
// // // El sistema detecta automáticamente el tipo de usuario según las credenciales.
// // // En este mock, usamos patrones del email para simular los diferentes roles.
// // //
// // // Emails de prueba:
// // //   - admin@cinepacho.com    → ADMIN    (redirige a /admin/dashboard)
// // //   - gerente@cinepacho.com  → MANAGER  (redirige a /manager/dashboard)
// // //   - cajero@cinepacho.com   → EMPLOYEE (redirige a /cajero)
// // //   - cualquier@otro.com     → BUYER    (redirige a /)
// // app.post('/api/auth/login', (req, res) => {
// //   console.log('Mock: Petición de login recibida:', req.body);

// //   // Generamos un token JWT falso pero con el formato correcto de tres partes
// //   const fakeToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmYWtlX3Rva2VuX3BhcmFfcHJ1ZWJhcyJ9.mock_signature_123456";

// //   // Detección del tipo de usuario por patrones del email (simula lo que hace el backend real)
// //   const email = (req.body.email || '').toLowerCase();
// //   let tipoUsuario = 'BUYER';
// //   let nombre = 'Cliente Pacho';
// //   let multiplexId = null;

// //   if (email.includes('admin')) {
// //     tipoUsuario = 'ADMIN';
// //     nombre = 'Administrador General';
// //   } else if (email.includes('gerente')) {
// //     tipoUsuario = 'MANAGER';
// //     nombre = 'Gerente Titán';
// //     multiplexId = 'titan';
// //   } else if (email.includes('empleado') || email.includes('cajero') || email.includes('employee')) {
// //     tipoUsuario = 'EMPLOYEE';
// //     nombre = 'Cajero Pacho';
// //     multiplexId = 'titan';
// //   }

// //   console.log(`  → Tipo detectado: ${tipoUsuario} para ${email}`);

// //   // Simulamos la respuesta exitosa (AuthResponseDTO)
// //   res.status(200).json({
// //     token: fakeToken,
// //     userType: tipoUsuario,
// //     name: nombre,
// //     multiplexId: multiplexId
// //   });
// // });

// // // 4. Simular Registro de Empleado por el Admin (POST)
// // app.post('/api/admin/register_employee', (req, res) => {
// //   console.log('Mock: Registro de empleado recibido:', req.body);
// //   const authHeader = req.headers.authorization;
// //   if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //     return res.status(401).json({ message: 'No autorizado. Falta el token de administrador.' });
// //   }

// //   res.status(201).json({
// //     message: 'Empleado registrado con éxito'
// //   });
// // });

// // // ==========================================
// // // MOCKS DE ADMINISTRACIÓN (NUEVOS ENDPOINTS)
// // // ==========================================

// // let multiplexes = [
// //   { id: '1234-abcd', nameMultiplex: 'Cine Pacho Central', addressMultiplex: 'Cra 4 # 12-34', cityMultiplex: 'Bogotá' }
// // ];

// // let snacks = [
// //   { id: 's1', nameSnack: 'Combo Mega Cine', descriptionSnack: 'Palomitas gigantes, 2 refrescos grandes y nachos con queso', priceSnack: 45000, quantitySnack: 50 },
// //   { id: 's2', nameSnack: 'Palomitas Mantequilla (Grandes)', descriptionSnack: 'Las clásicas palomitas de cine recién hechas', priceSnack: 20000, quantitySnack: 50 },
// //   { id: 's3', nameSnack: 'Nachos Cine Pacho', descriptionSnack: 'Nachos con queso fundido', priceSnack: 18000, quantitySnack: 50 },
// //   { id: 's4', nameSnack: 'Combo Pareja', descriptionSnack: 'Palomitas, 2 refrescos y perro caliente', priceSnack: 38000, quantitySnack: 50 },
// //   { id: 's5', nameSnack: 'Refresco Grande', descriptionSnack: 'Bebida 32oz a elegir', priceSnack: 12000, quantitySnack: 50 },
// //   { id: 's6', nameSnack: 'Chocolatina Grande', descriptionSnack: 'Barra de chocolate premium', priceSnack: 8000, quantitySnack: 50 },
// // ];

// // // Multiplex
// // app.get('/api/admin/multiplexes', (req, res) => res.json(multiplexes));
// // app.post('/api/admin/multiplexes', (req, res) => {
// //   const newMpx = { id: Date.now().toString(), ...req.body };
// //   multiplexes.push(newMpx);
// //   res.status(201).json(newMpx);
// // });
// // app.delete('/api/admin/multiplexes/:id', (req, res) => {
// //   multiplexes = multiplexes.filter(m => m.id !== req.params.id);
// //   res.sendStatus(204);
// // });

// // // Snacks
// // app.get('/api/admin/snacks', (req, res) => res.json(snacks));
// // app.post('/api/admin/snacks', (req, res) => {
// //   const newSnack = { id: Date.now().toString(), ...req.body };
// //   snacks.push(newSnack);
// //   res.status(201).json(newSnack);
// // });
// // app.delete('/api/admin/snacks/:id', (req, res) => {
// //   snacks = snacks.filter(s => s.id !== req.params.id);
// //   res.sendStatus(204);
// // });

// // // Rooms
// // app.get('/api/admin/rooms', (req, res) => res.json([]));
// // app.post('/api/admin/rooms', (req, res) => res.status(201).json({ message: 'Room created' }));

// // // Movies
// // app.get('/admin/search', (req, res) => res.json([{ id: 1, originalTitle: 'Mock Movie', overview: 'Mock desc' }]));
// // app.post('/admin/select/:id', (req, res) => res.json({ originalTitle: 'Mock', message: 'Seleccionada' }));
// // app.post('/admin/:multiplexName/createScreening', (req, res) => res.json({ status: 'ACTIVE', movieId: req.body.movieId }));
// // app.put('/admin/:multiplexName/:screeningId/status', (req, res) => res.json({ status: req.query.status }));

// // Movies
// app.get('/api/movie/multiplex/:multiplexId/selectors', (req, res) => {
//   res.json([
//     { movieId: 1, title: 'Mock Movie 1', posterUrl: '/placeholder.png', available: true },
//     { movieId: 2, title: 'Mock Movie 2', posterUrl: '/placeholder.png', available: true },
//   ])
// })
// app.get('/api/movie/multiplex/:multiplexId/selectors/:movieId', (req, res) => {
//   res.json({ movieId: Number(req.params.movieId), title: `Mock Movie ${req.params.movieId}`, posterUrl: '/placeholder.png', available: true })
// })
// app.get('/api/movie/multiplex/:multiplexId', (req, res) => {
//   res.json([
//     { movieId: 1, title: 'Mock Movie 1', rating: 8.2, duration: 120 },
//     { movieId: 2, title: 'Mock Movie 2', rating: 7.4, duration: 110 },
//   ])
// })
// app.get('/api/movie/trailer/:movieId', (req, res) => {
//   res.send('dQw4w9WgXcQ')
// })

// // Admin Movie Management
// app.get('/api/admin/movie/search', (req, res) => res.json([{ id: 1, originalTitle: 'Mock Movie', overview: 'Mock desc' }]))
// app.post('/api/admin/movie/select/:movieId', (req, res) => res.json({ originalTitle: 'Mock Movie', message: 'Seleccionada', movieId: Number(req.params.movieId) }))
// app.post('/api/admin/movie/createScreening', (req, res) => res.status(201).json({ status: 'ACTIVE', screeningId: 'mock-screening-id', ...req.body }))
// app.put('/api/admin/movie/changeStatus/:screeningId', (req, res) => res.json({ status: req.query.status || 'ACTIVE', screeningId: req.params.screeningId }))

// // Checkout
// app.post('/api/checkout/stripe', (req, res) => {
//   const { screeningId, seats, snacks, buyerEmail } = req.body
//   res.json({
//     sessionUrl: 'https://checkout.stripe.com/pay/mock-session',
//     paymentId: `mock-${Date.now()}`,
//     screeningId,
//     seats,
//     snacks,
//     buyerEmail,
//   })
// })
// app.post('/api/checkout/stripe/success', (req, res) => {
//   const { paymentId, checkoutRequest } = req.body
//   res.json({ message: 'Pago confirmado', paymentId, checkoutRequest })
// })
// app.get('/api/checkout/stripie/cancel', (req, res) => res.json({ message: 'Pago cancelado' }))

// // Seats
// app.get('/api/seats/:roomId/screening/:screeningId', (req, res) => {
//   const rows = ['A', 'B', 'C', 'D', 'E', 'F']
//   const seats = []
//   rows.forEach((row, rowIndex) => {
//     for (let col = 1; col <= 10; col += 1) {
//       seats.push({
//         idSeat: `${row}${col}`,
//         seatNumber: rowIndex * 10 + col,
//         status: 'AVAILABLE',
//       })
//     }
//   })
//   res.json(seats)
// })
// app.put('/api/seats/:seatId/screening/:screeningId/changeStatus', (req, res) => {
//   res.json({
//     idSeat: req.params.seatId,
//     status: 'BLOCKED',
//     expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
//   })
// })

// app.get('/api/admin/multiplexes/:id', (req, res) => {
//   const found = multiplexes.find((m) => m.id === req.params.id)
//   if (!found) {
//     return res.status(404).json({ message: 'Multiplex no encontrado' })
//   }
//   res.json(found)
// })

// // const PORT = 8010;
// // app.listen(PORT, () => {
// //   console.log('===================================================');
// //   console.log(`🎭 MOCK SERVER CORRIENDO EN EL PUERTO ${PORT} 🎭`);
// //   console.log('===================================================');
// //   console.log('Tu frontend ahora creerá que está hablando con el verdadero backend de Java!');
// //   console.log('');
// //   console.log('Rutas simuladas:');
// //   console.log(' - POST /api/auth/register');
// //   console.log(' - POST /api/auth/login');
// //   console.log(' - GET  /api/auth/verify');
// //   console.log(' - POST /api/admin/register_employee');
// //   console.log('');
// //   console.log('Emails de prueba para login:');
// //   console.log('  admin@cinepacho.com    → ADMIN    → /admin/dashboard');
// //   console.log('  gerente@cinepacho.com  → MANAGER  → /manager/dashboard');
// //   console.log('  cajero@cinepacho.com   → EMPLOYEE → /cajero');
// //   console.log('  cliente@correo.com     → BUYER    → /');
// //   console.log('===================================================\n');
// // });

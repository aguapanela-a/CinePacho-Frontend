import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares para procesar JSON y permitir peticiones (CORS no es estrictamente necesario 
// porque usamos el proxy de Vite, pero es buena práctica en el mock)
app.use(cors());
app.use(express.json());

// 1. Simular Verificación de Correo (GET)
app.get('/api/auth/verify', (req, res) => {
  console.log('Mock: Verificación de correo solicitada con token:', req.query.token);
  res.send('Correo verificado correctamente');
});

// 2. Simular Registro (POST)
app.post('/api/auth/register', (req, res) => {
  console.log('Mock: Petición de registro recibida:', req.body);
  
  // Simulamos la respuesta exitosa (RegisterResponseDTO)
  res.status(201).json({
    userType: req.body.userType || 'BUYER',
    username: req.body.name || 'Nuevo Usuario',
    message: 'Usuario registrado con éxito. Por favor, revisa tu correo electrónico para verificar tu cuenta.'
  });
});

// 3. Simular Login (POST)
app.post('/api/auth/login', (req, res) => {
  console.log('Mock: Petición de login recibida:', req.body);

  // Generamos un token JWT falso pero con el formato correcto de tres partes
  const fakeToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmYWtlX3Rva2VuX3BhcmFfcHJ1ZWJhcyJ9.mock_signature_123456";
  
  // Asignamos el rol de forma insensible a mayúsculas
  const email = (req.body.email || '').toLowerCase();
  let tipoUsuario = 'BUYER';
  if (email.includes('admin')) tipoUsuario = 'ADMIN';
  else if (email.includes('empleado') || email.includes('cajero')) tipoUsuario = 'EMPLOYEE';

  // Simulamos la respuesta exitosa (AuthResponseDTO)
  res.status(200).json({
    token: fakeToken,
    userType: tipoUsuario,
    name: 'Usuario Mock'
  });
});

// 4. Simular Registro de Empleado por el Admin (POST)
app.post('/api/admin/register_employee', (req, res) => {
    console.log('Mock: Registro de empleado recibido:', req.body);
    // Verificamos si envió el token en el header (simulación)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No autorizado. Falta el token de administrador.' });
    }

    res.status(201).json({
        message: 'Empleado registrado con éxito'
    });
});

const PORT = 8010;
app.listen(PORT, () => {
  console.log('===================================================');
  console.log(`🎭 MOCK SERVER CORRIENDO EN EL PUERTO ${PORT} 🎭`);
  console.log('===================================================');
  console.log('Tu frontend ahora creerá que está hablando con el verdadero backend de Java!');
  console.log('Rutas simuladas:');
  console.log(' - POST /api/auth/register');
  console.log(' - POST /api/auth/login');
  console.log(' - GET  /api/auth/verify');
  console.log(' - POST /api/admin/register_employee');
  console.log('===================================================\n');
});

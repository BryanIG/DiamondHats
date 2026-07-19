const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/diamondhats';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a MongoDB en ' + MONGO_URI))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// User Model Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Auth Endpoints

// 1. REGISTRO
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones básicas de backend
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        // Validar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // Hashing del password (Hash seguro protocol)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear nuevo usuario
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor al registrar usuario.' });
    }
});

// 2. INICIO DE SESIÓN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos.' });
        }

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }

        // Validar contraseña aplicando comparación bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }

        // Autenticado con éxito (Enviamos datos de sesión)
        res.json({
            message: 'Inicio de sesión exitoso.',
            user: {
                username: user.username,
                email: user.email
            },
            token: 'mock-jwt-token-for-diamond-hats'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
    }
});

// 3. CAMBIO DE CONTRASEÑA
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        // Validar contraseña antigua
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'La contraseña anterior es incorrecta.' });
        }

        // Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor al cambiar la contraseña.' });
    }
});

// Arrancar Server
app.listen(PORT, () => {
    console.log(`Servidor de Autenticación de Diamond Hats ejecutándose en http://localhost:${PORT}`);
});

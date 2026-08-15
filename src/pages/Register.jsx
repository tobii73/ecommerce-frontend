import React from 'react'
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authServices';
import { SuccessModal } from '../components/SuccessModal';
import { getErrorMessage } from '../utils/getErrorMessage';
import { Link } from 'react-router-dom';
import "../styles/pages/Auth.css";


// Reglas de formato visibles antes de enviar la petición. El backend repite
// estas validaciones: el frontend solo mejora la experiencia de uso.
const USER_REGEX = /^[A-Za-z][A-Za-z0-9_-]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const {name, value} = e.target

    setFormData(currentForm => ({
      ...currentForm,
      [name]:value
    }))
  }
  const handleSubmit = async (e) => {
    setError("");
    setSuccess("");
    e.preventDefault();

    const {username, email, password} = formData
    

    // Evita una petición innecesaria cuando falta información obligatoria.
    if (!username || !email || !password) {
      setLoading(false);
      setError('Debes completar todos los campos')
      return
    }

    const resultUser = USER_REGEX.test(username)
    const resultPwd = PWD_REGEX.test(password)
    const resultEmail = EMAIL_REGEX.test(email)
    
    if (!resultUser){
      setError('El usuario debe tener entre 4 y 24 caracteres')
      return
    }
    if (!resultEmail){
      setError("Email inválido");
      return
    }
    if (!resultPwd) {
      setError('La contraseña debe contener entre 8 y 25 caracteres, mayusculas, minusculas y digitos.')
      return
    }

  setLoading(true)
  
  try {
        // El registro no inicia sesión automáticamente: confirma el resultado
        // con un modal y luego lleva al usuario al flujo de login.
        await register(formData);
        setError("")
        setSuccess("Usuario registrado correctamente.")
        setFormData({
          username: "",
          email: "",
          password: ""
        });
    } catch (error) {
        setSuccess("")
        setError(getErrorMessage(error, "No se pudo registrar el usuario."));

    } finally {
      setLoading(false)
    }

  }

  const handleSuccessClose = () => {
    // La redirección ocurre al cerrar el modal para que el usuario alcance a leerlo.
    setSuccess("");
    navigate("/login");
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="register-title">
        <header className="auth-card__header">
          <h1 id="register-title">Creá tu cuenta</h1>
          <p>Registrate para comprar y administrar tus pedidos.</p>
        </header>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" >
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" placeholder="Usuario" name='username' value={formData.username} onChange={handleChange}/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Correo electronico" name='email' value={formData.email} onChange={handleChange}/>
          </Form.Group>
          <Form.Group className="mb-3" >
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" placeholder="Contraseña" name='password' value={formData.password} onChange={handleChange}/>
          <Form.Text className="text-muted">
            Debe contener entre 8 y 24 caracteres, mayusculas, minusculas y digitos.
          </Form.Text>
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
          <Button variant="success" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </Form>
        <p className="auth-card__footer">
          ¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
        <SuccessModal
          show={Boolean(success)}
          message={success}
          onHide={handleSuccessClose}
        />
      </section>
    </main>
  )
}

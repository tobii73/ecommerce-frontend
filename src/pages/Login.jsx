import React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/authServices';
import { getCurrentUser } from '../services/authServices';
import { useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utils/getErrorMessage';
import { Link } from 'react-router-dom';
import "../styles/pages/Auth.css";

export const Login = () => {

  const { setAuth } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email:"",
    password:""
  })

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const {name, value} = e.target
    setFormData({
      ...formData,
      [name]:value
    })
  }

  const handleSubmit =  async(e)=> {
    setError("");
    setSuccess("");
    e.preventDefault();

    const { email, password } = formData;
    
    if (!email || !password) {
      setError("Debes completar todos los campos.");
    return;
    }

    setLoading(true)

    try {
      const response = await login(formData);
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      const userResponse = await getCurrentUser(accessToken);
      
      setAuth({
          user: userResponse.data,
          accessToken: accessToken,
          refreshToken: refreshToken
      });
      navigate(location.state?.from || "/", { replace: true });
      setSuccess("Inicio de sesión correcto.");
      setFormData({
        email: "",
        password: ""
      });
    } catch (error) {
        setSuccess("")
        setError(getErrorMessage(error, "No se pudo iniciar sesión."));
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <header className="auth-card__header">
          <h1 id="login-title">Bienvenido de nuevo</h1>
          <p>Ingresá a tu cuenta para continuar comprando.</p>
        </header>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Correo electronico" name='email' value={formData.email} onChange={handleChange}/>
          </Form.Group>
          <Form.Group className="mb-3" >
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" placeholder="Contraseña" name='password' value={formData.password} onChange={handleChange}/>
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>}
          <Button variant="success" type="submit" disabled={loading}>
            {loading ? "Iniciando" : "Iniciar Sesion" } 
          </Button>
        </Form>
        <p className="auth-card__footer">
          ¿Todavía no tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </section>
    </main>
  )
}

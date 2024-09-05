import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, facebookProvider } from '../firebase/firebaseConfig';
import Swal from 'sweetalert2';
import '../styles/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail && savedPassword && savedRememberMe) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(savedRememberMe);
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      Swal.fire('Erro', 'Por favor, insira um email válido.', 'error');
      return;
    }

    try {
      const response = await axios.post('https://pintfinal-backend.onrender.com/auth/login', {
        user_mail: email,
        user_password: password,
      });

      const { firstLogin, token } = response.data;

      sessionStorage.setItem('token', token);

      if (rememberMe) {
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
        localStorage.setItem('rememberMe', true);
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }

      if (firstLogin) {
        Swal.fire('Bem-vindo!', 'Primeiro login bem-sucedido!', 'success').then(() => {
          navigate('/auth/primeiro-login'); // Redireciona para a página de boas-vindas
        });
      } else {
        Swal.fire('Sucesso', 'Login bem-sucedido!', 'success').then(() => {
          navigate('/dashboard');
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login.';
      if (errorMessage === 'Senha incorreta.') {
        Swal.fire('Erro', 'Senha incorreta.', 'error');
      } else if (errorMessage === 'Acesso restrito a administradores.') {
        Swal.fire('Erro', 'Acesso restrito a administradores.', 'error');
      } else if (errorMessage === 'Utilizador não encontrado.') {
        Swal.fire('Erro', 'Utilizador não encontrado.', 'error');
      } else {
        Swal.fire('Erro', errorMessage, 'error');
      }
    }
  };

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const response = await axios.post('https://pintfinal-backend.onrender.com/auth/google-login', {
        user_mail: result.user.email,
        user_name: result.user.displayName,
        user_photo: result.user.photoURL,
      });

      const { firstLogin, token } = response.data;

      sessionStorage.setItem('token', token); // Armazena o token da mesma forma que no login normal

      if (firstLogin) {
        Swal.fire('Sucesso', 'Bem-vindo ao seu primeiro login!', 'success').then(() => {
          navigate('/auth/register-google');  // Redireciona para a página de boas-vindas
        });
      } else {
        Swal.fire('Sucesso', 'Login com Google bem-sucedido!', 'success').then(() => {
          navigate('/dashboard');  // Redireciona para o dashboard
        });
      }
    } catch (error) {
      Swal.fire('Erro', 'Acesso restrito a administradores.', 'error');
    }
  };

  const handleFacebook = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const response = await axios.post('https://pintfinal-backend.onrender.com/auth/facebook-login', {
        user_mail: result.user.email,
        user_name: result.user.displayName,
        user_photo: result.user.photoURL,
      });

      const { firstLogin, token } = response.data;

      sessionStorage.setItem('token', token); // Armazena o token da mesma forma que no login normal

      if (firstLogin) {
        Swal.fire('Sucesso', 'Bem-vindo ao seu primeiro login!', 'success').then(() => {
          navigate('/auth/primeiro-login');  // Redireciona para a página de boas-vindas
        });
      } else {
        Swal.fire('Sucesso', 'Login com Facebook bem-sucedido!', 'success').then(() => {
          navigate('/dashboard');  // Redireciona para o dashboard
        });
      }
    } catch (error) {
      Swal.fire('Erro', 'Erro ao fazer login com Facebook.', 'error');
    }
  };

  return (
    <div className="container" id='logins'>
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <img src="/logotipo-softinsa.png" alt="Logotipo Softinsa" style={{ width: '40%', marginLeft: '28%' }} />
              <h2 className="text-center mb-4">Login</h2>

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <FontAwesomeIcon icon={faEnvelope} /> E-mail:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3 position-relative">
                  <label htmlFor="password" className="form-label">
                    <FontAwesomeIcon icon={faLock} /> Senha:
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} // Remove bordas do lado esquerdo do botão
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Lembrar-me
                  </label>
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-3">Entrar</button>
                <button type="button" onClick={handleGoogle} className="btn btn-danger w-100 mb-3">
                  <FontAwesomeIcon icon={faGoogle} /> Login com Google
                </button>

              </form>
              <p className="mt-3 text-center">
                Não tem uma conta? <Link to="/register">Registrar</Link>
              </p>
              <p className="mt-3 text-center">
                Esqueceu sua senha? <Link to="/forgot-password">Recuperar</Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
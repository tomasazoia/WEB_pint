import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa o CSS do Bootstrap
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem.');
      setMessage('');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');

      const response = await axios.post('http://localhost:3000/auth/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: {
          'x-auth-token': token
        }
      });

      setMessage(response.data.message || 'Senha alterada com sucesso.');
      setError('');
      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Senha alterada com sucesso!',
        confirmButtonText: 'OK'
      });
      navigate('/dashboard');

      // Limpar campos após sucesso
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar a senha.');
      setMessage('');
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: err.response?.data?.message || 'Erro ao alterar a senha.',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4 mb-5 bg-white rounded">
        <div className="card-header bg-primary text-white text-center">
          <FontAwesomeIcon icon={faLock} size="3x" />
          <h2 className="mt-3 text-white">Mudar Senha</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleChangePassword}>
            <div className="mb-3">
              <label htmlFor="oldPassword" className="form-label"><FontAwesomeIcon icon={faLock} /> Senha Antiga:</label>
              <input
                type="password"
                id="oldPassword"
                className="form-control"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label"><FontAwesomeIcon icon={faLock} /> Nova Senha:</label>
              <input
                type="password"
                id="newPassword"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label"><FontAwesomeIcon icon={faLock} /> Confirmar Nova Senha:</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3"><FontAwesomeIcon icon={faLock} /> Alterar Senha</button>
          </form>
          {message && <div className="alert alert-success mt-3" role="alert">{message}</div>}
          {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
          <button
            type="button"
            className="btn btn-danger w-100"
            onClick={() => navigate('/user/profile')} // Redireciona para a página de perfil
          >
            Cancelar
          </button>
        </div>

      </div>

    </div>
  );
};

export default ChangePassword;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faMapMarkerAlt, faPhone, faSave } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Import para navegação

const Perfil = () => {
  const [formData, setFormData] = useState({
    NIF: '',
    MORADA: '',
    NTELEMOVEL: '',
    ID_CENTRO: ''
  });
  const [centros, setCentros] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    // Buscar os centros disponíveis
    const fetchCentros = async () => {
      try {
        const response = await axios.get('http://localhost:3000/centro/list');
        setCentros(response.data);
      } catch (error) {
        console.error('Erro ao buscar centros:', error);
      }
    };

    fetchCentros();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogout = () => {
    console.log('Logging out...');
    sessionStorage.removeItem('token');
    console.log('Token after removal:', sessionStorage.getItem('token')); // Deve ser null
    navigate('/login');
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');

    try {
      // Atualizar os dados do perfil
      await axios.put('http://localhost:3000/user/profileup', {
        NIF: formData.NIF,
        MORADA: formData.MORADA,
        NTELEMOVEL: formData.NTELEMOVEL
      }, {
        headers: { 'x-auth-token': token }
      });

      // Atualizar o centro
      await axios.put('http://localhost:3000/user/updateCentro', {
        ID_CENTRO: formData.ID_CENTRO
      }, {
        headers: { 'x-auth-token': token }
      });

      // Exibe um alerta de sucesso e então realiza o logout
      Swal.fire({
        title: 'Bem-vindo',
        text: 'Registro bem-sucedido',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        handleLogout(); // Chama a função de logout após o sucesso
      });

    } catch (error) {
      setError(`Erro ao atualizar os dados: ${error.response ? error.response.data.message : error.message}`);
      console.error('Erro ao atualizar os dados:', error);
    }
  };

  if (error) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-3 mb-5 bg-white rounded">
        <div className="card-header bg-primary text-white text-center">
          <h1 className="mt-3">Continue o seu registro</h1>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label"><FontAwesomeIcon icon={faIdCard} /> NIF</label>
              <input
                type="text"
                className="form-control"
                name="NIF"
                value={formData.NIF}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label"><FontAwesomeIcon icon={faMapMarkerAlt} /> Morada</label>
              <input
                type="text"
                className="form-control"
                name="MORADA"
                value={formData.MORADA}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label"><FontAwesomeIcon icon={faPhone} /> Telefone</label>
              <input
                type="text"
                className="form-control"
                name="NTELEMOVEL"
                value={formData.NTELEMOVEL}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="centro"><FontAwesomeIcon icon={faMapMarkerAlt} /> Selecione o Centro</label>
              <select
                id="centro"
                className="form-control"
                name="ID_CENTRO"
                value={formData.ID_CENTRO}
                onChange={handleChange}
                required
              >
                <option value="">Escolha um Centro</option>
                {centros.map((centro) => (
                  <option key={centro.ID_CENTRO} value={centro.ID_CENTRO}>
                    {centro.NOME_CENTRO}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-primary"><FontAwesomeIcon icon={faSave} /> Prosseguir</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
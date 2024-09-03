import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import React, { useState } from "react";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const AdicionarCentro = () => {
  const [formValues, setFormValues] = useState({
    NOME_CENTRO: '',
    MORADA: '',
    N_EVENTOS: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/centro/create', formValues);

      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: response.data.message
      });

      navigate('/centro/list');
    } catch (error) {
      console.error('Erro ao criar centro:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.response?.data?.message || 'Erro ao criar centro.'
      });
    }
  };

  return (
    <div className="container mt-4">
      <h1>Adicionar Novo Centro</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="NOME_CENTRO" className="form-label">Nome do Centro</label>
          <input
            type="text"
            id="NOME_CENTRO"
            name="NOME_CENTRO"
            className="form-control"
            value={formValues.NOME_CENTRO}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="MORADA" className="form-label">Morada</label>
          <input
            type="text"
            id="MORADA"
            name="MORADA"
            className="form-control"
            value={formValues.MORADA}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Adicionar Centro</button>
      </form>
    </div>
  );
};

export default AdicionarCentro;

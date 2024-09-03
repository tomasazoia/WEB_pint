import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faIdCard, faMapMarkerAlt, faPhone, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const Utilizadores = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    try {
      const userResponse = await axios.get('http://localhost:3000/user/profile', {
        headers: {
          'x-auth-token': token
        }
      });

      const idCentro = userResponse.data.ID_CENTRO;

      if (!idCentro) {
        setError('ID do Centro não encontrado.');
        return;
      }

      const usersResponse = await axios.get(`http://localhost:3000/user/listvalidados/${userResponse.data.ID_FUNCIONARIO}`, {
        headers: {
          'x-auth-token': token
        }
      });

      setUsers(usersResponse.data);

    } catch (error) {
      setError('Erro ao carregar os dados.');
      console.error('Erro ao carregar os dados:', error);
    }
  };
  
  const handleDelete = (userId) => {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    axios.put(`http://localhost:3000/user/invalidar/${userId}`, {}, {
      headers: {
        'x-auth-token': token
      }
    })
    .then(response => {
      // Atualiza a lista de utilizadores filtrando o que foi excluído
      setUsers(users.filter(user => user.ID_FUNCIONARIO !== userId));
    })
    .catch(error => {
      setError('Erro ao invalidar o utilizador.');
      console.error('Erro ao invalidar o utilizador:', error);
    });
  };

  const toggleAdminStatus = async (userId, isAdmin) => {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    try {
      if (isAdmin) {
        await axios.put(`http://localhost:3000/user/unadmin/${userId}`, {}, {
          headers: {
            'x-auth-token': token
          }
        });
        alert('Utilizador rebaixado para usuário normal com sucesso!');
      } else {
        await axios.put(`http://localhost:3000/user/admin/${userId}`, {}, {
          headers: {
            'x-auth-token': token
          }
        });
        alert('Utilizador promovido a administrador com sucesso!');
      }
      fetchUsers(); // Atualiza a lista de utilizadores após a mudança de status
    } catch (error) {
      setError('Erro ao alterar o status do utilizador.');
      console.error('Erro ao alterar o status do utilizador:', error);
    }
  };

  if (error) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  if (users.length === 0) {
    return <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Carregando...</span>
      </div>
    </div>;
  }

  return (
    <div className="container mt-5">
      <h1>Lista de Utilizadores do Centro</h1>
      <div className="list-group">
        {users.map(user => (
          <div key={user.ID_FUNCIONARIO} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5><FontAwesomeIcon icon={faUser} /> {user.user_name}</h5>
              <p><FontAwesomeIcon icon={faEnvelope} /> <strong>Email:</strong> {user.user_mail}</p>
              <p><FontAwesomeIcon icon={faIdCard} /> <strong>NIF:</strong> {user.NIF}</p>
              <p><FontAwesomeIcon icon={faMapMarkerAlt} /> <strong>Morada:</strong> {user.MORADA}</p>
              <p><FontAwesomeIcon icon={faPhone} /> <strong>Telefone:</strong> {user.NTELEMOVEL}</p>
            </div>
            <div>
              <button className="btn btn-danger mr-2" onClick={() => handleDelete(user.ID_FUNCIONARIO)}>
                <FontAwesomeIcon icon={faTrash} /> Invalidar
              </button>
              <button 
                className={`btn ${user.ADMINISTRADOR ? 'btn-warning' : 'btn-primary'}`} 
                onClick={() => toggleAdminStatus(user.ID_FUNCIONARIO, user.ADMINISTRADOR)}
              >
                <FontAwesomeIcon icon={user.ADMINISTRADOR ? faArrowDown : faArrowUp} /> 
                {user.ADMINISTRADOR ? ' Rebaixar a User Normal' : ' Promover a Admin'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Utilizadores;

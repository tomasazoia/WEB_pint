import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const UsersNaoValidados = () => {
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
      const userResponse = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
        headers: {
          'x-auth-token': token
        }
      });
      const idCentro = userResponse.data.ID_CENTRO;

      if (!idCentro) {
        setError('ID do Centro não encontrado.');
        return;
      }

      const usersResponse = await axios.get(`https://pintfinal-backend.onrender.com/user/listnaovalidados/${userResponse.data.ID_FUNCIONARIO}`, {
        headers: {
          'x-auth-token': token
        }
      });

      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Erro ao listar utilizadores não validados:', error);
    }
  };

  const validarUser = async (userId) => {
    try {
      await axios.put(`https://pintfinal-backend.onrender.com/user/validar/${userId}`);
      alert('Utilizador validado com sucesso!');
      fetchUsers(); // Atualiza a lista de utilizadores após validar
    } catch (error) {
      alert('Erro ao validar utilizador: ' + error.response.data.message);
    }
  };

  const handleDelete = (userId) => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    axios.put(`https://pintfinal-backend.onrender.com/user/delete/${userId}`, {}, {
      headers: {
        'x-auth-token': token
      }
    })
      .then(response => {
        // Atualiza a lista de utilizadores filtrando o que foi excluído
        setUsers(users.filter(user => user.ID_FUNCIONARIO !== userId));
      })
      .catch(error => {
        setError('Erro ao eliminar o utilizador.');
        console.error('Erro ao eliminar o utilizador:', error);
      });
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Utilizadores Não Validados</h1>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.ID_FUNCIONARIO}>
                <td>{user.ID_FUNCIONARIO}</td>
                <td>{user.user_name}</td>
                <td>{user.user_mail}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => validarUser(user.ID_FUNCIONARIO)}
                  >
                    Validar
                  </button>
                  <button className="btn btn-danger mr-2" onClick={() => handleDelete(user.ID_FUNCIONARIO)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersNaoValidados;

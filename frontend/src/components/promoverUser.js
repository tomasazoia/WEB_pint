import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageUsers = () => {
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

      const usersResponse = await axios.get(`https://pintfinal-backend.onrender.com/user/listvalidados/${userResponse.data.ID_FUNCIONARIO}`, {
        headers: {
          'x-auth-token': token
        }
      });

      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Erro ao listar utilizadores:', error);
      setError('Erro ao listar utilizadores.');
    }
  };

  const toggleAdminStatus = async (userId, isAdmin) => {
    try {
      if (isAdmin) {
        await axios.put(`https://pintfinal-backend.onrender.com/user/unadmin/${userId}`);
        alert('Utilizador rebaixado para usuário normal com sucesso!');
      } else {
        await axios.put(`https://pintfinal-backend.onrender.com/user/admin/${userId}`);
        alert('Utilizador promovido a administrador com sucesso!');
      }
      fetchUsers(); // Atualiza a lista de utilizadores após a mudança de status
    } catch (error) {
      alert('Erro ao alterar o status do utilizador: ' + error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gerir Utilizadores</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.ID_FUNCIONARIO}>
                <td>{user.ID_FUNCIONARIO}</td>
                <td>{user.user_name}</td>
                <td>{user.user_mail}</td>
                <td>{user.ADMINISTRADOR ? 'Administrador' : 'User Normal'}</td>
                <td>
                  <button 
                    className={`btn ${user.ADMINISTRADOR ? 'btn-warning' : 'btn-primary'}`} 
                    onClick={() => toggleAdminStatus(user.ID_FUNCIONARIO, user.ADMINISTRADOR)}
                  >
                    {user.ADMINISTRADOR ? 'Rebaixar para User normal' : 'Promover a Admin'}
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

export default ManageUsers;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/styles.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]); // Estado para armazenar as áreas
  const [subareas, setSubAreas] = useState([]); // Estado para armazenar as subáreas
  const [error, setError] = useState(''); // Estado para armazenar erros, se houver

  const handleLogout = () => {
    console.log('Logging out...');
    sessionStorage.removeItem('token');
    console.log('Token after removal:', sessionStorage.getItem('token')); // Deve ser null
    navigate('/login');
    window.location.reload();
  };

  useEffect(() => {
    const fetchAreasAndSubareas = async () => {
      try {
        // Faz o pedido para buscar as áreas
        const areasResponse = await axios.get('https://pint-backend-5gz8.onrender.com/area/list');
        setAreas(areasResponse.data);

        // Faz o pedido para buscar as subáreas
        const subareasResponse = await axios.get('https://pint-backend-5gz8.onrender.com/subarea/list');
        setSubAreas(subareasResponse.data);
      } catch (error) {
        console.error('Erro ao buscar áreas e subáreas:', error);
        setError('Erro ao carregar áreas e subáreas.');
      }
    };

    fetchAreasAndSubareas(); // Chama a função ao montar o componente
  }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-light shadow-sm fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          <img
            src="/logotipo-softinsa.png"
            alt="Logotipo Softinsa"
            className="navbar-logo"
            style={{ width: "150px" }}
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto">
            {/* Dashboard */}
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/dashboard">
                Dashboard
              </Link>
            </li>

            {/* Calendário */}
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/calendario">
                Calendário
              </Link>
            </li>

            {/* Formulários */}
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/formularios">
                Formulários
              </Link>
            </li>

            {/* Notificações */}
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/notificacoes">
                Notificações
              </Link>
            </li>

            {/* Utilizadores */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle text-dark"
                to="#"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Utilizadores
              </Link>
              <ul className="dropdown-menu" aria-labelledby="userDropdown">
                <li>
                  <Link className="dropdown-item" to="/user/list">
                    Gerir Utilizadores Validados
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/user/listNVal">
                    Listar Utilizadores por Validar
                  </Link>
                </li>
              </ul>
            </li>


            {/* Centros */}
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/centro/list">
                Centros
              </Link>
            </li>

            {/* Estabelecimentos */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle text-dark"
                to="#"
                id="locaisDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Estabelecimentos
              </Link>
              <ul className="dropdown-menu" aria-labelledby="locaisDropdown">
                <li>
                  <Link className="dropdown-item" to="/locais/list">
                    Gerir Estabelecimentos Validados
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/locais/validarlocais">
                    Listar Estabelecimentos por Validar
                  </Link>
                </li>
              </ul>
            </li>

            {/* Eventos */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle text-dark"
                to="#"
                id="eventosDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Eventos
              </Link>
              <ul className="dropdown-menu" aria-labelledby="eventosDropdown">
                <li>
                  <Link className="dropdown-item" to="/evento/manage">
                    Gerir Eventos
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/evento/list">
                    Listar Eventos Disponíveis
                  </Link>
                </li>
              </ul>
            </li>

            {/* Áreas */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle text-dark"
                to="#"
                id="areaDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Áreas
              </Link>
              <ul className="dropdown-menu" aria-labelledby="areaDropdown">
                {areas.map((area) => (
                  <li key={area.ID_AREA}>
                    <Link
                      className="dropdown-item"
                      to={`/locais/listarea/${area.ID_AREA}`}
                    >
                      {area.NOME_AREA}
                    </Link>
                  </li>
                ))}
                <li className="dropdown-item create-btn">
                  <Link
                    to="/area/create"
                    className="btn btn-outline-primary w-100"
                  >
                    Gerir Áreas
                  </Link>
                </li>
              </ul>
            </li>

            {/* Sub-Áreas */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle text-dark"
                to="#"
                id="subareaDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Sub-Áreas
              </Link>
              <ul className="dropdown-menu" aria-labelledby="subareaDropdown">
                {subareas.map((subarea) => (
                  <li key={subarea.ID_SUB_AREA}>
                    <Link
                      className="dropdown-item"
                      to={`/locais/listsubarea/${subarea.ID_SUB_AREA}`}
                    >
                      {subarea.NOME_SUBAREA}
                    </Link>
                  </li>
                ))}
                <li className="dropdown-item create-btn">
                  <Link
                    to="/subarea/create"
                    className="btn btn-outline-primary w-100"
                  >
                    Gerir Sub-Áreas
                  </Link>
                </li>
              </ul>
            </li>

            {/* Perfil */}
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/user/profile">
                Perfil
              </Link>
            </li>

            {/* Informações */}
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/infos">
                Informações e Avisos
              </Link>
            </li>
          </ul>

          {/* Botão de Logout */}
          <button
            className="btn btn-danger ms-3"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
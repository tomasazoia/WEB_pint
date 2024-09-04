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
    <nav className="navbar bg-body-tertiary fixed-top">
      <div className="container-fluid">
        <Link to="/dashboard">
          <img src="/logotipo-softinsa.png" alt="Logotipo Softinsa" className="navbar-logo" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li className="nav-item">
                <Link className="nav-link active text-secondary fs-6" to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-secondary fs-6" to="/calendario">Calendário</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-secondary fs-6" to="/formularios">Formulários</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-secondary fs-6" to="/notificacoes">Notificações</Link>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-secondary fs-6" to="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Utilizadores
                </Link>
                <ul className="dropdown-menu" aria-labelledby="userDropdown">
                  <li><Link className="dropdown-item" to="/user/list">Gerir Utilizadores Validados</Link></li>
                  <li><Link className="dropdown-item" to="/user/listNVal">Listar Utilizadores por Validar</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-secondary fs-6" to="#" id="reportsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Reports em Comentarios
                </Link>
                <ul className="dropdown-menu" aria-labelledby="reportsDropdown">
                  <li><Link className="dropdown-item" to="/reportEventos">Eventos</Link></li>
                  <li><Link className="dropdown-item" to="/reportLocais">Locais</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-secondary fs-6" to="/centro/list">Centros</Link>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-secondary fs-6" to="#" id="comDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Validar Comentários
                </Link>
                <ul className="dropdown-menu" aria-labelledby="comDropdown">
                  <li><Link className="dropdown-item" to="/comentariosinv">Eventos</Link></li>
                  <li><Link className="dropdown-item" to="/comentariosinvlocal">Locais</Link></li>
                  <li><Link className="dropdown-item" to="/validarcomfor">Foruns</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-secondary fs-6" to="#" id="locaisDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Estabelecimentos
                </Link>
                <ul className="dropdown-menu" aria-labelledby="locaisDropdown">
                  <li><Link className="dropdown-item" to="/locais/list">Gerir Estabelecimentos Validados</Link></li>
                  <li><Link className="dropdown-item" to="/locais/validarlocais">Listar Estabelecimentos por Validar</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-secondary fs-6" to="#" id="eventosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Eventos
                </Link>
                <ul className="dropdown-menu" aria-labelledby="eventosDropdown">
                  <li><Link className="dropdown-item" to="/evento/manage">Gerir Eventos</Link></li>
                  <li><Link className="dropdown-item" to="/evento/list">Listar Eventos Disponíveis</Link></li>
                </ul>
              </li>
              {/* Áreas */}
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-secondary fs-6" to="#" id="areaDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Áreas
                </Link>
                <ul className="dropdown-menu" aria-labelledby="areaDropdown">
                  {areas.map(area => (
                    <li key={area.ID_AREA}>
                      <Link className="dropdown-item" to={`/locais/listarea/${area.ID_AREA}`}>{area.NOME_AREA}</Link>
                    </li>
                  ))}
                  <div className="dropdown-item create-btn">
                    <Link to="/area/create" className="btn btn-primary w-100">Gerir Áreas</Link>
                  </div>
                </ul>
              </li>
              {/* Sub-Áreas */}
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-secondary fs-6" to="#" id="subareaDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Sub-Áreas
                </Link>
                <ul className="dropdown-menu" aria-labelledby="subareaDropdown">
                  {subareas.map(subarea => (
                    <li key={subarea.ID_SUB_AREA}>
                      <Link className="dropdown-item" to={`/locais/listsubarea/${subarea.ID_SUB_AREA}`}>{subarea.NOME_SUBAREA}</Link>
                    </li>
                  ))}
                  <div className="dropdown-item create-btn">
                    <Link to="/subarea/create" className="btn btn-primary w-100">Gerir Sub-Áreas</Link>
                  </div>
                </ul>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-secondary fs-6" to="/user/profile">Perfil</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-secondary fs-6" to="/infos">Informações E Avisos</Link>
              </li>
            </ul>
            <button className="btn btn-outline-danger mt-3" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

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
        const areasResponse = await axios.get('http://localhost:3000/area/list');
        setAreas(areasResponse.data);

        // Faz o pedido para buscar as subáreas
        const subareasResponse = await axios.get('http://localhost:3000/subarea/list');
        setSubAreas(subareasResponse.data);
      } catch (error) {
        console.error('Erro ao buscar áreas e subáreas:', error);
        setError('Erro ao carregar áreas e subáreas.');
      }
    };

    fetchAreasAndSubareas(); // Chama a função ao montar o componente
  }, []);

  return (
    <nav class="navbar bg-body-tertiary fixed-top">
      <div class="container-fluid">
      <a href="/dashboard">
  <img src="/logotipo-softinsa.png" alt="Logotipo Softinsa" class="navbar-logo" />
</a>
<button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li class="nav-item">
                <a class="nav-link active text-secondary fs-6" href="/dashboard">Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-secondary fs-6" href="/calendario">Calendário</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-secondary fs-6" href="/formularios">Formulários</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-secondary fs-6" href="/notificacoes">Notificações</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-secondary fs-6" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Utilizadores
                </a>
                <ul class="dropdown-menu" aria-labelledby="userDropdown">
                  <li><a class="dropdown-item" href="/user/list">Gerir Utilizadores Validados</a></li>
                  <li><a class="dropdown-item" href="/user/listNVal">Listar Utilizadores por Validar</a></li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-secondary fs-6" href="#" id="reportsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Reports em Comentarios
                </a>
                <ul class="dropdown-menu" aria-labelledby="reportsDropdown">
                  <li><a class="dropdown-item" href="/reportEventos">Eventos</a></li>
                  <li><a class="dropdown-item" href="/reportLocais">Locais</a></li>
                </ul>
              </li>

              <li class="nav-item">
                <a class="nav-link text-secondary fs-6" href="/centro/list">Centros</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-secondary fs-6" href="#" id="comDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Validar Comentários
                </a>
                <ul class="dropdown-menu" aria-labelledby="comDropdown">
                  <li><a class="dropdown-item" href="/comentariosinv">Eventos</a></li>
                  <li><a class="dropdown-item" href="/comentariosinvlocal">Locais</a></li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-secondary fs-6" href="#" id="locaisDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Estabelecimentos
                </a>
                <ul class="dropdown-menu" aria-labelledby="locaisDropdown">
                  <li><a class="dropdown-item" href="/locais/list">Gerir Estabelecimentos Validados</a></li>
                  <li><a class="dropdown-item" href="/locais/validarlocais">Listar Estabelecimentos por Validar</a></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-secondary fs-6" href="#" id="eventosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Eventos
                </a>
                <ul className="dropdown-menu" aria-labelledby="eventosDropdown">

                  <li><a class="dropdown-item" href="/evento/manage">Gerir Eventos</a></li>
                  <li><a class="dropdown-item" href="/evento/list">Listar Eventos Disponíveis</a></li>
                </ul>
              </li>

              {/* Áreas */}
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-secondary fs-6" href="#" id="areaDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Áreas
                </a>
                <ul class="dropdown-menu" aria-labelledby="areaDropdown">
                  {areas.map(area => (
                    <li key={area.ID_AREA}>
                      <a class="dropdown-item" href={`/locais/listarea/${area.ID_AREA}`}>{area.NOME_AREA}</a>
                    </li>
                  ))}
                  <div class="dropdown-item create-btn">
                    <a href="/area/create" class="btn btn-primary w-100">Gerir Áreas</a>
                  </div>
                </ul>
              </li>

              {/* Sub-Áreas */}
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-secondary fs-6" href="#" id="subareaDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Sub-Áreas
                </a>
                <ul class="dropdown-menu" aria-labelledby="subareaDropdown">
                  {subareas.map(subarea => (
                    <li key={subarea.ID_SUB_AREA}>
                      <a class="dropdown-item" href={`/locais/listsubarea/${subarea.ID_SUB_AREA}`}>{subarea.NOME_SUBAREA}</a>
                    </li>
                  ))}
                  <div class="dropdown-item create-btn">
                    <a href="/subarea/create" class="btn btn-primary w-100">Gerir Sub-Áreas</a>
                  </div>
                </ul>
              </li>

              <li class="nav-item">
                <a class="nav-link text-secondary fs-6" href="/user/profile">Perfil</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-secondary fs-6" href="/infos">Informações E Avisos</a>
              </li>
            </ul>
            <button class="btn btn-outline-danger mt-3" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
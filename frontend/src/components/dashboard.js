import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import "../styles/styles.css";
import './i18n'; // Configuração do i18next
import 'bootstrap/dist/css/bootstrap.min.css'; // Certifique-se de importar o CSS do Bootstrap
import { Dropdown } from 'react-bootstrap';

const Dashboard = () => {
  const [localsData, setLocalsData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [startDateData, setStartDateData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [commentData, setCommentData] = useState([]); // Novo estado para armazenar os dados de comentários
  const [commentLocalData, setCommentLocalData] = useState([]); // Novo estado para armazenar os dados de comentários
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);

  const { t, i18n } = useTranslation(); // Hook para tradução

  useEffect(() => {
    // Função para buscar os dados de locais por área
    const fetchLocalsData = async () => {
      try {
        const response = await axios.get('https://pintfinal-backend.onrender.com/locais/locals-by-area');
        const formattedData = [
          ['Área', 'Locais'],
          ...response.data.map(item => [item.area_name, parseInt(item.local_count)])
        ];
        setLocalsData(formattedData);
      } catch (error) {
        console.error('Error fetching locals data:', error);
        setError(error.message);
      }
    };

    // Função para buscar os dados de usuários por centro
    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://pintfinal-backend.onrender.com/user/users-by-center');
        const formattedData = [
          ['Centro', 'Users'],
          ...response.data.map(item => [item.centro_nome, parseInt(item.user_count)])
        ];
        setUserData(formattedData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
      }
    };

    // Função para buscar os dados de usuários por data de início
    const fetchStartDateData = async () => {
      try {
        const response = await axios.get('https://pintfinal-backend.onrender.com/user/users-by-start-date');
        const formattedData = [
          ['Data de Início', 'Users'],
          ...response.data.map(item => [item.start_date, parseInt(item.user_count)])
        ];
        setStartDateData(formattedData);
      } catch (error) {
        console.error('Error fetching start date data:', error);
        setError(error.message);
      }
    };

    // Função para buscar os dados de eventos por área
    const fetchEventData = async () => {
      try {
        const response = await axios.get('https://pintfinal-backend.onrender.com/evento/eventos-by-area');
        const formattedData = [
          ['Área', 'Eventos'],
          ...response.data.map(item => [item.area_name, parseInt(item.event_count)])
        ];
        setEventData(formattedData);
      } catch (error) {
        console.error('Error fetching event data:', error);
        setError(error.message);
      }
    };

    // Nova função para buscar a quantidade de comentários
    const fetchCommentData = async () => {
      try {
        const response = await axios.get('https://pintfinal-backend.onrender.com/comentarios_evento/quantidade'); // Chamada ao novo endpoint
        const formattedData = [
          ['Tipo', 'Quantidade'],
          ['Total Comentários em Eventos', response.data.comentariosValidados]];
        setCommentData(formattedData);
      } catch (error) {
        console.error('Error fetching comment data:', error);
        setError(error.message);
      }
    };

    const fetchCommentLocalData = async () => {
      try {
        const response = await axios.get('https://pintfinal-backend.onrender.com/comentarios_local/quantidade'); // Chamada ao novo endpoint
        const formattedData = [
          ['Tipo', 'Quantidade'],
          ['Total Comentários em Locais', response.data.comentariosValidados]];
        setCommentLocalData(formattedData);
      } catch (error) {
        console.error('Error fetching comment data:', error);
        setError(error.message);
      }
    };

    // Função para buscar o nome do usuário
    const fetchUserName = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('Token de autenticação não encontrado.');

        const response = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
          headers: { 'x-auth-token': token }
        });
        setUserName(response.data.user_name);
      } catch (error) {
        console.error('Error fetching user name:', error);
        setError('Error fetching user name');
      }
    };

    fetchLocalsData();
    fetchUserData();
    fetchStartDateData();
    fetchEventData();
    fetchCommentData(); // Chamada para buscar os dados de comentários
    fetchCommentLocalData();
    fetchUserName();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('goodMorning');
    } else if (hour < 20) {
      return t('goodAfternoon');
    } else {
      return t('goodEvening');
    }
  };

  const localsOptions = {
    title: 'Quantidade de Locais por Área',
    hAxis: { title: 'Área', titleTextStyle: { color: '#333' } },
    vAxis: { minValue: 0 },
  };

  const barOptions = {
    title: 'Quantidade de Users por Centro',
    hAxis: { title: 'Centro', titleTextStyle: { color: '#333' } },
    vAxis: { minValue: 0 },
  };

  const pieOptions = {
    title: 'Distribuição de Users por Centro',
    is3D: true,
  };

  const lineOptions = {
    title: 'Crescimento de Users por Centro ao Longo do Tempo',
    hAxis: { title: 'Tempo' },
    vAxis: { title: 'Users' },
    curveType: 'function',
    legend: { position: 'bottom' },
  };

  const columnOptions = {
    title: 'Quantidade de Users por Centro',
    hAxis: { title: 'Centro', titleTextStyle: { color: '#333' } },
    vAxis: { minValue: 0 },
  };

  const areaOptions = {
    title: 'Distribuição de Users por Centro ao Longo do Tempo',
    hAxis: { title: 'Tempo' },
    vAxis: { title: 'Users' },
    isStacked: true,
  };

  const startDateOptions = {
    title: 'Número de Users por Data de Início',
    hAxis: { title: 'Data de Início', titleTextStyle: { color: '#333' } },
    vAxis: { title: 'Users' },
    legend: 'none',
    curveType: 'function',
  };

  const eventOptions = {
    title: 'Quantidade de Eventos por Área',
    hAxis: { title: 'Área', titleTextStyle: { color: '#333' } },
    vAxis: { minValue: 0 },
  };

  const commentOptions = {
    title: 'Quantidade de Comentários em Eventos',
    hAxis: { title: 'Tipo', titleTextStyle: { color: '#333' } },
    vAxis: { minValue: 0 },
  };

  const pieOptionsLocal = {
    title: 'Quantidade de Comentários em Locais',
    is3D: true,
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="dashboard-container">
      <Dropdown>
        <Dropdown.Toggle variant="primary" id="dropdown-basic">
          {i18n.language === 'en' ? 'en' : i18n.language === 'pt' ? 'pt' : 'es'}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleLanguageChange('en')}>en</Dropdown.Item>
          <Dropdown.Item onClick={() => handleLanguageChange('pt')}>pt</Dropdown.Item>
          <Dropdown.Item onClick={() => handleLanguageChange('es')}>es</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <h1 className="dashboard-title">
        {userName ? `${getGreeting()} ${userName}` : getGreeting()}, Bem-Vindo!
      </h1>
      {error && <p className="error-message">Error: {error}</p>}

      {/* Adição dos botões em formato de card */}
      <div className="row mt-4">
        <div className="col-md-3">
          <a href="/comentariosinv" className="card shadow-sm text-decoration-none">
            <div className="card-body text-center">
              <h5 className="card-title">Validar Comentários</h5>
              <p className="card-text">Eventos</p>
            </div>
          </a>
        </div>
        <div className="col-md-3">
          <a href="/comentariosinvlocal" className="card shadow-sm text-decoration-none">
            <div className="card-body text-center">
              <h5 className="card-title">Validar Comentários</h5>
              <p className="card-text">Locais</p>
            </div>
          </a>
        </div>
        <div className="col-md-3">
          <a href="/reportLocais" className="card shadow-sm text-decoration-none">
            <div className="card-body text-center">
              <h5 className="card-title">Validar Comentários</h5>
              <p className="card-text">Foruns</p>
            </div>
          </a>
        </div>
        <div className="col-md-3">
          <a href="/reportEventos" className="card shadow-sm text-decoration-none">
            <div className="card-body text-center">
              <h5 className="card-title">Reports em Comentários</h5>
              <p className="card-text">Eventos</p>
            </div>
          </a>
        </div>
        <div className="col-md-3">
          <a href="/reportLocais" className="card shadow-sm text-decoration-none">
            <div className="card-body text-center">
              <h5 className="card-title">Reports em Comentários</h5>
              <p className="card-text">Locais</p>
            </div>
          </a>
        </div>
        <div className="col-md-3">
          <a href="/reportLocais" className="card shadow-sm text-decoration-none">
            <div className="card-body text-center">
              <h5 className="card-title">Reports em Comentários</h5>
              <p className="card-text">Foruns</p>
            </div>
          </a>
        </div>
      </div>

      <div className="chart-container mt-5">
        {localsData.length > 1 && (
          <div className="chart-item">
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="400px"
              data={localsData}
              options={localsOptions}
            />
          </div>
        )}
        {eventData.length > 1 && (
          <div className="chart-item">
            <Chart
              chartType="BarChart"
              width="100%"
              height="400px"
              data={eventData}
              options={eventOptions}
            />
          </div>
        )}
        {commentData.length > 1 && ( // Condicional para exibir o gráfico de comentários
          <div className="chart-item">
            <Chart
              chartType="BarChart"
              width="100%"
              height="400px"
              data={commentData}
              options={commentOptions}
            />
          </div>
        )}
        {commentLocalData.length > 1 && ( // Condicional para exibir o gráfico de comentários
          <div className="chart-item">
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="400px"
              data={commentLocalData}
              options={pieOptionsLocal}
            />
          </div>
        )}
        {userData.length > 1 && (
          <>
            <div className="chart-item">
              <Chart
                chartType="PieChart"
                width="100%"
                height="400px"
                data={userData}
                options={pieOptions}
              />
            </div>
            <div className="chart-item">
              <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={startDateData}
                options={startDateOptions}
              />
            </div>
            <div className="chart-item">
              <Chart
                chartType="BarChart"
                width="100%"
                height="400px"
                data={userData}
                options={barOptions}
              />
            </div>
            <div className="chart-item">
              <Chart
                chartType="AreaChart"
                width="100%"
                height="400px"
                data={userData}
                options={areaOptions}
              />
            </div>
            <div className="chart-item">
              <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={userData}
                options={lineOptions}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

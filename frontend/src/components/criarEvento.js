import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '@fortawesome/fontawesome-free/css/all.css';
import axios from 'axios';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const MySwal = withReactContent(Swal);

const CriarEvento = () => {
  const [utilizadores, setUtilizadores] = useState([]);
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [showNewSubArea, setShowNewSubArea] = useState(false);
  const [formValues, setFormValues] = useState({
    ID_CENTRO: '',
    ID_CRIADOR: '',
    NOME_EVENTO: '',
    TIPO_EVENTO: '',
    DATA_EVENTO: '',
    DISPONIBILIDADE: false,
    LOCALIZACAO: '',
    ID_AREA: '',
    ID_SUB_AREA: '',
    N_PARTICIPANTES: '',
    ID_APROVADOR: null,
    foto: null,
    comentario: '',
    NEW_SUB_AREA: ''
  });
  const [error, setError] = useState(null);
  const [isFormActive, setIsFormActive] = useState(true); // Novo estado para armazenar o status do formulário

  const navigate = useNavigate();
  const mapRef = useRef(null); // Referência para o mapa

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [utilizadoresResponse, areasResponse, formStatusResponse] = await Promise.all([
          axios.get('http://localhost:3000/user/list'),
          axios.get('http://localhost:3000/area/list'),
          axios.get('http://localhost:3000/formularios/status/2') // Substitua pela rota correta
        ]);
        setUtilizadores(utilizadoresResponse.data);
        setAreas(areasResponse.data);
        setIsFormActive(formStatusResponse.data.ATIVO); // Verifique se o formulário está ativo ou não
      } catch (error) {
        console.error('Erro ao procurar dados:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao carregar dados.'
        });
      }
    };
    fetchData();
    if (!mapRef.current) {
      const defaultIcon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIconRetina,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      mapRef.current = L.map('map').setView([40.6574, -7.9140], 14); //coordenadas do rossio de viseu

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      const marker = L.marker([40.6574, -7.9140], { icon: defaultIcon, draggable: true }).addTo(mapRef.current);

      mapRef.current.on('click', (event) => {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          LOCALIZACAO: `${lat}, ${lng}`
        }));
      });

      marker.on('dragend', (event) => {
        const latLng = event.target.getLatLng();
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          LOCALIZACAO: `${latLng.lat}, ${latLng.lng}`
        }));
      });
    }
  }, []);
  

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    axios.get('http://localhost:3000/user/profile', {
      headers: {
        'x-auth-token': token
      }
    })
      .then(response => {
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          ID_CRIADOR: response.data.ID_FUNCIONARIO,
          ID_CENTRO: response.data.ID_CENTRO
        }));
      })
      .catch(error => {
        setError('Erro ao obter os dados do utilizador.');
        console.error('Erro ao obter os dados do utilizador:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao obter os dados do utilizador.'
        });
      });
  }, []);

  const fetchSubAreas = async (areaId) => {
    try {
      const response = await axios.get(`http://localhost:3000/subarea/list/${areaId}`);
      setSubAreas(response.data);
    } catch (error) {
      console.error('Nao existem subareas para a area selecionada:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Nao existem subareas para a area selecionada'
      });
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });

    if (name === 'ID_AREA') {
      fetchSubAreas(value);
      setFormValues(prevFormValues => ({
        ...prevFormValues,
        ID_SUB_AREA: '',
        NEW_SUB_AREA: ''
      }));
      setShowNewSubArea(false);
    }
  };

  const dataAtual = new Date().toISOString().split('T')[0];

  const handleFileChange = (e) => {
    setFormValues({
      ...formValues,
      foto: e.target.files[0]
    });
  };

  const checkAndCreateSubArea = async () => {
    try {
      if (showNewSubArea && formValues.NEW_SUB_AREA) {
        const response = await axios.post('http://localhost:3000/subarea/check', {
          subArea: formValues.NEW_SUB_AREA,
          ID_AREA: formValues.ID_AREA
        });
        return response.data.subAreaId;
      }
      return formValues.ID_SUB_AREA;
    } catch (error) {
      console.error('Erro ao criar/verificar subárea:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao criar/verificar subárea.'
      });
      throw error;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const subAreaId = await checkAndCreateSubArea();
      const formData = new FormData();
      
      for (const key in formValues) {
        if (key !== 'ID_AREA' && key !== 'ID_SUB_AREA') {
          formData.append(key, formValues[key]);
        }
      }
      
      formData.append('ID_AREA', formValues.ID_AREA);
      
      // Ajustar o valor de ID_SUB_AREA para null se estiver vazio
      formData.append('ID_SUB_AREA', subAreaId ? subAreaId : '');
  
      const eventoResponse = await axios.post('http://localhost:3000/evento/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      MySwal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: `Evento criado com sucesso! ID: ${eventoResponse.data.id}`
      });
  
      navigate('/evento/manage');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao criar evento.'
      });
    }
  };
  

  return (
    <div className="container mt-4">
      <h1>Criar Novo Evento</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="NOME_EVENTO" className="form-label">Nome do Evento</label>
          <input
            type="text"
            id="NOME_EVENTO"
            name="NOME_EVENTO"
            className="form-control"
            value={formValues.NOME_EVENTO}
            onChange={handleInputChange}
            required
            disabled={!isFormActive} // Desabilita se o formulário estiver inativo
          />
        </div>

        <div className="mb-3">
          <label htmlFor="TIPO_EVENTO" className="form-label">Tipo de Evento</label>
          <input
            type="text"
            id="TIPO_EVENTO"
            name="TIPO_EVENTO"
            className="form-control"
            value={formValues.TIPO_EVENTO}
            onChange={handleInputChange}
            required
            disabled={!isFormActive} // Desabilita se o formulário estiver inativo
          />
        </div>

        <div className="mb-3">
          <label htmlFor="DATA_EVENTO" className="form-label">Data do Evento</label>
          <input
            type="date"
            id="DATA_EVENTO"
            name="DATA_EVENTO"
            className="form-control"
            value={formValues.DATA_EVENTO}
            onChange={handleInputChange}
            min={dataAtual}
            required
            disabled={!isFormActive} // Desabilita se o formulário estiver inativo
          />
        </div>

        <div className="mb-3">
          <label htmlFor="LOCALIZACAO" className="form-label">Localização</label>
          <div id="map" style={{ width: "100%", height: "400px" }}></div>
        </div>

        <div className="mb-3">
          <label htmlFor="ID_AREA" className="form-label">Área</label>
          <select
            id="ID_AREA"
            name="ID_AREA"
            className="form-control"
            value={formValues.ID_AREA}
            onChange={handleInputChange}
            required
            disabled={!isFormActive} // Desabilita se o formulário estiver inativo
          >
            <option value="">Selecione uma área</option>
            {areas.map((area) => (
              <option key={area.ID_AREA} value={area.ID_AREA}>
                {area.NOME_AREA}
              </option>
            ))}
          </select>
        </div>

        {subAreas.length > 0 && !showNewSubArea && (
          <div className="mb-3">
            <label htmlFor="ID_SUB_AREA" className="form-label">Subárea</label>
            <select
              id="ID_SUB_AREA"
              name="ID_SUB_AREA"
              className="form-control"
              value={formValues.ID_SUB_AREA}
              onChange={handleInputChange}
              disabled={!isFormActive} // Desabilita se o formulário estiver inativo
            >
              <option value="">Selecione uma subárea</option>
              {subAreas.map((subArea) => (
                <option key={subArea.ID_SUB_AREA} value={subArea.ID_SUB_AREA}>
                  {subArea.NOME_SUBAREA}
                </option>
              ))}
            </select>
          </div>
        )}

        {!showNewSubArea && (
          <button
            type="button"
            className="btn btn-secondary mb-3"
            onClick={() => setShowNewSubArea(true)}
            disabled={!isFormActive} // Desabilita se o formulário estiver inativo
          >
            Criar Nova Subárea
          </button>
        )}

        {showNewSubArea && (
          <div className="mb-3">
            <label htmlFor="NEW_SUB_AREA" className="form-label">Nova Subárea</label>
            <input
              type="text"
              id="NEW_SUB_AREA"
              name="NEW_SUB_AREA"
              className="form-control"
              value={formValues.NEW_SUB_AREA}
              onChange={handleInputChange}
              required={showNewSubArea}
              disabled={!isFormActive} // Desabilita se o formulário estiver inativo
            />
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="N_PARTICIPANTES" className="form-label">Número de Participantes</label>
          <input
            type="number"
            id="N_PARTICIPANTES"
            name="N_PARTICIPANTES"
            className="form-control"
            value={formValues.N_PARTICIPANTES}
            onChange={handleInputChange}
            disabled={!isFormActive} // Desabilita se o formulário estiver inativo
          />
        </div>

        <div className="mb-3">
          <label htmlFor="foto" className="form-label">Foto</label>
          <input
            type="file"
            id="foto"
            name="foto"
            className="form-control"
            onChange={handleFileChange}
            disabled={!isFormActive} // Desabilita se o formulário estiver inativo
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isFormActive} // Desabilita se o formulário estiver inativo
        >
          Criar Evento
        </button>

      </form>
    </div>
  );
};

export default CriarEvento;
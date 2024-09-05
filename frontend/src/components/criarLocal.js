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

const AddLocal = () => {
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [formValues, setFormValues] = useState({
    ID_AREA: '',
    ID_SUB_AREA: '',
    DESIGNACAO_LOCAL: '',
    LOCALIZACAO: '',
    REVIEW: '',
    foto: null,
    NOVA_SUB_AREA: '',
    PRECO: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isFormActive, setIsFormActive] = useState(true);

  const mapRef = useRef(null); // Referência para o mapa

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get('https://pintfinal-backend.onrender.com/area/list');
        setAreas(response.data);
        const formStatusResponse = await axios.get('https://pintfinal-backend.onrender.com/formularios/status/3');
        setIsFormActive(formStatusResponse.data.ATIVO);
      } catch (error) {
        console.error('Erro ao carregar áreas:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao carregar áreas.'
        });
      }
    };

    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('Token de autenticação não encontrado');

        const response = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
          headers: {
            'x-auth-token': token
          }
        });

        setFormValues(prevFormValues => ({
          ...prevFormValues,
          ID_CRIADOR: response.data.ID_FUNCIONARIO,
        }));
      } catch (error) {
        setError('Erro ao obter os dados do utilizador.');
        console.error('Erro ao obter os dados do utilizador:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao obter os dados do utilizador.'
        });
      }
    };

    fetchAreas();
    fetchUserData();

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

      mapRef.current = L.map('map').setView([40.6574, -7.9140], 14); // coordenadas do Rossio de Viseu

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
    const fetchSubAreas = async () => {
      if (formValues.ID_AREA) {
        try {
          const response = await axios.get(`https://pintfinal-backend.onrender.com/subarea/list/${formValues.ID_AREA}`);
          setSubAreas(response.data);
        } catch (error) {
          console.error('Nao existem subareas para a area selecionada:', error);
          setSubAreas([]); // Limpar subáreas se houver erro
          MySwal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Nao existem subareas para a area selecionada.'
          });
        }
      } else {
        setSubAreas([]); // Limpar subáreas se nenhuma área estiver selecionada
      }
    };

    fetchSubAreas();
  }, [formValues.ID_AREA]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Se a área mudar, resetar subárea e subárea nova
    if (name === "ID_AREA") {
      setFormValues({
        ...formValues,
        [name]: value,
        ID_SUB_AREA: "", // Resetar o campo de subárea
        NOVA_SUB_AREA: "" // Opcional: resetar o campo de nova subárea também
      });
      setSubAreas([]); // Limpa subáreas ao mudar a área
    } else {
      setFormValues({
        ...formValues,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleFileChange = (e) => {
    setFormValues({
      ...formValues,
      foto: e.target.files[0]
    });
  };

  const checkAndCreateSubArea = async () => {
    if (!formValues.NOVA_SUB_AREA) {
      return formValues.ID_SUB_AREA || null; // Retorna a subárea selecionada ou null
    }

    try {
      const response = await axios.post('https://pintfinal-backend.onrender.com/subarea/check', {
        subArea: formValues.NOVA_SUB_AREA,
        ID_AREA: formValues.ID_AREA
      });
      const subAreaId = response.data.subAreaId;
      console.log("ID da subárea retornado:", subAreaId);
      return subAreaId;
    } catch (error) {
      console.error('Erro ao verificar/criar subárea:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao verificar/criar subárea.'
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
      formData.append('ID_SUB_AREA', subAreaId ? subAreaId : '');

      const response = await axios.post('https://pintfinal-backend.onrender.com/locais/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdLocalId = response.data.ID_LOCAL;

      if (formValues.REVIEW) {
        await axios.post('https://pintfinal-backend.onrender.com/review/create', {
          ID_CRIADOR: formValues.ID_CRIADOR,
          REVIEW: formValues.REVIEW,
          ID_LOCAL: createdLocalId,
        });
      }

      MySwal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Estabelecimento criado com sucesso!',
      });

      navigate('/locais/list');
    } catch (error) {
      console.error('Erro ao adicionar o Estabelecimento:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao adicionar o Estabelecimento.',
      });
    }
  };

  return (
    <div className="container mt-4">
      <h1>Adicionar Novo Estabelecimento</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="ID_AREA" className="form-label">Área:</label>
          <select
            id="ID_AREA"
            name="ID_AREA"
            value={formValues.ID_AREA}
            onChange={handleInputChange}
            className="form-control"
            disabled={!isFormActive}
          >
            <option value="">Selecione uma área</option>
            {areas.map(area => (
              <option key={area.ID_AREA} value={area.ID_AREA}>
                {area.NOME_AREA}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="ID_SUB_AREA" className="form-label">Subárea:</label>
          <select
            id="ID_SUB_AREA"
            name="ID_SUB_AREA"
            value={formValues.ID_SUB_AREA}
            onChange={handleInputChange}
            className="form-control"
            disabled={!isFormActive}
          >
            <option value="">Selecione uma subárea existente ou crie uma nova</option>
            {subAreas.map(subArea => (
              <option key={subArea.ID_SUB_AREA} value={subArea.ID_SUB_AREA}>
                {subArea.NOME_SUBAREA}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="NOVA_SUB_AREA" className="form-label">Nova Subárea</label>
          <input
            type="text"
            id="NOVA_SUB_AREA"
            name="NOVA_SUB_AREA"
            className="form-control"
            value={formValues.NOVA_SUB_AREA}
            onChange={handleInputChange}
            placeholder="Digite para criar uma nova subárea"
            disabled={!isFormActive}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="DESIGNACAO_LOCAL" className="form-label">Designação do Estabelecimento</label>
          <input
            type="text"
            id="DESIGNACAO_LOCAL"
            name="DESIGNACAO_LOCAL"
            className="form-control"
            value={formValues.DESIGNACAO_LOCAL}
            onChange={handleInputChange}
            required
            disabled={!isFormActive}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="PRECO" className="form-label">Preço</label>
          <input
            type="text"
            id="PRECO"
            name="PRECO"
            className="form-control"
            value={formValues.PRECO}
            onChange={handleInputChange}
            required
            disabled={!isFormActive}
            placeholder="Caso não tenha preço coloque 0"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="LOCALIZACAO" className="form-label">Localização</label>
          <div id="map" style={{ width: "100%", height: "400px" }}></div>
        </div>

        <div className="form-group p-2">
          <label htmlFor="REVIEW" className="form-label">Minha Review</label>
          <select
            className="form-control"
            id="REVIEW"
            name="REVIEW"
            value={formValues.REVIEW}
            onChange={handleInputChange}
          >
            <option value="">Selecione uma avaliação</option>
            {[...Array(10).keys()].map((value) => {
              const ratingValue = (value + 1) * 0.5;
              return (
                <option key={ratingValue} value={ratingValue}>
                  {ratingValue}
                </option>
              );
            })}
            ))
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="foto" className="form-label">Foto</label>
          <input
            type="file"
            id="foto"
            name="foto"
            className="form-control"
            onChange={handleFileChange}
            disabled={!isFormActive}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={!isFormActive} >Adicionar Estabelecimento</button>
      </form>
    </div>
  );
};

export default AddLocal;
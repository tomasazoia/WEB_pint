import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const MySwal = withReactContent(Swal);

const EditarLocal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null); // Referência para o mapa

  const [local, setLocal] = useState({
    ID_AREA: '',
    ID_SUB_AREA: '',  // Novo campo
    DESIGNACAO_LOCAL: '',
    LOCALIZACAO: '',
    REVIEW: '',
    PRECO: '',         // Novo campo
    foto: null,
  });

  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]); // Novo estado para armazenar sub-áreas
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocal = async () => {
      try {
        const response = await axios.get(`https://pint-backend-5gz8.onrender.com/locais/get/${id}`);
        setLocal(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados do local:', error);
        setError('Erro ao carregar dados do local');
      }
    };

    const fetchAreas = async () => {
      try {
        const response = await axios.get('https://pint-backend-5gz8.onrender.com/area/list');
        setAreas(response.data);
      } catch (error) {
        console.error('Erro ao carregar áreas:', error);
        setError('Erro ao carregar áreas');
      }
    };

    fetchLocal();
    fetchAreas();

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
        setLocal(prevLocal => ({
          ...prevLocal,
          LOCALIZACAO: `${lat}, ${lng}`
        }));
      });

      marker.on('dragend', (event) => {
        const latLng = event.target.getLatLng();
        setLocal(prevLocal => ({
          ...prevLocal,
          LOCALIZACAO: `${latLng.lat}, ${latLng.lng}`
        }));
      });
    }
  }, [id]);

  useEffect(() => {
    const fetchSubAreas = async () => {
      if (local.ID_AREA) {
        try {
          const response = await axios.get(`https://pint-backend-5gz8.onrender.com/subarea/list/${local.ID_AREA}`);
          if (response.data.length > 0) {
            setSubAreas(response.data);
          } else {
            setSubAreas([]);
            MySwal.fire({
              icon: 'info',
              title: 'Sem Subáreas',
              text: 'Não existem subáreas para a área selecionada.'
            });
          }
        } catch (error) {
          console.error('Erro ao carregar subáreas:', error);
          setSubAreas([]); // Resetar as subáreas em caso de erro
          MySwal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Ocorreu um erro ao carregar as subáreas.'
          });
        }
      } else {
        setSubAreas([]); // Resetar as subáreas se nenhuma área estiver selecionada
      }
    };

    fetchSubAreas();
  }, [local.ID_AREA]); // Add local.ID_AREA as a dependency to re-fetch sub-areas when it changes

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reseta o campo ID_SUB_AREA se a área mudar
    if (name === 'ID_AREA') {
      setLocal((prevLocal) => ({
        ...prevLocal,
        ID_AREA: value,
        ID_SUB_AREA: null, // Sempre define a sub-área como null quando a área é alterada
      }));
    } else {
      setLocal((prevLocal) => ({
        ...prevLocal,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    setLocal((prevLocal) => ({
      ...prevLocal,
      foto: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data being sent:', local);

    const formData = new FormData();
    formData.append('ID_AREA', local.ID_AREA);
    // Verifica se a subárea foi selecionada, caso contrário envia null
    if (local.ID_SUB_AREA) {
      formData.append('ID_SUB_AREA', local.ID_SUB_AREA);
    } else {
      formData.append('ID_SUB_AREA', ''); // Use '' ou nada para evitar enviar "null" como string
    }
    formData.append('DESIGNACAO_LOCAL', local.DESIGNACAO_LOCAL);
    formData.append('LOCALIZACAO', local.LOCALIZACAO);
    formData.append('REVIEW', local.REVIEW);
    formData.append('PRECO', local.PRECO);
    if (local.foto) {
      formData.append('foto', local.foto);
    }

    try {
      await axios.put(`https://pint-backend-5gz8.onrender.com/locais/edit/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      MySwal.fire({
        icon: 'success',
        title: 'Atualizado!',
        text: 'O local foi atualizado com sucesso.',
      }).then(() => {
        navigate('/locais/list');
      });
    } catch (error) {
      console.error('Erro ao atualizar local:', error);
      setError('Erro ao atualizar o local');
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao atualizar o local.',
      });
    }
  };

  return (
    <div className="container mt-4 p-2">
      <h2>Editar Estabelecimento</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group p-2">
          <label>Área:</label>
          <select
            className="form-control"
            name="ID_AREA"
            value={local.ID_AREA}
            onChange={handleChange}
          >
            <option value="">Selecione uma área</option>
            {areas.map(area => (
              <option key={area.ID_AREA} value={area.ID_AREA}>
                {area.NOME_AREA}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group p-2">
          <label>Sub-Área:</label>
          <select
            className="form-control"
            name="ID_SUB_AREA"
            value={local.ID_SUB_AREA ?? ''} // Mostra '' se for null
            onChange={handleChange}
            disabled={!local.ID_AREA} // Desabilita se nenhuma área estiver selecionada
          >
            <option value="">Selecione uma sub-área</option>
            {subAreas.map((subArea) => (
              <option key={subArea.ID_SUB_AREA} value={subArea.ID_SUB_AREA}>
                {subArea.NOME_SUBAREA}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group p-2">
          <label>Designação Local:</label>
          <input
            type="text"
            className="form-control"
            name="DESIGNACAO_LOCAL"
            value={local.DESIGNACAO_LOCAL}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="LOCALIZACAO" className="form-label">Localização</label>
          <div id="map" style={{ width: "100%", height: "400px" }} type="text"
            className="form-control"
            name="LOCALIZACAO"
            value={local.LOCALIZACAO}
            onChange={handleChange}></div>
        </div>
        <div className="form-group p-2">
          <label>Minha Review:</label>
          <select
            className="form-control"
            name="REVIEW"
            value={local.REVIEW}
            onChange={handleChange}
          >
            <option value="">Selecione uma avaliação</option>
            {[...Array(11).keys()].map((value) => (
              <option key={value / 2} value={value / 2}>
                {value / 2}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group p-2">
          <label>Preço:</label> {/* Novo campo */}
          <input
            type="number"
            className="form-control"
            name="PRECO"
            value={local.PRECO}
            onChange={handleChange}
          />
        </div>
        <div className="form-group p-2">
          <label>Foto:</label>
          <input
            type="file"
            className="form-control"
            name="foto"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Atualizar Estabelecimento</button>
      </form>
    </div>
  );
};

export default EditarLocal;
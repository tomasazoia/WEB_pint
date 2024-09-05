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

const EditarEvento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const mapRef = useRef(null); // Referência para o mapa

    const [evento, setEvento] = useState({
        NOME_EVENTO: '',
        TIPO_EVENTO: '',
        DATA_EVENTO: '',
        LOCALIZACAO: '',
        N_PARTICIPANTES: '',
        DISPONIBILIDADE: '',
        ID_CENTRO: '',
        ID_CRIADOR: '',
        ID_AREA: '',
        ID_SUB_AREA: '',
        foto: null,
    });

    const [areas, setAreas] = useState([]);
    const [subAreas, setSubAreas] = useState([]);
    const [centros, setCentros] = useState([]);
    const [criadores, setCriadores] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/evento/get/${id}`);
                setEvento(response.data);
            } catch (error) {
                console.error('Erro ao carregar dados do evento:', error);
                setError('Erro ao carregar dados do evento');
            }
        };

        const fetchAreas = async () => {
            try {
                const response = await axios.get('http://localhost:3000/area/list');
                setAreas(response.data);
            } catch (error) {
                console.error('Erro ao carregar áreas:', error);
                setError('Erro ao carregar áreas');
            }
        };

        const fetchCentros = async () => {
            try {
                const response = await axios.get('http://localhost:3000/centro/list');
                setCentros(response.data);
            } catch (error) {
                console.error('Erro ao carregar centros:', error);
                setError('Erro ao carregar centros');
            }
        };

        fetchEvento();
        fetchAreas();
        fetchCentros();

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
                setEvento(prevEvento => ({
                    ...prevEvento,
                    LOCALIZACAO: `${lat}, ${lng}`
                }));
            });

            marker.on('dragend', (event) => {
                const latLng = event.target.getLatLng();
                setEvento(prevEvento => ({
                    ...prevEvento,
                    LOCALIZACAO: `${latLng.lat}, ${latLng.lng}`
                }));
            });
        }
    }, [id]);

    useEffect(() => {
        const fetchSubAreas = async () => {
            if (evento.ID_AREA) {
                try {
                    const response = await axios.get(`http://localhost:3000/subarea/list/${evento.ID_AREA}`);
                    setSubAreas(response.data);
                } catch (error) {
                    console.error('Erro ao carregar subáreas:', error);
                    setSubAreas([]);
                    MySwal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Erro ao carregar subáreas para a área selecionada.',
                    });
                }
            } else {
                setSubAreas([]);
            }
        };

        fetchSubAreas();
    }, [evento.ID_AREA]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Reseta o campo ID_SUB_AREA se a área mudar
        if (name === 'ID_AREA') {
            setEvento((prevEvento) => ({
                ...prevEvento,
                ID_AREA: value,
                ID_SUB_AREA: null, // Sempre define a sub-área como null quando a área é alterada
            }));
        } else {
            setEvento((prevEvento) => ({
                ...prevEvento,
                [name]: value,
            }));
        }
    };

    const handleFileChange = (e) => {
        setEvento((prevEvento) => ({
            ...prevEvento,
            foto: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Garante que ID_SUB_AREA é null se não for selecionada
        const subAreaValue = evento.ID_SUB_AREA ? evento.ID_SUB_AREA : null;

        const formData = new FormData();
        formData.append('NOME_EVENTO', evento.NOME_EVENTO);
        formData.append('TIPO_EVENTO', evento.TIPO_EVENTO);
        formData.append('DATA_EVENTO', evento.DATA_EVENTO);
        formData.append('LOCALIZACAO', evento.LOCALIZACAO);
        formData.append('N_PARTICIPANTES', evento.N_PARTICIPANTES);
        formData.append('DISPONIBILIDADE', evento.DISPONIBILIDADE);
        formData.append('ID_CENTRO', evento.ID_CENTRO);
        formData.append('ID_AREA', evento.ID_AREA);
        // Verifica se a subárea foi selecionada, caso contrário envia null
        if (evento.ID_SUB_AREA) {
            formData.append('ID_SUB_AREA', evento.ID_SUB_AREA);
        } else {
            formData.append('ID_SUB_AREA', ''); // Use '' ou nada para evitar enviar "null" como string
        }
        if (evento.foto) {
            formData.append('foto', evento.foto);
        }

        try {
            await axios.put(`http://localhost:3000/evento/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            MySwal.fire({
                icon: 'success',
                title: 'Atualizado!',
                text: 'O evento foi atualizado com sucesso.',
            }).then(() => {
                navigate('/evento/list');
            });
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            setError('Erro ao atualizar o evento');
            MySwal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Ocorreu um erro ao atualizar o evento.',
            });
        }
    };

    return (
        <div className="container mt-4 p-2">
            <h2>Editar Evento</h2>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-group p-2">
                    <label>Nome do Evento:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="NOME_EVENTO"
                        value={evento.NOME_EVENTO}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group p-2">
                    <label>Tipo de Evento:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="TIPO_EVENTO"
                        value={evento.TIPO_EVENTO}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group p-2">
                    <label>Data do Evento:</label>
                    <input
                        type="date"
                        className="form-control"
                        name="DATA_EVENTO"
                        value={evento.DATA_EVENTO}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="LOCALIZACAO" className="form-label">Localização</label>
                    <div id="map" style={{ width: "100%", height: "400px" }} type="text"
                        className="form-control"
                        name="LOCALIZACAO"
                        value={evento.LOCALIZACAO}
                        onChange={handleChange}></div>
                </div>
                <div className="form-group p-2">
                    <label>Número de Participantes:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="N_PARTICIPANTES"
                        value={evento.N_PARTICIPANTES}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group p-2">
                    <label>Disponibilidade:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="DISPONIBILIDADE"
                        value={evento.DISPONIBILIDADE}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group p-2">
                    <label>Centro:</label>
                    <select
                        className="form-control"
                        name="ID_CENTRO"
                        value={evento.ID_CENTRO}
                        onChange={handleChange}
                    >
                        <option value="">Selecione um centro</option>
                        {centros.map(centro => (
                            <option key={centro.ID_CENTRO} value={centro.ID_CENTRO}>
                                {centro.NOME_CENTRO}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group p-2">
                    <label>Área:</label>
                    <select
                        className="form-control"
                        name="ID_AREA"
                        value={evento.ID_AREA}
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
                        value={evento.ID_SUB_AREA ?? ''} // Mostra '' se for null
                        onChange={handleChange}
                        disabled={!evento.ID_AREA} // Desabilita se nenhuma área estiver selecionada
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
                    <label>Foto:</label>
                    <input
                        type="file"
                        className="form-control"
                        name="foto"
                        onChange={handleFileChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-3">Atualizar Evento</button>
            </form>
        </div>
    );
};

export default EditarEvento;

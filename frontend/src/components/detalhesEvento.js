import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // Importa Link para o redirecionamento
import '../styles/styles.css';
import Swal from 'sweetalert2';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, LinkedinIcon, WhatsappIcon } from 'react-share';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


const DetalhesEvento = () => {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [erro, setErro] = useState('');
    const [novoComentario, setNovoComentario] = useState('');
    const [comentarios, setComentarios] = useState([]);
    const [nParticipantes, setNParticipantes] = useState(0);
    const [participantes, setParticipantes] = useState([]);
    const [participando, setParticipando] = useState(false);
    const userRef = useRef(null);
    const eventoRef = useRef(null);
    const [map, setMap] = useState(null);
    const mapRef = useRef(null);
    const shareUrl = window.location.href; // URL do evento
    const title = evento ? evento.NOME_EVENTO : 'Evento'; // Título do evento
    const teamsShareUrl = `https://teams.microsoft.com/share?href=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
    useEffect(() => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            setErro('Token de autenticação não encontrado.');
            return;
        }

        const fetchData = async () => {
            try {
                const userResponse = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
                    headers: { 'x-auth-token': token }
                });
                userRef.current = userResponse.data;

                const eventoResponse = await axios.get(`https://pintfinal-backend.onrender.com/evento/get/${id}`);
                eventoRef.current = eventoResponse.data;
                setEvento(eventoResponse.data);
                setNParticipantes(eventoResponse.data.N_PARTICIPANTES);
                const participantesResponse = await axios.get(`https://pintfinal-backend.onrender.com/participantesevento/eventos/${id}/participantes`);
                setParticipantes(participantesResponse.data);
                const isParticipating = participantesResponse.data.some(participante => participante.User.ID_FUNCIONARIO === userRef.current.ID_FUNCIONARIO);
                setParticipando(isParticipating);
                const comentariosResponse = await axios.get(`https://pintfinal-backend.onrender.com/comentarios_evento/listevento/${id}`);
                setComentarios(comentariosResponse.data);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setErro('Erro ao carregar dados.');
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (evento && mapRef.current && !map) {
            const defaultIcon = L.icon({
                iconUrl: markerIcon,
                iconRetinaUrl: markerIconRetina,
                shadowUrl: markerShadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const [lat, lng] = evento.LOCALIZACAO.split(',').map(Number);

            const mapInstance = L.map(mapRef.current).setView([lat, lng], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance);

            L.marker([lat, lng], { icon: defaultIcon }).addTo(mapInstance)
                .bindPopup(evento.NOME_EVENTO)
                .openPopup();

            setMap(mapInstance);
        }
    }, [evento, map]);

    const handleAddComentario = async () => {
        if (!novoComentario.trim() || !userRef.current) {
            return;
        }

        try {
            const comentarioData = {
                ID_FUNCIONARIO: userRef.current.ID_FUNCIONARIO,
                DESCRICAO: novoComentario,
                ID_EVENTO: evento.ID_EVENTO,
            };

            await axios.post('https://pintfinal-backend.onrender.com/comentarios_evento/create', comentarioData);

            setNovoComentario('');

            Swal.fire({
                title: 'Comentário enviado!',
                text: 'O seu comentário aguarda confirmação.',
                icon: 'success',
                confirmButtonText: 'OK',
            });

            const comentariosResponse = await axios.get(`https://pintfinal-backend.onrender.com/comentarios_evento/listevento/${id}`);
            setComentarios(comentariosResponse.data);
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            setErro('Erro ao adicionar comentário.');
        }
    };


    const handleDeleteComentario = async (idComentario) => {
        try {
            await axios.put(`https://pintfinal-backend.onrender.com/comentarios_evento/invalidar/${idComentario}`);

            setComentarios(prevComentarios => prevComentarios.filter(comentario => comentario.ID_COMENTARIO !== idComentario));
        } catch (error) {
            console.error('Erro ao apagar comentário:', error);
            setErro('Erro ao apagar comentário.');
        }
    };


    const handleParticiparEvento = async () => {
        if (!userRef.current) {
            setErro('Utilizador não autenticado.');
            return;
        }

        try {
            const participanteData = {
                ID_FUNCIONARIO: userRef.current.ID_FUNCIONARIO,
                ID_EVENTO: evento.ID_EVENTO,
            };

            await axios.post('https://pintfinal-backend.onrender.com/participantesevento/participantes', participanteData);

            setParticipando(true);
            setNParticipantes(prev => prev - 1);
            setParticipantes(prev => [...prev, { User: userRef.current }]);
        } catch (error) {
            console.error('Erro ao participar do evento:', error);
            setErro('Erro ao participar do evento.');
        }
    };

    const handleDeixarEvento = async () => {
        if (!userRef.current || !evento) {
            setErro('Utilizador não autenticado ou evento não carregado.');
            return;
        }

        try {
            await axios.delete(`https://pintfinal-backend.onrender.com/participantesevento/participantesdelete/${userRef.current.ID_FUNCIONARIO}/${evento.ID_EVENTO}`);

            setParticipando(false);
            setNParticipantes(prev => prev + 1);
            setParticipantes(prev => prev.filter(participante => participante.User.ID_FUNCIONARIO !== userRef.current.ID_FUNCIONARIO));
        } catch (error) {
            console.error('Erro ao deixar o evento:', error);
            setErro('Erro ao deixar o evento.');
        }
    };

    return (
        <div className="container mt-2">
            <h1 className="mb-4 text-center">Detalhes do Evento</h1>
            {evento ? (
                <div className="card shadow-lg p-3 mb-5 bg-white rounded">
                    <div className="row g-0">
                        <div className="col-md-6 d-flex align-items-center justify-content-center">
                            {evento.foto ? (
                                <img
                                    src={`https://pintfinal-backend.onrender.com/${evento.foto}`}
                                    alt={evento.NOME_EVENTO}
                                    className="img-fluid rounded-start img-fixa-evento-detalhes"
                                />
                            ) : (
                                <img
                                    src="/path/to/default/image.jpg"
                                    alt="Imagem padrão"
                                    className="img-fluid rounded-start"
                                    style={{ maxHeight: '400px', objectFit: 'cover', width: '50%' }}
                                />
                            )}
                        </div>
                        <div className="col-md-6">
                            <div className="card-body">
                                <h2 className="card-title mb-3">{evento.NOME_EVENTO}</h2>
                                {evento.User && (
                                    <p className="card-text"><strong>Criador:</strong> {evento.User.user_name}</p>
                                )}
                                {evento.centro && (
                                    <p className="card-text"><strong>Centro:</strong> {evento.centro.NOME_CENTRO}</p>
                                )}
                                <p className="card-text"><strong>Tipo de Evento:</strong> {evento.TIPO_EVENTO}</p>
                                <p className="card-text">
                                    <strong>Data do Evento: </strong>
                                    {new Date(evento.DATA_EVENTO).toLocaleString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true // Exibe a hora no formato de 12 horas (AM/PM)
                                    })}
                                </p>
                                <p className="card-text"><strong>Área:</strong> {evento.area.NOME_AREA}</p>
                                <p className="card-text">
                                    <strong>Sub-Área:</strong> {evento.sub_area ? evento.sub_area.NOME_SUBAREA : "Sub Área não associada"}
                                </p>
                                <p className="card-text"><strong>Número de Vagas:</strong> {nParticipantes}</p>
                                {participando ? (
                                    <button className="btn btn-danger mt-3" onClick={handleDeixarEvento}>
                                        Deixar de Participar
                                    </button>
                                ) : (
                                    <button className="btn btn-primary mt-3" onClick={handleParticiparEvento}>
                                        Participar no Evento
                                    </button>
                                )}

                                <Link to={`/album/${id}`} className="btn btn-secondary mt-3 ms-2">
                                    Ver Álbum de Fotos
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="map-container mt-4">
                        <div ref={mapRef} style={{ height: '300px', width: '100%' }}></div>
                    </div>
                    <hr style={{ width: '80%', marginLeft: '10%' }}></hr>
                    <h2 className="mt-3 mb-4 text-center">Compartilhar Evento</h2>
                    <div className="d-flex justify-content-center mb-4">
                        <FacebookShareButton url={shareUrl} quote={title} className="me-3">
                            <FacebookIcon size={40} round />
                        </FacebookShareButton>
                        <TwitterShareButton url={shareUrl} title={title} className="me-3">
                            <TwitterIcon size={40} round />
                        </TwitterShareButton>
                        <LinkedinShareButton url={shareUrl} title={title} className="me-3">
                            <LinkedinIcon size={40} round />
                        </LinkedinShareButton>
                        <WhatsappShareButton url={shareUrl} title={title} separator=":: " className="me-3">
                            <WhatsappIcon size={40} round />
                        </WhatsappShareButton>
                        <a href={teamsShareUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                            <img src="https://img.icons8.com/color/48/000000/microsoft-teams.png" alt="Teams" style={{ width: '30px', height: '30px' }} />
                        </a>
                    </div>
                    <h2 className="mt-5 mb-4 text-center">Participantes</h2>
                    <ul className="list-group">
                        {participantes.map(participante => (
                            <li key={participante.User.ID_FUNCIONARIO} className="list-group-item">
                                {participante.User.user_name} - {participante.User.user_mail}
                            </li>
                        ))}
                    </ul>
                    <hr style={{ width: '80%', marginLeft: '10%' }}></hr>
                    <h1 className="mt-5 mb-4 text-center">Comentários</h1>
                    <div className="comentarios mt-4">
                        {comentarios.length > 0 ? (
                            comentarios.map((comentario) => (
                                <div key={comentario.ID_COMENTARIO} className="card mb-3">
                                    <div className="card-body">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <p className='card-text'>Utilizador: {comentario.User.user_name}</p>
                                                <p className="card-text">{comentario.DESCRICAO}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <p className="card-text text-muted" style={{ fontSize: '0.8em', marginRight: '10px' }}>
                                                    {new Date(comentario.DATA_COMENTARIO).toLocaleDateString()}
                                                </p>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComentario(comentario.ID_COMENTARIO)}>
                                                    Invalidar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">Nenhum comentário encontrado.</p>
                        )}
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={novoComentario}
                                onChange={(e) => setNovoComentario(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleAddComentario}>
                                Comentar
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="alert alert-danger" role="alert">
                    {erro}
                </div>
            )}
        </div>
    );
};

export default DetalhesEvento;
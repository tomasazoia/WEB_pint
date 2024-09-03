import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';

const ListarEventos = () => {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        loadEventos();
    }, []);

    const loadEventos = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) throw new Error('Token de autenticação não encontrado.');

            const userProfileResponse = await axios.get('http://localhost:3000/user/profile', {
                headers: {
                    'x-auth-token': token
                }
            });

            const userId = userProfileResponse.data.ID_FUNCIONARIO;
            if (!userId) throw new Error('Erro ao obter dados do usuário.');

            const response = await axios.get(`http://localhost:3000/evento/listdisp/${userId}`);
            
            const eventosComCidades = await Promise.all(
                response.data.map(async (evento) => {
                    const cidade = await getCityFromCoordinates(evento.LOCALIZACAO);
                    return { ...evento, cidade };
                })
            );

            setEventos(eventosComCidades);
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: error.message || 'Erro ao carregar eventos.',
            });
        }
    };

    const getCityFromCoordinates = async (coordinates) => {
        try {
            const [lat, lon] = coordinates.split(',').map(coord => coord.trim());
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat,
                    lon,
                    format: 'json'
                }
            });
            return response.data.address.city || response.data.address.town || response.data.address.village || 'Desconhecido';
        } catch (error) {
            console.error('Erro ao obter a cidade:', error);
            return 'Desconhecido';
        }
    };

    return (
        <div className="container">
            <h1>Lista de Eventos</h1>
            <Link to="/evento/create" className="btn btn-primary mb-3">
                Criar um Evento
            </Link>
            <div className="row">
                {eventos.map((evento) => (
                    <div className="col-md-3 mt-4" key={evento.ID_EVENTO}>
                        <div className="card mb-4 h-100 d-flex flex-column">
                            <Link to={`/evento/get/${evento.ID_EVENTO}`}>
                                {evento.foto && (
                                    <img
                                        src={`http://localhost:3000/${evento.foto}`}
                                        className="card-img-top img-evento"
                                        alt={evento.NOME_EVENTO}
                                    />
                                )}
                            </Link>

                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title"><strong>Título do evento: </strong>{evento.NOME_EVENTO}</h5>
                                <p className="card-text flex-grow-1"><strong>Tipo de Evento: </strong>{evento.TIPO_EVENTO}</p>
                                <p className="card-text flex-grow-1"><strong>Localização: </strong>{evento.cidade}</p>
                                <p className="card-text flex-grow-1"><strong>Área do evento: </strong>{evento.area.NOME_AREA}</p>
                                <p className="card-text flex-grow-1"><strong>Sub Área do evento: </strong>{evento.sub_area ? evento.sub_area.NOME_SUBAREA : "Sub Área não associada"}</p>
                                <p className="card-text">
                                    <small className="text-muted">
                                        Data: {new Date(evento.DATA_EVENTO).toLocaleDateString()}
                                    </small>
                                </p>
                                <Link to={`/eventos/edit/${evento.ID_EVENTO}`} className="btn btn-warning mt-2" style={{ color: 'white' }}>
                                Editar Evento
                                </Link>
                            </div>
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListarEventos;

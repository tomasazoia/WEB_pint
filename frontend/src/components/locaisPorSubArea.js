import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import '@fortawesome/fontawesome-free/css/all.css';
import Swal from 'sweetalert2';

const LocaisPorSubArea = () => {
    const { subAreaId } = useParams(); // Pega o ID da subárea da URL
    const [locais, setLocais] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLocais = async () => {
            const token = sessionStorage.getItem('token');

            if (!token) {
                setError('Token de autenticação não encontrado.');
                return;
            }

            try {
                // Obter o ID do utilizador autenticado
                const userResponse = await axios.get('https://pint-backend-5gz8.onrender.com/user/profile', {
                    headers: {
                        'x-auth-token': token
                    }
                });
                const userId = userResponse.data.ID_FUNCIONARIO;
                
                const response = await axios.get(`https://pint-backend-5gz8.onrender.com/locais/subarea/${subAreaId}/user/${userId}`);
                setLocais(response.data);
            } catch (error) {
                console.error('Nenhuma recomendacao encontrada:', error);
                setError('Nenhuma recomendacao encontrada.');
            }
        };

        fetchLocais();
    }, [subAreaId]);

    const deleteLocal = async (id) => {
        try {
            await axios.put(`https://pint-backend-5gz8.onrender.com/locais/invalidate/${id}`, {
                headers: {
                    'x-auth-token': sessionStorage.getItem('token')  // Incluir o token na requisição de deleção
                }
            });
            setLocais(locais.filter(local => local.ID_LOCAL !== id));
            Swal.fire({
                icon: 'success',
                title: 'Invalidado!',
                text: 'O local foi Invalidado com sucesso.'
            });
        } catch (error) {
            console.error('Erro ao Invalidar local:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Ocorreu um erro ao Invalidar o local.'
            });
        }
    };

    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Tem a certeza?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, eliminar!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteLocal(id);
            }
        });
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStars = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStars;

        return (
            <>
                {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} color="gold" />)}
                {[...Array(halfStars)].map((_, i) => <FaStarHalfAlt key={`half-${i}`} color="gold" />)}
                {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} color="gold" />)}
            </>
        );
    };

    return (
        <div className="container mt-4">
            <h1>Recomendações da Subárea</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row"> {/* Adiciona a classe row para a grid do Bootstrap */}
                {locais.map((local) => (
                    <div className="col-md-3 mt-4" key={local.ID_LOCAL}> {/* Define col-md-3 para mostrar 4 cards por linha */}
                        <div className="card mb-4 h-100 d-flex flex-column">
                            <Link to={`/locais/get/${local.ID_LOCAL}`}>
                                {local.foto && (
                                    <img
                                        src={`https://pint-backend-5gz8.onrender.com/${local.foto}`}
                                        className="card-img-top img-fixa-locais-lista"
                                        alt={local.DESIGNACAO_LOCAL}
                                    />
                                )}
                            </Link>
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{local.DESIGNACAO_LOCAL}</h5>
                                <p className="card-text flex-grow-1">{local.LOCALIZACAO}</p>
                                {local.REVIEW && (
                                    <p className="card-text">
                                        <small className="text-muted">Avaliação: {renderStars(local.REVIEW)}</small>
                                    </p>
                                )}
                                {local.area && (
                                    <p className="card-text"><strong>Área:</strong> {local.area.NOME_AREA}</p>
                                )}
                                {local.sub_area && (
                                    <p className="card-text"><strong>Sub-Área:</strong> {local.sub_area.NOME_SUBAREA}</p>
                                )}
                                <button
                                    onClick={() => confirmDelete(local.ID_LOCAL)}
                                    className="btn btn-danger mt-auto"
                                    style={{ float: 'right' }}
                                >
                                    Invalidar
                                </button>
                                <Link to={`/locais/edit/${local.ID_LOCAL}`} className="btn btn-warning mt-2" style={{ color: 'white' }}>
                                    Editar Local
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LocaisPorSubArea;

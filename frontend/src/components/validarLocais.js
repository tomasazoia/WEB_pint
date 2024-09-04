import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';


const LocaisNaoValidados = () => {
    const [locais, setLocais] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLocais();
    }, []);

    const fetchLocais = async () => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            setError('Token de autenticação não encontrado.');
            return;
        }

        try {
            const userResponse = await axios.get('https://pint-backend-5gz8.onrender.com/user/profile', {
                headers: {
                    'x-auth-token': token
                }
            });
            const idCentro = userResponse.data.ID_CENTRO;

            if (!idCentro) {
                setError('ID do Centro não encontrado.');
                return;
            }

            const locaisResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/locais/invalid/user/${userResponse.data.ID_FUNCIONARIO}/centro`, {
                headers: {
                    'x-auth-token': token
                }
            });

            // Converter coordenadas para nomes de cidades
            const eventosComCidades = await Promise.all(
                locaisResponse.data.map(async (local) => {
                    const cidade = await getCityFromCoordinates(local.LOCALIZACAO);
                    return { ...local, cidade };
                })
            );

            setLocais(eventosComCidades);
        } catch (error) {
            console.error('Erro ao listar locais não validados:', error);
            setError('Erro ao listar locais não validados.');
        }
    };
    const deleteLocal = async (id) => {
        try {
            await axios.delete(`https://pint-backend-5gz8.onrender.com/locais/delete/${id}`, {
                headers: {
                    'x-auth-token': sessionStorage.getItem('token')  // Incluir o token na requisição de deleção
                }
            });
            setLocais(locais.filter(local => local.ID_LOCAL !== id));
            Swal.fire({
                icon: 'success',
                title: 'Eliminado!',
                text: 'O local foi eliminado com sucesso.'
            });
        } catch (error) {
            console.error('Erro ao eliminar local:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Ocorreu um erro ao eliminar o local.'
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

    const validarLocal = async (localId) => {
        try {
            await axios.put(`https://pint-backend-5gz8.onrender.com/locais/validate/${localId}`);
            alert('Local validado com sucesso!');
            fetchLocais(); 
        } catch (error) {
            alert('Erro ao validar local: ' + (error.response?.data?.message || 'Erro desconhecido.'));
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Estabelecimentos Não Validados</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead className="thead-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Localização</th>
                            <th>Review</th>
                            <th>Preço</th>
                            <th>Area</th>
                            <th>Sub Area</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locais.map(local => (
                            <tr key={local.ID_LOCAL}>
                                <td>{local.ID_LOCAL}</td>
                                <td>{local.DESIGNACAO_LOCAL}</td>
                            <td>{local.cidade}</td>
                                <td>{local.REVIEW}</td>
                                <td>{local.PRECO}</td>
                                <td>{local.area.NOME_AREA}</td>
                                <td>{local.sub_area ? local.sub_area.NOME_SUBAREA : "Sub Área não associada"}</td>
                                <td>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => validarLocal(local.ID_LOCAL)}
                                    >
                                        Validar
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(local.ID_LOCAL)}
                                        className="btn btn-danger mt-auto"
                                        style={{ float: 'right' }}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LocaisNaoValidados;

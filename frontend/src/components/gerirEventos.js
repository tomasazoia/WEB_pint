import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';
import { Modal, Button, Form } from 'react-bootstrap';

const ListarEventosDoCentro = () => {
    const [eventos, setEventos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentEvento, setCurrentEvento] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserIdAndEventos();
    }, []);

    const fetchUserIdAndEventos = async () => {
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

            // Obter eventos do centro ao qual o utilizador pertence
            const eventosResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/evento/user/${userId}/centro`, {
                headers: {
                    'x-auth-token': token
                }
            });
            
            // Converter coordenadas para nomes de cidades
            const eventosComCidades = await Promise.all(
                eventosResponse.data.map(async (evento) => {
                    const cidade = await getCityFromCoordinates(evento.LOCALIZACAO);
                    return { ...evento, cidade };
                })
            );

            setEventos(eventosComCidades);

        } catch (error) {
            setError('Erro ao carregar os dados.');
            console.error('Erro ao carregar os dados:', error);
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

    const handleEdit = (evento) => {
        setCurrentEvento(evento);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentEvento(null);
    };

    const handleSaveChanges = async () => {
        try {
            const formData = new FormData();
            formData.append('NOME_EVENTO', currentEvento.NOME_EVENTO);
            formData.append('TIPO_EVENTO', currentEvento.TIPO_EVENTO);
            formData.append('DATA_EVENTO', currentEvento.DATA_EVENTO);
            formData.append('DISPONIBILIDADE', currentEvento.DISPONIBILIDADE);
            formData.append('LOCALIZACAO', currentEvento.LOCALIZACAO);
            formData.append('N_PARTICIPANTES', currentEvento.N_PARTICIPANTES);
            if (currentEvento.foto) {
                formData.append('foto', currentEvento.foto);
            }

            await axios.put(`https://pint-backend-5gz8.onrender.com/evento/update/${currentEvento.ID_EVENTO}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            fetchUserIdAndEventos();
            handleCloseModal();
            Swal.fire('Sucesso', 'Evento atualizado com sucesso', 'success');
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            Swal.fire('Erro', 'Ocorreu um erro ao atualizar o evento', 'error');
        }
    };

    const confirmDelete = async (id) => {
        try {
            await Swal.fire({
                title: 'Tem certeza?',
                text: 'Esta ação não pode ser desfeita.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await axios.delete(`https://pint-backend-5gz8.onrender.com/evento/delete/${id}`);
                        setEventos(eventos.filter(evento => evento.ID_EVENTO !== id));
                        Swal.fire(
                            'Eliminado!',
                            'O evento foi eliminado com sucesso.',
                            'success'
                        );
                    } catch (error) {
                        if (error.response && error.response.data && error.response.data.message) {
                            Swal.fire(
                                'Erro!',
                                error.response.data.message,
                                'error'
                            );
                        } else {
                            Swal.fire(
                                'Erro!',
                                'Ocorreu um erro ao eliminar o evento.',
                                'error'
                            );
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao eliminar evento:', error);
            Swal.fire(
                'Erro!',
                'Ocorreu um erro ao eliminar o evento.',
                'error'
            );
        }
    };

    const handleFileChange = (e) => {
        setCurrentEvento((prevEvento) => ({
            ...prevEvento,
            foto: e.target.files[0],
        }));
    };

    return (
        <div className="container mt-4">
            <h1>Lista de Eventos do Meu Centro</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Nome do Evento</th>
                        <th>Tipo de Evento</th>
                        <th>Localização</th>
                        <th>Área do Evento</th>
                        <th>Sub Área do Evento</th>
                        <th>Data do Evento</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {eventos.map((evento) => (
                        <tr key={evento.ID_EVENTO}>
                            <td>{evento.NOME_EVENTO}</td>
                            <td>{evento.TIPO_EVENTO}</td>
                            <td>{evento.cidade}</td>
                            <td>{evento.area.NOME_AREA}</td>
                            <td>{evento.sub_area ? evento.sub_area.NOME_SUBAREA : "Sub Área não associada"}</td>
                            <td>{new Date(evento.DATA_EVENTO).toLocaleDateString()}</td>
                            <td>
                                <button
                                    onClick={() => confirmDelete(evento.ID_EVENTO)}
                                    className="btn btn-danger"
                                    style={{ marginLeft: '20%' }}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    style={{ marginLeft: '20%', color: 'white' }}
                                    onClick={() => handleEdit(evento)}
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {currentEvento && (
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Editar Evento</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            {/* Nome do Evento */}
                            <Form.Group className="mb-3">
                                <Form.Label>Nome do Evento</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentEvento.NOME_EVENTO}
                                    onChange={(e) =>
                                        setCurrentEvento({ ...currentEvento, NOME_EVENTO: e.target.value })
                                    }
                                />
                            </Form.Group>
                            {/* Tipo de Evento */}
                            <Form.Group className="mb-3">
                                <Form.Label>Tipo de Evento</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentEvento.TIPO_EVENTO}
                                    onChange={(e) =>
                                        setCurrentEvento({ ...currentEvento, TIPO_EVENTO: e.target.value })
                                    }
                                />
                            </Form.Group>
                            {/* Data do Evento */}
                            <Form.Group className="mb-3">
                                <Form.Label>Data do Evento</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={new Date(currentEvento.DATA_EVENTO).toISOString().split('T')[0]}
                                    onChange={(e) =>
                                        setCurrentEvento({ ...currentEvento, DATA_EVENTO: e.target.value })
                                    }
                                />
                            </Form.Group>
                            {/* Disponibilidade */}
                            <Form.Group className="mb-3">
                                <Form.Label>Disponibilidade</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={currentEvento.DISPONIBILIDADE}
                                    onChange={(e) =>
                                        setCurrentEvento({ ...currentEvento, DISPONIBILIDADE: e.target.value === 'true' })
                                    }
                                >
                                    <option value={true}>Disponível</option>
                                    <option value={false}>Indisponível</option>
                                </Form.Control>
                            </Form.Group>
                            {/* Localização */}
                            <Form.Group className="mb-3">
                                <Form.Label>Localização</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentEvento.LOCALIZACAO}
                                    onChange={(e) =>
                                        setCurrentEvento({ ...currentEvento, LOCALIZACAO: e.target.value })
                                    }
                                />
                            </Form.Group>
                            {/* Número de Participantes */}
                            <Form.Group className="mb-3">
                                <Form.Label>Número de Participantes</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={currentEvento.N_PARTICIPANTES}
                                    onChange={(e) =>
                                        setCurrentEvento({ ...currentEvento, N_PARTICIPANTES: e.target.value })
                                    }
                                />
                            </Form.Group>
                            {/* Foto */}
                            <Form.Group className="mb-3">
                                <Form.Label>Foto do Evento</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSaveChanges}>
                            Salvar Alterações
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default ListarEventosDoCentro;

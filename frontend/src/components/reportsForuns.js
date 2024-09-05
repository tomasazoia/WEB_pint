import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const ReportsView = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();  // Hook para navegação

    useEffect(() => {
        const fetchUserIdAndReports = async () => {
            try {
                const token = sessionStorage.getItem('token');

                if (!token) throw new Error('Token de autenticação não encontrado.');

                // Fazendo a solicitação para obter o perfil do usuário autenticado
                const userProfileResponse = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
                    headers: {
                        'x-auth-token': token
                    }
                });

                const userId = userProfileResponse.data.ID_FUNCIONARIO; // ID do usuário
                setUserId(userId);

                // Agora, buscamos os reports para o centro do usuário logado
                fetchReports(userId);
            } catch (error) {
                console.error('Erro ao obter o perfil do usuário:', error);
                setError('Erro ao obter o perfil do usuário.');
            }
        };

        fetchUserIdAndReports();
    }, []);

    const fetchReports = async (userId) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('Token de autenticação não encontrado.');
                return;
            }

            const response = await axios.get(`https://pintfinal-backend.onrender.com/reportforums/list`, {
                headers: {
                    'x-auth-token': token,
                    'user-id': userId // Inclui o ID do usuário nos cabeçalhos para o filtro no backend
                },
            });

            setReports(response.data);
        } catch (error) {
            console.error('Erro ao carregar reports:', error);
            setError('Erro ao carregar reports.');
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('Token de autenticação não encontrado.');
                return;
            }

            await axios.delete(`https://pintfinal-backend.onrender.com/reportforums/delete/${id}`, {
                headers: {
                    'x-auth-token': token,
                },
            });
            setReports(reports.filter((report) => report.ID_COMENTARIO !== id));
            setShowModal(false);
        } catch (error) {
            console.error('Erro ao eliminar o report:', error);
            setError('Erro ao eliminar o report.');
        }
    };

    const handleShowModal = (report) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    return (
        <div className="container mt-5">
            <h1>Reports de Foruns</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row">
                {reports.map((report) => (
                    <div className="col-md-4" key={report.ID_COMENTARIO}>
                        <Card className="mb-4">
                            <Card.Body>
                            <Card.Text>
                                    <strong>Nome do Evento:</strong> {report.comentariosforum.evento.NOME_FORUM}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Comentário:</strong> {report.comentariosforum.DESCRICAO}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Motivo:</strong> {report.reporttopico.NOME_TOPICO}
                                </Card.Text>
                                <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleShowModal(report); }}>
                                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Modal para confirmar a eliminação do report */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem a certeza que deseja eliminar este report?
                    <br />
                    <strong>Comentário:</strong> {selectedReport?.comentariosforum?.DESCRICAO}
                    <br />
                    <strong>Motivo:</strong> {selectedReport?.reporttopico?.NOME_TOPICO}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(selectedReport.ID_COMENTARIO)}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReportsView;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';

const AlbumFotosEvento = () => {
    const { id } = useParams(); // ID do evento
    const [fotos, setFotos] = useState([]);
    const [legenda, setLegenda] = useState('');
    const [foto, setFoto] = useState(null);
    const [userId, setUserId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const fileInputRef = React.createRef();
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFotos = async () => {
            const token = sessionStorage.getItem('token');

            if (!token) {
                setError('Token de autenticação não encontrado.');
                return;
            }

            try {
                const userResponse = await axios.get('http://localhost:3000/user/profile', {
                    headers: {
                        'x-auth-token': token
                    }
                });
                setUserId(userResponse.data.ID_FUNCIONARIO); // Definindo userId

                const response = await axios.get(`http://localhost:3000/album/evento/${id}`);
                setFotos(response.data);
            } catch (error) {
                console.error('Erro ao carregar fotos:', error);
            }
        };

        fetchFotos();
    }, [id]);

    const handleFileChange = (e) => {
        setFoto(e.target.files[0]);
    };

    const handleLegendaChange = (e) => {
        setLegenda(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foto || !legenda) {
            Swal.fire('Erro', 'Por favor, selecione uma foto e adicione uma legenda.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('foto', foto);
        formData.append('ID_EVENTO', id);
        formData.append('LEGENDA', legenda);
        formData.append('ID_CRIADOR', userId);

        try {
            await axios.post('http://localhost:3000/album/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            Swal.fire('Sucesso', 'Foto adicionada ao álbum com sucesso!', 'success');
            setLegenda('');
            setFoto(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            const response = await axios.get(`http://localhost:3000/album/evento/${id}`);
            setFotos(response.data);

            // Fecha o modal usando o estado do React
            setModalOpen(false);
        } catch (error) {
            console.error('Erro ao adicionar foto ao álbum:', error);
            Swal.fire('Erro', 'Não foi possível adicionar a foto ao álbum.', 'error');
        }
    };

    const handleDelete = async (fotoId) => {
        try {
            await axios.delete(`http://localhost:3000/album/delete/${fotoId}`);
            Swal.fire('Sucesso', 'Foto deletada com sucesso!', 'success');
            setFotos(fotos.filter(foto => foto.ID_FOTO !== fotoId));
        } catch (error) {
            console.error('Erro ao deletar foto:', error);
            Swal.fire('Erro', 'Não foi possível deletar a foto.', 'error');
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Álbum de Fotos do Evento</h1>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="row g-3">
                        {fotos.map((foto) => (
                            <div className="col-sm-6 col-md-4" key={foto.ID_FOTO}>
                                <div className="position-relative">
                                    <img
                                        src={`http://localhost:3000/${foto.foto}`}
                                        alt={foto.LEGENDA}
                                        className="img-fluid rounded"
                                        style={{ objectFit: 'cover', width: '100%', height: '300px' }}
                                    />
                                    <button
                                        className="btn btn-outline-danger position-absolute top-0 end-0 m-2"
                                        onClick={() => handleDelete(foto.ID_FOTO)}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                    <div className="position-absolute bottom-0 start-0 bg-dark bg-opacity-50 w-100 text-white p-2 rounded-bottom">
                                        {foto.LEGENDA}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="col-sm-6 col-md-4 d-flex align-items-center justify-content-center">
                            <button
                                className="btn btn-outline-primary rounded-circle"
                                style={{ width: '120px', height: '120px', fontSize: '30px' }}
                                onClick={() => setModalOpen(true)}
                            >
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for adding new photo */}
            {modalOpen && (
                <div
                    className="modal fade show"
                    style={{ display: 'block' }}
                    role="dialog"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Adicionar Nova Foto</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModalOpen(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="legenda" className="form-label">Legenda</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="legenda"
                                            value={legenda}
                                            onChange={handleLegendaChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="fileInput" className="form-label">Selecionar Foto</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="fileInput"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Adicionar Foto</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlbumFotosEvento;

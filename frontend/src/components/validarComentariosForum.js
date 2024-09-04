import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

const ComentariosNaoValidadosForum = () => {
    const [comentarios, setComentarios] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComentarios();
    }, []);

    const fetchComentarios = async () => {
        try {
            const comentariosResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/comentarios_forum/listforuminvalido`);
            setComentarios(comentariosResponse.data);
        } catch (error) {
            console.error('Erro ao listar comentários não validados:', error);
            setError('Erro ao listar comentários não validados.');
        }
    };

    const deleteComentario = async (id) => {
        try {
            await axios.delete(`https://pint-backend-5gz8.onrender.com/comentarios_forum/delete/${id}`, {
                headers: {
                    'x-auth-token': sessionStorage.getItem('token')
                }
            });
            setComentarios(comentarios.filter(comentario => comentario.ID_COMENTARIO !== id));
            Swal.fire({
                icon: 'success',
                title: 'Eliminado!',
                text: 'O comentário foi eliminado com sucesso.'
            });
        } catch (error) {
            console.error('Erro ao eliminar comentário:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Ocorreu um erro ao eliminar o comentário.'
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
                deleteComentario(id);
            }
        });
    };

    const validarComentario = async (comentarioId) => {
        try {
            await axios.put(`https://pint-backend-5gz8.onrender.com/comentarios_forum/validar/${comentarioId}`);
            Swal.fire({
                icon: 'success',
                title: 'Validado!',
                text: 'O comentário foi validado com sucesso.'
            });
            fetchComentarios(); 
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao validar comentário: ' + (error.response?.data?.message || 'Erro desconhecido.')
            });
        }
    };

    const formatarData = (dataStr) => {
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Comentários Não Validados - Fóruns</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead className="thead-dark">
                        <tr>
                            <th>ID</th>
                            <th>Comentário</th>
                            <th>Data</th>
                            <th>Nome do Fórum</th> {/* Novo campo para o título do fórum */}
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comentarios.map(comentario => (
                            <tr key={comentario.ID_COMENTARIO}>
                                <td>{comentario.ID_COMENTARIO}</td>
                                <td>{comentario.DESCRICAO}</td>
                                <td>{formatarData(comentario.DATA_COMENTARIO)}</td>
                                <td>{comentario.forum.NOME_FORUM}</td> {/* Exibe o título do fórum */}
                                <td>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => validarComentario(comentario.ID_COMENTARIO)}
                                    >
                                        Validar
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(comentario.ID_COMENTARIO)}
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

export default ComentariosNaoValidadosForum;

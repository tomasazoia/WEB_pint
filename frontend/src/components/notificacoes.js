import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Notificacoes = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotificacoes = async () => {
            const token = sessionStorage.getItem('token');

        if (!token) {
            setError('Token de autenticação não encontrado.');
            return;
        }

        try {
            // Obter o ID do utilizador autenticado
            const userResponse = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
                headers: {
                    'x-auth-token': token
                }
            });
            const userId = userResponse.data.ID_FUNCIONARIO;
                const response = await axios.get(`https://pintfinal-backend.onrender.com/notificacoes/user/${userId}`, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                setNotificacoes(response.data);
            } catch (error) {
                console.error('Erro ao carregar notificações:', error);
                setError('Erro ao carregar notificações.');
            }
        };

        fetchNotificacoes();
    }, []);

    const marcarComoLida = async (id) => {
        try {
            await axios.put(`https://pintfinal-backend.onrender.com/notificacoes/read/${id}`);
            setNotificacoes(notificacoes.map(n => n.ID_NOTIFICACAO === id ? { ...n, LIDA: true } : n));
            Swal.fire('Sucesso', 'Notificação marcada como lida!', 'success');
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
            Swal.fire('Erro', 'Erro ao marcar notificação como lida.', 'error');
        }
    };

    const apagarNotificacao = async (id) => {
        try {
            await axios.delete(`https://pintfinal-backend.onrender.com/notificacoes/delete/${id}`);
            setNotificacoes(notificacoes.filter(n => n.ID_NOTIFICACAO !== id));
            Swal.fire('Sucesso', 'Notificação apagada!', 'success');
        } catch (error) {
            console.error('Erro ao apagar notificação:', error);
            Swal.fire('Erro', 'Erro ao apagar notificação.', 'error');
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center">Notificações</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <ul className="list-group">
                {notificacoes.map((notificacao) => (
                    <li key={notificacao.ID_NOTIFICACAO} className={`list-group-item ${notificacao.LIDA ? 'list-group-item-secondary' : 'list-group-item-light'}`}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>{notificacao.MENSAGEM}</span>
                            <div>
                                {!notificacao.LIDA && (
                                    <button onClick={() => marcarComoLida(notificacao.ID_NOTIFICACAO)} className="btn btn-sm btn-success me-2">Marcar como lida</button>
                                )}
                                <button onClick={() => apagarNotificacao(notificacao.ID_NOTIFICACAO)} className="btn btn-sm btn-danger">Apagar</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notificacoes;

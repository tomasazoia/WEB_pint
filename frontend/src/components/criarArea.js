import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

const CriarArea = () => {
    const [nomeArea, setNomeArea] = useState('');
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            const response = await axios.get('https://pintfinal-backend.onrender.com/area/list');
            setAreas(response.data);
        } catch (error) {
            console.error('Erro ao carregar áreas:', error);
            setError('Erro ao carregar áreas. Tente novamente mais tarde.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!nomeArea) {
            setError('O nome da área é obrigatório.');
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            if (selectedArea) {
                // Editar área existente
                await axios.put(`https://pintfinal-backend.onrender.com/area/update/${selectedArea.ID_AREA}`, { NOME_AREA: nomeArea }, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Área Atualizada!',
                    text: `A área "${nomeArea}" foi atualizada com sucesso.`
                });
            } else {
                // Criar nova área
                const response = await axios.post('https://pintfinal-backend.onrender.com/area/create', { NOME_AREA: nomeArea }, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Área Criada!',
                    text: `A área "${response.data.NOME_AREA}" foi criada com sucesso.`
                });
            }

            setNomeArea('');  // Limpar o campo após o sucesso
            setError('');  // Limpar mensagem de erro
            setSelectedArea(null);  // Resetar área selecionada
            fetchAreas();  // Atualizar lista de áreas
        } catch (error) {
            console.error('Erro ao processar área:', error);
            setError('Erro ao processar área. Tente novamente mais tarde.');
        }
    };

    const handleEdit = (area) => {
        setNomeArea(area.NOME_AREA);
        setSelectedArea(area);
    };

    const handleDelete = async (areaId) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`https://pintfinal-backend.onrender.com/area/delete/${areaId}`, {
                headers: {
                    'x-auth-token': token
                }
            });
            Swal.fire({
                icon: 'success',
                title: 'Área Excluída!',
                text: 'A área foi excluída com sucesso.'
            });
            fetchAreas();  // Atualizar lista de áreas
        } catch (error) {
            console.error('Erro ao excluir área:', error);
            setError('Erro ao excluir área. Tente novamente mais tarde.');
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">{selectedArea ? 'Editar Área' : 'Criar Nova Área'}</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nomeArea">Nome da Área</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nomeArea"
                        value={nomeArea}
                        onChange={(e) => setNomeArea(e.target.value)}
                        placeholder="Insira o nome da área"
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    {selectedArea ? 'Atualizar Área' : 'Criar Área'}
                </button>
            </form>

            <h2 className="mt-4">Áreas Existentes</h2>
            <ul className="list-group">
                {areas.map(area => (
                    <li key={area.ID_AREA} className="list-group-item d-flex justify-content-between align-items-center">
                        {area.NOME_AREA}
                        <div>
                            <button
                                className="btn btn-warning btn-sm me-2"
                                onClick={() => handleEdit(area)}
                            >
                                Editar
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(area.ID_AREA)}
                            >
                                Excluir
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CriarArea;

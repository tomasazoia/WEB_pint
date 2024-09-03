import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

const GerenciarSubAreas = () => {
    const [subAreas, setSubAreas] = useState([]);
    const [areas, setAreas] = useState([]); // Armazena as áreas
    const [nomeSubArea, setNomeSubArea] = useState('');
    const [selectedAreaId, setSelectedAreaId] = useState(''); // Armazena o ID da área selecionada
    const [selectedSubAreaId, setSelectedSubAreaId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubAreas();
        fetchAreas(); // Carrega as áreas ao montar o componente
    }, []);

    const fetchSubAreas = async () => {
        try {
            const response = await axios.get('http://localhost:3000/subarea/list');
            setSubAreas(response.data);
        } catch (error) {
            console.error('Erro ao buscar subáreas:', error);
            setError('Erro ao buscar subáreas.');
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await axios.get('http://localhost:3000/area/list');
            setAreas(response.data);
        } catch (error) {
            console.error('Erro ao buscar áreas:', error);
            setError('Erro ao buscar áreas.');
        }
    };

    const handleCreateOrUpdate = async (event) => {
        event.preventDefault();

        if (!nomeSubArea || !selectedAreaId) {  // Verifica se o ID da área está selecionado
            setError('O nome da subárea e o ID da área são obrigatórios.');
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            if (selectedSubAreaId) {
                // Atualizar subárea existente
                await axios.put(`http://localhost:3000/subarea/update/${selectedSubAreaId}`, {
                    NOME_SUBAREA: nomeSubArea,
                    ID_AREA: selectedAreaId  // Envia o ID da área
                }, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Subárea Atualizada!',
                    text: `A subárea foi atualizada com sucesso.`
                });
            } else {
                // Criar nova subárea
                await axios.post('http://localhost:3000/subarea/checknormal', {
                    NOME_SUBAREA: nomeSubArea,
                    ID_AREA: selectedAreaId  // Envia o ID da área
                }, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Subárea Criada!',
                    text: `A subárea foi criada com sucesso.`
                });
            }

            setNomeSubArea('');
            setSelectedAreaId(''); // Reseta o dropdown após o envio
            setSelectedSubAreaId(null);
            fetchSubAreas();  // Atualizar lista de subáreas
            setError('');
        } catch (error) {
            console.error('Erro ao criar/atualizar subárea:', error);
            setError('Erro ao criar/atualizar subárea. Tente novamente mais tarde.');
        }
    };

    const handleEdit = (subArea) => {
        setNomeSubArea(subArea.NOME_SUBAREA);
        setSelectedAreaId(subArea.ID_AREA); // Define a área da subárea em edição
        setSelectedSubAreaId(subArea.ID_SUB_AREA);
    };

    const handleDelete = async (subAreaId) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`http://localhost:3000/subarea/delete/${subAreaId}`, {
                headers: {
                    'x-auth-token': token
                }
            });
            Swal.fire({
                icon: 'success',
                title: 'Subárea Eliminada!',
                text: `A subárea foi eliminada com sucesso.`
            });
            fetchSubAreas();  // Atualizar lista de subáreas
        } catch (error) {
            console.error('Erro ao eliminar subárea:', error);
            setError('Erro ao eliminar subárea. Tente novamente mais tarde.');
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">{selectedSubAreaId ? 'Editar Subárea' : 'Criar Nova Subárea'}</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleCreateOrUpdate}>
                <div className="form-group mt-3">
                    <label htmlFor="areaSelect">Selecione a Área</label>
                    <select
                        className="form-control"
                        id="areaSelect"
                        value={selectedAreaId}
                        onChange={(e) => setSelectedAreaId(e.target.value)}
                    >
                        <option value="">Selecione uma área</option>
                        {areas.map(area => (
                            <option key={area.ID_AREA} value={area.ID_AREA}>
                                {area.NOME_AREA}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="nomeSubArea">Nome da Subárea</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nomeSubArea"
                        value={nomeSubArea}
                        onChange={(e) => setNomeSubArea(e.target.value)}
                        placeholder="Insira o nome da subárea"
                    />
                </div>

                <button type="submit" className="btn btn-primary mt-3">
                    {selectedSubAreaId ? 'Atualizar Subárea' : 'Criar Subárea'}
                </button>
            </form>
            <h2 className="mt-5">Subáreas Existentes</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome da Subárea</th>
                        <th>Nome da Área</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {subAreas.map(subArea => (
                        <tr key={subArea.ID_SUB_AREA}>
                            <td>{subArea.ID_SUB_AREA}</td>
                            <td>{subArea.NOME_SUBAREA}</td>
                            <td>{subArea.area ? subArea.area.NOME_AREA : 'Área não encontrada'}</td>
                            <td>
                                <button className="btn btn-warning btn-sm" onClick={() => handleEdit(subArea)}>Editar</button>
                                <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDelete(subArea.ID_SUB_AREA)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GerenciarSubAreas;

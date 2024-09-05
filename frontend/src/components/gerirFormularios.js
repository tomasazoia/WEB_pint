// src/components/FormulariosTable.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FormulariosTable = () => {
    const [formularios, setFormularios] = useState([]);

    useEffect(() => {
        fetchFormularios();
    }, []);

    const fetchFormularios = async () => {
        try {
            const response = await axios.get('https://pintfinal-backend.onrender.com/formularios/list');
            const sortedFormularios = response.data.sort((a, b) => a.ID_FORMULARIO - b.ID_FORMULARIO);
            setFormularios(response.data);
        } catch (error) {
            console.error('Erro ao buscar formulários:', error);
        }
    };

    const toggleFormularioAtivo = async (id, currentStatus) => {
        try {
            if (currentStatus) {
                await axios.put(`https://pintfinal-backend.onrender.com/formularios/deactivate/${id}`);
            } else {
                await axios.put(`https://pintfinal-backend.onrender.com/formularios/activate/${id}`);
            }
            fetchFormularios(); // Atualiza a lista após a ativação/desativação
        } catch (error) {
            console.error('Erro ao alterar status do formulário:', error);
        }
    };

    return (
        <div className="container">
            <h1>Lista de Formulários</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome do Formulário</th>
                        <th>Ativo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {formularios.map((formulario) => (
                        <tr key={formulario.ID_FORMULARIO}>
                            <td>{formulario.ID_FORMULARIO}</td>
                            <td>{formulario.NOME_FORMULARIO}</td>
                            <td>{formulario.ATIVO ? 'Sim' : 'Não'}</td>
                            <td>
                                <button
                                    onClick={() => toggleFormularioAtivo(formulario.ID_FORMULARIO, formulario.ATIVO)}
                                    className={`btn ${formulario.ATIVO ? 'btn-danger' : 'btn-success'}`}
                                >
                                    {formulario.ATIVO ? 'Desativar' : 'Ativar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FormulariosTable;

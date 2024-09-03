import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

const InformacoesView = () => {
  const [informacoes, setInformacoes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);
  const [newInfo, setNewInfo] = useState({
    TITULO: '',
    DESCRICAO: '',
    ID_CRIADOR: null,
  });
  const [error, setError] = useState('');

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    fetchInformacoes();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/user/profile', {
        headers: {
          'x-auth-token': token,
        },
      });

      setNewInfo((prevInfo) => ({
        ...prevInfo,
        ID_CRIADOR: response.data.ID_FUNCIONARIO, // Armazena o ID do funcionário logado
      }));
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  const fetchInformacoes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/infos/list', {
        headers: {
          'x-auth-token': token,
        },
      });
      setInformacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/infos/delete/${id}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      setInformacoes(informacoes.filter((info) => info.ID_INFORMACAO !== id));
    } catch (error) {
      console.error('Erro ao eliminar informação:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingInfo) {
        // Editar Informação
        await axios.put(
          `http://localhost:3000/infos/update/${editingInfo.ID_INFORMACAO}`,
          newInfo,
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );
      } else {
        // Criar Nova Informação
        await axios.post('http://localhost:3000/infos/create', newInfo, {
          headers: {
            'x-auth-token': token,
          },
        });
      }

      fetchInformacoes();
      setNewInfo((prevInfo) => ({
        TITULO: '',
        DESCRICAO: '',
        ID_CRIADOR: prevInfo.ID_CRIADOR, // Mantém o ID_CRIADOR
      }));
      setEditingInfo(null);
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar informação:', error);
    }
  };

  const handleEdit = (info) => {
    setEditingInfo(info);
    setNewInfo(info);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingInfo(null);
    setNewInfo((prevInfo) => ({
      TITULO: '',
      DESCRICAO: '',
      ID_CRIADOR: prevInfo.ID_CRIADOR, // Mantém o ID_CRIADOR
    }));
    setShowModal(true);
  };

  // Função para formatar a data no formato dd/mm/aa
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container mt-5">
      <h1>Informações/Avisos</h1>
      <Button variant="primary" className="mb-3" onClick={handleShowModal}>
        <FontAwesomeIcon icon={faPlus} /> Criar Novo
      </Button>
      <div className="row">
        {informacoes.map((info) => (
          <div className="col-md-4" key={info.ID_INFORMACAO}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Text className="text-muted">
                  {formatDate(info.DATA_CRIACAO)} {/* Data formatada */}
                </Card.Text>
                <Card.Title>{info.TITULO}</Card.Title>
                <Card.Text>{info.DESCRICAO}</Card.Text>
                <Button variant="warning" onClick={() => handleEdit(info)} className="mr-2">
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(info.ID_INFORMACAO)}>
                  <FontAwesomeIcon icon={faTrash} /> Eliminar
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Modal para Criar/Editar Informação */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingInfo ? 'Editar Informação' : 'Criar Nova Informação'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                placeholder="Título"
                value={newInfo.TITULO}
                onChange={(e) => setNewInfo({ ...newInfo, TITULO: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descrição"
                value={newInfo.DESCRICAO}
                onChange={(e) => setNewInfo({ ...newInfo, DESCRICAO: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InformacoesView;
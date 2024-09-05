import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faIdCard, faMapMarkerAlt, faPhone, faEdit, faSave, faTimes, faCalendarAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { faLock } from '@fortawesome/free-solid-svg-icons';

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    user_mail: '',
    NIF: '',
    MORADA: '',
    NTELEMOVEL: ''
  });
  const [eventosCriados, setEventosCriados] = useState([]);
  const [eventosInscritos, setEventosInscritos] = useState([]);
  const [preferencias, setPreferencias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedSubAreas, setSelectedSubAreas] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    axios.get('https://pintfinal-backend.onrender.com/user/profile', {
      headers: {
        'x-auth-token': token
      }
    })
      .then(async (response) => {
        setUser(response.data);
        setFormData(response.data);
        loadEventosCriados(response.data.ID_FUNCIONARIO);
        loadEventosInscritos(response.data.ID_FUNCIONARIO);
        loadPreferencias(response.data.ID_FUNCIONARIO);
        loadAreas();
        loadSubAreas();
      })
      .catch(error => {
        setError('Erro ao obter os dados do utilizador.');
        console.error('Erro ao obter os dados do utilizador:', error);
      });
  }, []);

  const loadEventosCriados = async (userId) => {
    try {
      const response = await axios.get(`https://pintfinal-backend.onrender.com/evento/criador/eventos/${userId}`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });

      const eventos = await Promise.all(response.data.map(async (evento) => {
        const cidade = await getCityFromCoordinates(evento.LOCALIZACAO); // Chama a função para obter a cidade
        return { ...evento, cidade }; // Adiciona a cidade ao objeto evento
      }));

      setEventosCriados(eventos);
    } catch (error) {
      console.error('Erro ao obter os eventos criados pelo utilizador:', error);
      setError('Erro ao obter os eventos criados pelo utilizador.');
    }
  };

  const loadEventosInscritos = async (userId) => {
    try {
      const response = await axios.get(`https://pintfinal-backend.onrender.com/participantesevento/funcionario/${userId}/eventos`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });

      const eventos = await Promise.all(response.data.map(async (evento) => {
        const cidade = await getCityFromCoordinates(evento.evento.LOCALIZACAO); // Chama a função para obter a cidade
        return { ...evento, cidade }; // Adiciona a cidade ao objeto evento
      }));

      setEventosInscritos(eventos);
    } catch (error) {
      console.error('Erro ao obter os eventos inscritos pelo utilizador:', error);
      setError('Erro ao obter os eventos inscritos pelo utilizador.');
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

  const loadPreferencias = (userId) => {
    axios.get(`https://pintfinal-backend.onrender.com/userpreferences/list/profile/${userId}`, {
      headers: {
        'x-auth-token': sessionStorage.getItem('token')
      }
    })
      .then(response => {
        const preferenciasData = response.data || [];
        setPreferencias(preferenciasData);

        const selectedAreas = preferenciasData.map(pref => pref.ID_AREA);
        const selectedSubAreas = preferenciasData.map(pref => pref.ID_SUBAREA);
        setSelectedAreas(selectedAreas);
        setSelectedSubAreas(selectedSubAreas);
      })
      .catch(error => {
        console.error('Erro ao obter as preferências do utilizador:', error);
        setError('Erro ao obter as preferências do utilizador.');
      });
  };

  const loadAreas = () => {
    axios.get('https://pintfinal-backend.onrender.com/area/list', {
      headers: {
        'x-auth-token': sessionStorage.getItem('token')
      }
    })
      .then(response => {
        setAreas(response.data || []);
      })
      .catch(error => {
        console.error('Erro ao obter as áreas:', error);
        setError('Erro ao obter as áreas.');
      });
  };

  const loadSubAreas = () => {
    axios.get('https://pintfinal-backend.onrender.com/subarea/list', {
      headers: {
        'x-auth-token': sessionStorage.getItem('token')
      }
    })
      .then(response => {
        setSubAreas(response.data || []);
      })
      .catch(error => {
        console.error('Erro ao obter as subáreas:', error);
        setError('Erro ao obter as subáreas.');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    axios.put('https://pintfinal-backend.onrender.com/user/profileup', formData, {
      headers: {
        'x-auth-token': token
      }
    })
      .then(response => {
        setUser(response.data);
        setEditMode(false);
      })
      .catch(error => {
        setError(`Erro ao atualizar os dados do utilizador: ${error.response ? error.response.data.message : error.message}`);
        console.error('Erro ao atualizar os dados do utilizador:', error);
      });
  };

  const handlePreferenceChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === 'area') {
      setSelectedAreas((prev) =>
        checked ? [...prev, parseInt(value)] : prev.filter((id) => id !== parseInt(value))
      );
    } else if (name === 'subarea') {
      setSelectedSubAreas((prev) =>
        checked ? [...prev, parseInt(value)] : prev.filter((id) => id !== parseInt(value))
      );
    }
  };


  const handlePreferencesSubmit = async () => {
    const token = sessionStorage.getItem('token');
    const updatedPreferences = {
      areas: selectedAreas,
      subAreas: selectedSubAreas
    };

    try {
      const response = await axios.put(`https://pintfinal-backend.onrender.com/userpreferences/update/user/${user.ID_FUNCIONARIO}`, updatedPreferences, {
        headers: {
          'x-auth-token': token
        }
      });
      setPreferencias(response.data);

      // Exibir a mensagem de sucesso com SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Preferências Atualizadas',
        text: 'As suas preferências foram atualizadas com sucesso!',
        confirmButtonText: 'OK'
      })
    } catch (error) {
      setError(`Erro ao atualizar as preferências: ${error.response ? error.response.data.message : error.message}`);
      console.error('Erro ao atualizar as preferências:', error);

      // Exibir a mensagem de erro com SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: `Erro ao atualizar as preferências: ${error.response ? error.response.data.message : error.message}`,
        confirmButtonText: 'OK'
      });
    }
  };


  if (error) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  if (!user) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">A carregar...</span></div>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-3 mb-5 bg-white rounded">
        <div className="card-header bg-primary text-white text-center">
          <FontAwesomeIcon icon={faUser} size="4x" />
          <h1 className="mt-3">{user.user_name}</h1>
        </div>
        <div className="card-body">
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label"><FontAwesomeIcon icon={faUser} /> Nome</label>
                <input type="text" className="form-control" name="user_name" value={formData.user_name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label"><FontAwesomeIcon icon={faEnvelope} /> Email</label>
                <input type="email" className="form-control" name="user_mail" value={formData.user_mail} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label"><FontAwesomeIcon icon={faIdCard} /> NIF</label>
                <input type="text" className="form-control" name="NIF" value={formData.NIF} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label"><FontAwesomeIcon icon={faMapMarkerAlt} /> Morada</label>
                <input type="text" className="form-control" name="MORADA" value={formData.MORADA} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label"><FontAwesomeIcon icon={faPhone} /> Telefone</label>
                <input type="text" className="form-control" name="NTELEMOVEL" value={formData.NTELEMOVEL} onChange={handleChange} />
              </div>
              <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-primary"><FontAwesomeIcon icon={faSave} /> Salvar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}><FontAwesomeIcon icon={faTimes} /> Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <p><strong><FontAwesomeIcon icon={faEnvelope} /> Email:</strong> {user.user_mail}</p>
              <p><strong><FontAwesomeIcon icon={faIdCard} /> NIF:</strong> {user.NIF}</p>
              <p><strong><FontAwesomeIcon icon={faMapMarkerAlt} /> Morada:</strong> {user.MORADA}</p>
              <p><strong><FontAwesomeIcon icon={faPhone} /> Telefone:</strong> {user.NTELEMOVEL}</p>
              <div className="text-center">
                <button className="btn btn-warning" onClick={() => setEditMode(true)}><FontAwesomeIcon icon={faEdit} /> Editar</button>
              </div>
            </>
          )}
        </div>
        <div className="text-center">
          <Link
            to="/auth/change-password"
            className="btn btn-success mb-3" // btn-sm para botões pequenos
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} // Ajustes inline para tamanho
          >
            <FontAwesomeIcon icon={faLock} className="me-2" />
            Alterar Senha
          </Link>
        </div>

        <div className="card-footer">
          <h3 className="text-center"><FontAwesomeIcon icon={faCalendarAlt} /> Eventos Inscritos</h3>
          <ul className="list-group list-group-flush">
            {eventosInscritos.length > 0 ? (
              eventosInscritos.map(evento => (
                <li key={evento.evento.ID_EVENTO} className="list-group-item">
                  <h5>{evento.evento.NOME_EVENTO}</h5>
                  <p><strong>Data:</strong> {new Date(evento.evento.DATA_EVENTO).toLocaleDateString()}</p>
                  <p><strong>Localização:</strong> {evento.evento.cidade}</p>
                </li>
              ))
            ) : (
              <li className="list-group-item">Nenhum evento encontrado.</li>
            )}
          </ul>
        </div>
        <div className="card-footer">
          <h3 className="text-center"><FontAwesomeIcon icon={faCalendarAlt} /> Eventos Criados</h3>
          <ul className="list-group list-group-flush">
            {eventosCriados.length > 0 ? (
              eventosCriados.map(evento => (
                <li key={evento.ID_EVENTO} className="list-group-item">
                  <h5>{evento.NOME_EVENTO}</h5>
                  <p><strong>Data:</strong> {new Date(evento.DATA_EVENTO).toLocaleDateString()}</p>
                  <p><strong>Localização:</strong> {evento.cidade}</p>
                </li>
              ))
            ) : (
              <li className="list-group-item">Nenhum evento encontrado.</li>
            )}
          </ul>
        </div>
        <div className="card-footer">
          <h3 className="text-center">Preferências</h3>
          <form onSubmit={(e) => { e.preventDefault(); handlePreferencesSubmit(); }}>
            <div className="mb-3">
              <h5>Áreas</h5>
              {areas.map(area => (
                <div key={area.ID_AREA} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`area-${area.ID_AREA}`}
                    name="area"
                    value={area.ID_AREA}
                    checked={selectedAreas.includes(parseInt(area.ID_AREA))}
                    onChange={handlePreferenceChange}
                  />
                  <label className="form-check-label" htmlFor={`area-${area.ID_AREA}`}>
                    {area.NOME_AREA}
                  </label>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <h5>Subáreas</h5>
              {subAreas.map(subarea => (
                <div key={subarea.ID_SUB_AREA} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`subarea-${subarea.ID_SUB_AREA}`}
                    name="subarea"
                    value={subarea.ID_SUB_AREA}
                    checked={selectedSubAreas.includes(parseInt(subarea.ID_SUB_AREA))}
                    onChange={handlePreferenceChange}
                  />
                  <label className="form-check-label" htmlFor={`subarea-${subarea.ID_SUB_AREA}`}>
                    {subarea.NOME_SUBAREA}
                  </label>
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary"><FontAwesomeIcon icon={faSave} /> Salvar Preferências</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;

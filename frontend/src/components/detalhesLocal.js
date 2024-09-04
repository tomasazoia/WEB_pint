import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import '../styles/styles.css';
import Swal from 'sweetalert2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, LinkedinIcon, WhatsappIcon } from 'react-share';

const DetalhesLocal = () => {
  const { id } = useParams();
  const [local, setLocal] = useState(null);
  const [averageReview, setAverageReview] = useState(0);
  const [erro, setErro] = useState('');
  const [newReview, setNewReview] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [totalReviews, setTotalReviews] = useState(0); // Novo estado para o número de avaliações

  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const shareUrl = window.location.href; // URL do evento
  const title = local ? local.DESIGNACAO_LOCAL : 'Recomendação'; // Título do evento
  const teamsShareUrl = `https://teams.microsoft.com/share?href=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
  useEffect(() => {
    const fetchLocal = async () => {
      try {
        const response = await axios.get(`https://pint-backend-5gz8.onrender.com/locais/get/${id}`);
        setLocal(response.data);

        const averageReviewResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/review/average/local/${id}`);
        setAverageReview(averageReviewResponse.data.averageReview);

        const comentariosResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/comentarios_local/listlocal/${id}`);
        setComentarios(comentariosResponse.data);

        const totalReviewsResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/review/local/get/${id}`);
        setTotalReviews(totalReviewsResponse.data.count);

        setErro('');
      } catch (error) {
        console.error('Erro ao carregar dados', error);
        setErro('Erro ao carregar dados');
      }
    };

    fetchLocal();
  }, [id]);

  useEffect(() => {
    if (local && mapRef.current && !map) {
      const defaultIcon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIconRetina,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const [lat, lng] = local.LOCALIZACAO.split(',').map(Number);

      const mapInstance = L.map(mapRef.current).setView([lat, lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      L.marker([lat, lng], { icon: defaultIcon }).addTo(mapInstance)
        .bindPopup(local.DESIGNACAO_LOCAL)
        .openPopup();

      setMap(mapInstance);
    }
  }, [local, map]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <>
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} color="gold" />)}
        {[...Array(halfStars)].map((_, i) => <FaStarHalfAlt key={`half-${i}`} color="gold" />)}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} color="gold" />)}
      </>
    );
  };

  const handleSubmitReview = async () => {
    try {
      const token = sessionStorage.getItem('token');

      if (!token) throw new Error('Token de autenticação não encontrado.');

      const userProfileResponse = await axios.get('https://pint-backend-5gz8.onrender.com/user/profile', {
        headers: {
          'x-auth-token': token
        }
      });

      const userId = userProfileResponse.data.ID_FUNCIONARIO;

      if (!userId) throw new Error('Erro ao obter dados do usuário ou centro.');
      const ID_CRIADOR = userId;
      const reviewData = {
        ID_CRIADOR,
        REVIEW: newReview
      };

      await axios.post(`https://pint-backend-5gz8.onrender.com/review/local/${id}`, reviewData);

      const averageReviewResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/review/average/local/${id}`);
      setAverageReview(averageReviewResponse.data.averageReview);

      const totalReviewsResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/review/local/get/${id}`);
      setTotalReviews(totalReviewsResponse.data.count);

      setNewReview('');
      setShowReviewForm(false);
    } catch (error) {
      console.error('Erro ao adicionar review:', error);
      setErro('Erro ao adicionar review.');
    }
  };

  const handleAddComentario = async () => {
    try {
      const token = sessionStorage.getItem('token');

      if (!token) throw new Error('Token de autenticação não encontrado.');

      const userProfileResponse = await axios.get('https://pint-backend-5gz8.onrender.com/user/profile', {
        headers: { 'x-auth-token': token }
      });

      const userId = userProfileResponse.data.ID_FUNCIONARIO;

      if (!novoComentario.trim() || !userId) return;

      const comentarioData = {
        ID_FUNCIONARIO: userId,
        DESCRICAO: novoComentario,
        ID_LOCAL: local.ID_LOCAL,
      };

      await axios.post('https://pint-backend-5gz8.onrender.com/comentarios_local/create', comentarioData);
      Swal.fire({
        title: 'Comentário enviado!',
        text: 'O seu comentário aguarda confirmação.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      setNovoComentario('');

      const comentariosResponse = await axios.get(`https://pint-backend-5gz8.onrender.com/comentarios_local/listlocal/${id}`);
      setComentarios(comentariosResponse.data);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      setErro('Erro ao adicionar comentário.');
    }
  };

  const handleDeleteComentario = async (idComentario) => {
    try {
      await axios.put(`https://pint-backend-5gz8.onrender.com/comentarios_local/invalidar/${idComentario}`);
      setComentarios(prevComentarios => prevComentarios.filter(comentario => comentario.ID_COMENTARIO !== idComentario));
    } catch (error) {
      console.error('Erro ao apagar comentário:', error);
      setErro('Erro ao apagar comentário.');
    }
  };

  if (erro) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {erro}
        </div>
      </div>
    );
  }

  if (!local) {
    return null;
  }
  const getPrecoSymbol = (preco) => {
    if (preco === 0) {
      return 'Gratuito/Entrada Livre';
    } else if (preco > 0 && preco <= 10) {
      return '€-€€';
    } else if (preco > 10 && preco <= 100) {
      return '€€-€€€';
    } else if (preco > 100 && preco <= 1000) {
      return '€€€-€€€€';
    } else {
      return '€€€€+';
    }
  };

  return (
    <div className="container mt-4">
      <h1>Detalhes do Estabelecimento</h1>
      <div className="card shadow-lg p-3 mb-5 bg-white rounded">
        {local.foto && (
          <img
            src={`https://pint-backend-5gz8.onrender.com/${local.foto}`}
            className="card-img-top img-local-detalhes"
            alt={local.DESIGNACAO_LOCAL}
          />
        )}
        <div className="card-body">
          <h2 className="card-title">{local.DESIGNACAO_LOCAL}</h2>

          <div className="map-container mt-4">
            <div ref={mapRef} style={{ height: '300px', width: '100%' }}></div>
          </div>

          {averageReview > 0 && (
            <p className="card-text">
              <strong>Avaliação Média:</strong> {renderStars(averageReview)}
              <span> ({totalReviews} avaliações)</span>
            </p>
          )}
          <p className="card-text">
            <strong>Preço por pessoa:</strong> {getPrecoSymbol(local.PRECO)}
          </p>
          {local.area && (
            <p className="card-text"><strong>Área:</strong> {local.area.NOME_AREA}</p>
          )}
          <p className="card-text">
            <strong>Sub-Área:</strong> {local.sub_area ? local.sub_area.NOME_SUBAREA : "Sub Área não associada"}
          </p>

          <button className="btn btn-primary mt-3" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? 'Cancelar' : 'Adicionar Review'}
          </button>

          {showReviewForm && (
            <div className="mt-3">
              <div className="form-group">
                <label htmlFor="reviewInput">Insira sua avaliação (0 a 5):</label>
                <input
                  type="number"
                  className="form-control"
                  id="reviewInput"
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  min="0"
                  max="5"
                  step="0.1"
                  required
                />
              </div>
              <button className="btn btn-success mt-2" onClick={handleSubmitReview}>
                Enviar Review
              </button>
            </div>
          )}
        </div>
      </div>
      <h2 className="mt-3 mb-4 text-center">Compartilhar Evento</h2>
      <div className="d-flex justify-content-center mb-4">
        <FacebookShareButton url={shareUrl} quote={title} className="me-3">
          <FacebookIcon size={40} round />
        </FacebookShareButton>
        <TwitterShareButton url={shareUrl} title={title} className="me-3">
          <TwitterIcon size={40} round />
        </TwitterShareButton>
        <LinkedinShareButton url={shareUrl} title={title} className="me-3">
          <LinkedinIcon size={40} round />
        </LinkedinShareButton>
        <WhatsappShareButton url={shareUrl} title={title} separator=":: " className="me-3">
          <WhatsappIcon size={40} round />
        </WhatsappShareButton>
        <a href={teamsShareUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
          <img src="https://img.icons8.com/color/48/000000/microsoft-teams.png" alt="Teams" style={{ width: '30px', height: '30px' }} />
        </a>
      </div>
      <hr style={{ width: '80%', marginLeft: '10%' }}></hr>
      <h1 className="mt-5 mb-4 text-center">Comentários</h1>
      <div className="container mt-4 mb-5">
        {comentarios.length > 0 ? (
          comentarios.map((comentario) => (
            <div key={comentario.ID_COMENTARIO} className="card mb-3">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p className='card-text'>Utilizador: {comentario.User.user_name}</p>
                    <p className="card-text">{comentario.DESCRICAO}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className="card-text text-muted" style={{ fontSize: '0.8em', marginRight: '10px' }}>
                      {new Date(comentario.DATA_COMENTARIO).toLocaleDateString()}
                    </p>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComentario(comentario.ID_COMENTARIO)}>
                      Invalidar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">Nenhum comentário encontrado.</p>
        )}
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddComentario}>
            Comentar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalhesLocal;
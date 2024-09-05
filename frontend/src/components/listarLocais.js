import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const ListarLocais = () => {
  const [locais, setLocais] = useState([]);
  const [error, setError] = useState('');
  const [totalReviews, setTotalReviews] = useState(0); // Novo estado para o número de avaliações

  useEffect(() => {
    fetchUserIdAndLocais();
  }, []);

  const fetchUserIdAndLocais = async () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('Token de autenticação não encontrado.');
      return;
    }

    try {
      const userResponse = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
        headers: {
          'x-auth-token': token
        }
      });
      const idCentro = userResponse.data.ID_CENTRO;

      if (!idCentro) {
        setError('ID do Centro não encontrado.');
        return;
      }

      const userId = userResponse.data.ID_FUNCIONARIO;
      if (!userId) throw new Error('Erro ao obter dados do usuário ou centro.');

      const locaisResponse = await axios.get(`https://pintfinal-backend.onrender.com/locais/user/${userId}/centro`, {
        headers: {
          'x-auth-token': token
        },
        params: {
          ID_CENTRO: idCentro
        }
      });

      const locaisWithCityAndReview = await Promise.all(
        locaisResponse.data.map(async (local) => {
          const city = await getCityFromCoordinates(local.LOCALIZACAO);

          // Buscando a média de reviews para cada local
          const averageReviewResponse = await axios.get(`https://pintfinal-backend.onrender.com/review/average/local/${local.ID_LOCAL}`);
          const averageReview = averageReviewResponse.data.averageReview || 0;

          // Buscando o total de reviews para cada local
          const totalReviewsResponse = await axios.get(`https://pintfinal-backend.onrender.com/review/local/get/${local.ID_LOCAL}`);
          const totalReviews = totalReviewsResponse.data.count || 0;  // Use o valor de 'count' corretamente

          return { ...local, cidade: city, averageReview, totalReviews }; // Armazene totalReviews no objeto 'local'
        })
      );

      setLocais(locaisWithCityAndReview);

    } catch (error) {
      setError('Erro ao carregar os dados.');
      console.error('Erro ao carregar os dados:', error);
    }
  };


  const getCityFromCoordinates = async (coordinates) => {
    const [latitude, longitude] = coordinates.split(',').map(coord => coord.trim());
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json'
        }
      });
      return response.data.address.city || response.data.address.town || response.data.address.village || 'Cidade Desconhecida';
    } catch (error) {
      console.error('Erro ao obter cidade das coordenadas:', error);
      return 'Cidade Desconhecida';
    }
  };

  const deleteLocal = async (id) => {
    try {
      await axios.put(`https://pintfinal-backend.onrender.com/locais/invalidate/${id}`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });
      setLocais(locais.filter(local => local.ID_LOCAL !== id));
      Swal.fire({
        icon: 'success',
        title: 'Invalidado!',
        text: 'O local foi Invalidado com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao Invalidar local:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao Invalidar o local.'
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
        deleteLocal(id);
      }
    });
  };

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

  return (
    <div className="container mt-4">
      <h1>Lista de Estabelecimentos</h1>
      <Link to={`/locais/create`} className="btn btn-primary" style={{ color: 'white' }}>
        Adicionar Estabelecimento
      </Link>
      <div className="row">
        {locais.map((local) => (
          <div className="col-md-3 mt-4" key={local.ID_LOCAL}>
            <div className="card mb-4 h-100 d-flex flex-column">
              <Link to={`/locais/get/${local.ID_LOCAL}`}>
                {local.foto && (
                  <img
                    src={`https://pintfinal-backend.onrender.com/${local.foto}`}
                    className="card-img-top img-fixa-locais-lista"
                    alt={local.DESIGNACAO_LOCAL}
                  />
                )}
              </Link>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{local.DESIGNACAO_LOCAL}</h5>
                <p className="card-text flex-grow-1"><strong>Localização:</strong> {local.cidade || 'Cidade Desconhecida'}</p>
                {/* Exibir média de avaliações se houver */}
                {local.averageReview > 0 && (
                  <p className="card-text">
                    <strong>Avaliação Média:</strong> {renderStars(local.averageReview)}
                    <span> ({local.totalReviews} avaliações)</span> {/* Use local.totalReviews aqui */}
                  </p>
                )}
                {local.area && (
                  <p className="card-text"><strong>Área:</strong> {local.area.NOME_AREA}</p>
                )}
                {local.sub_area && (
                  <p className="card-text"><strong>Sub-Área:</strong> {local.sub_area.NOME_SUBAREA}</p>
                )}
                <button
                  onClick={() => confirmDelete(local.ID_LOCAL)}
                  className="btn btn-danger mt-auto"
                  style={{ float: 'right' }}
                >
                  <p className="card-text flex-grow-1">Invalidar</p>
                </button>
                <Link to={`/locais/edit/${local.ID_LOCAL}`} className="btn btn-warning mt-2" style={{ color: 'white' }}>
                  Editar Local
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};

export default ListarLocais;

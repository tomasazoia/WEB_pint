import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PaginaLogin from "./routes/PaginaLogin";
import PaginaRegistar from "./routes/PaginaRegistar";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Inclui tanto o Popper quanto o Bootstrap JavaScript

import PaginaListarCentros from "./routes/PaginaListarCentros";
import PaginaListarEventos from "./routes/PaginaListarEventos"; 
import PaginaCriarEvento from "./routes/PaginaCriarEvento";
import PaginaGerirEventos from "./routes/PaginaGerirEventos"; 
import PaginaDetalheEvento from "./routes/PaginaDetalheEvento";
import PaginaListarLocais from "./routes/PaginaListarLocais";
import PaginaDetalheLocal from "./routes/PaginaDetalheLocal";
import PaginaCriarLocal from "./routes/PaginaCriarLocal";
import PaginaPerfil from "./routes/PaginaPerfil";
import PaginaGerirUtilizadores from "./routes/PaginaGerirUtilizadores";
import PaginaDashboard from "./routes/Dashboard";
import PaginaEditarLocal from './routes/PaginaEditarLocal';
import PaginaValidarUtilizadores from "./routes/PaginaUtilizadoresNaoValidados";
import PaginaCalendario from "./routes/Calendario";
import PaginaCriarCentro from "./routes/PaginaCriarCentro";
import PaginaValidarLocais from "./routes/PaginaValidarLocais";
import PaginaValidarComentarios from "./routes/PaginaValidarComentarios";
import PaginaCriarArea from "./routes/PaginaCriarArea";
import PaginaReset from "./routes/RestPass";
import PaginaValidarComentariosLocal from "./routes/ValidarComentarioLocal";
import PaginaGerirSubAreas from "./routes/PaginaGerirSubAreas";
import LocaisPorSubArea from "./components/locaisPorSubArea";
import PaginaLocaisPorSubArea from "./routes/PaginaListarLocaisSubArea";
import PaginaLocaisPorAreaa from "./routes/PaginaListarLocaisPorArea";
import LocaisArea from "./routes/PaginaListarLocaisPorArea";
import AlbumFotos from "./routes/PaginaAlbumFotos";
import ResetPassword from "./routes/PaginaEsqueciPass";
import Notificacoes from "./routes/PaginaNotificacoes";
import Formularios from "./routes/PaginaGerirFormularios";
import PaginaPrimeiro from "./routes/PaginaPrimieroLogin";
import PaginaRegisterGoogle from "./routes/PaginaRegisterGoogle";
import Promover from "./routes/PromoverUser";
import Infos from "./routes/InformacoesEAvisos";
import ReportEventos from "./routes/ReportsEventos";
import ReportLocais from "./routes/ReportLocais";
import EditarEvento from "./routes/EditarEvento";
import ValidarComentariosForum from "./routes/ValidarComentariosForum";
import ReportForuns from "./routes/ReportsForuns";

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token'); // Alterado para sessionStorage
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const token = sessionStorage.getItem('token'); // Alterado para sessionStorage

  return (
    <Router>
      <div id="root">
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/login" /> : <PaginaLogin />} />
          <Route path="/register" element={<PaginaRegistar />} />
          <Route path="/forgot-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <PaginaDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/validarcomfor"
            element={
              <PrivateRoute>
                <ValidarComentariosForum />
              </PrivateRoute>
            }
          />
          <Route
            path="/reportLocais"
            element={
              <PrivateRoute>
                <ReportLocais />
              </PrivateRoute>
            }
          />
          <Route
            path="/reportEventos"
            element={
              <PrivateRoute>
                <ReportEventos />
              </PrivateRoute>
            }
          />
          <Route
            path="/reportForuns"
            element={
              <PrivateRoute>
                <ReportForuns />
              </PrivateRoute>
            }
          />
          <Route
            path="/infos"
            element={
              <PrivateRoute>
                <Infos />
              </PrivateRoute>
            }
          />
          <Route
            path="/promover"
            element={
              <PrivateRoute>
                <Promover />
              </PrivateRoute>
            }
          />
          <Route
            path="/formularios"
            element={
              <PrivateRoute>
                <Formularios />
              </PrivateRoute>
            }
          />
          <Route
            path="/notificacoes"
            element={
              <PrivateRoute>
                <Notificacoes />
              </PrivateRoute>
            }
          />
          <Route
            path="/album/:id"
            element={
              <PrivateRoute>
                <AlbumFotos />
              </PrivateRoute>
            }
          />
          <Route
            path="/centro/list"
            element={
              <PrivateRoute>
                <PaginaListarCentros />
              </PrivateRoute>
            }
          />
          <Route path="/locais/listsubarea/:subAreaId" component={LocaisPorSubArea} element={
              <PrivateRoute>
                <PaginaLocaisPorSubArea />
              </PrivateRoute>
            }/>
            <Route path="/locais/listarea/:areaid" component={LocaisArea} element={
              <PrivateRoute>
                <PaginaLocaisPorAreaa />
              </PrivateRoute>
            }/>
          <Route
            path="/area/create"
            element={
              <PrivateRoute>
                <PaginaCriarArea />
              </PrivateRoute>
            }
          />
          <Route
            path="/evento/list"
            element={
              <PrivateRoute>
                <PaginaListarEventos />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/list"
            element={
              <PrivateRoute>
                <PaginaGerirUtilizadores />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <PrivateRoute>
                <PaginaPerfil />
              </PrivateRoute>
            }
          />
          <Route
            path="/evento/create"
            element={
              <PrivateRoute>
                <PaginaCriarEvento />
              </PrivateRoute>
            }
          />
          <Route
            path="/subarea/create"
            element={
              <PrivateRoute>
                <PaginaGerirSubAreas />
              </PrivateRoute>
            }
          />
          <Route
            path="/evento/manage"
            element={
              <PrivateRoute>
                <PaginaGerirEventos />
              </PrivateRoute>
            }
          />
          <Route
            path="/evento/get/:id"
            element={
              <PrivateRoute>
                <PaginaDetalheEvento />
              </PrivateRoute>
            }
          />
          <Route
            path="/locais/list"
            element={
              <PrivateRoute>
                <PaginaListarLocais />
              </PrivateRoute>
            }
          />
          <Route
            path="/locais/get/:id"
            element={
              <PrivateRoute>
                <PaginaDetalheLocal />
              </PrivateRoute>
            }
          />
          <Route
            path="/locais/create"
            element={
              <PrivateRoute>
                <PaginaCriarLocal />
              </PrivateRoute>
            }
          />
          <Route
            path="/locais/edit/:id"
            element={
              <PrivateRoute>
                <PaginaEditarLocal />
              </PrivateRoute>
            }
          />
          <Route
            path="/eventos/edit/:id"
            element={
              <PrivateRoute>
                <EditarEvento />
              </PrivateRoute>
            }
          />
          <Route
            path="/locais/validarlocais"
            element={
              <PrivateRoute>
                <PaginaValidarLocais />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/listNVal"
            element={
              <PrivateRoute>
                <PaginaValidarUtilizadores />
              </PrivateRoute>
            }
          />
          <Route
            path="/comentariosinv"
            element={
              <PrivateRoute>
                <PaginaValidarComentarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/comentariosinvlocal"
            element={
              <PrivateRoute>
                <PaginaValidarComentariosLocal />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendario"
            element={
              <PrivateRoute>
                <PaginaCalendario />
              </PrivateRoute>
            }
          />
          <Route
            path="/centro/create"
            element={
              <PrivateRoute>
                <PaginaCriarCentro />
              </PrivateRoute>
            }
          />
          <Route
            path="/auth/change-password"
            element={
              <PrivateRoute>
                <PaginaReset/>
              </PrivateRoute>
            }
          />
          <Route
            path="/auth/primeiro-login"
            element={
              <PrivateRoute>
                <PaginaPrimeiro/>
              </PrivateRoute>
            }
          />
          <Route
            path="/auth/register-google"
            element={
              <PrivateRoute>
                <PaginaRegisterGoogle/>
              </PrivateRoute>
            }
          />
          <Route path="/" element={token ? <PaginaDashboard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

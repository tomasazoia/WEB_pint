import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const EsqueciPass = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);

  const handleRequestReset = async () => {
    try {
      await axios.post('https://pintfinal-backend.onrender.com/auth/request-password-reset', { user_mail: email });
      Swal.fire('Sucesso', 'Código de recuperação enviado para o seu e-mail.', 'success');
      setStep(2);
    } catch (error) {
      Swal.fire('Erro', 'Erro ao solicitar recuperação de palavra-passe.', 'error');
    }
  };

  const handleConfirmCode = async () => {
    try {
      await axios.post('https://pintfinal-backend.onrender.com/auth/confirm-reset-code', { user_mail: email, resetCode: code });
      Swal.fire('Sucesso', 'Código validado com sucesso.', 'success');
      setStep(3);
    } catch (error) {
      Swal.fire('Erro', 'Código de recuperação inválido.', 'error');
    }
  };

  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      await axios.post('https://pintfinal-backend.onrender.com/auth/reset-password', { user_mail: email, new_password: newPassword });
      Swal.fire('Sucesso', 'palavra-passe redefinida com sucesso.', 'success').then(() => {
        navigate('/login'); // Redirecione para a página de login após o sucesso
      });
      setStep(1);
      setEmail('');
      setCode('');
      setNewPassword('');
    } catch (error) {
      Swal.fire('Erro', 'Erro ao redefinir palavra-passe.', 'error');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Recuperação de palavra-passe</h2>
              
              {step === 1 && (
                <>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">E-mail:</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button onClick={handleRequestReset} className="btn btn-primary w-100">Solicitar Código</button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="mb-3">
                    <label htmlFor="code" className="form-label">Código de Recuperação:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                  <button onClick={handleConfirmCode} className="btn btn-primary w-100">Confirmar Código</button>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Nova palavra-passe:</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button onClick={handleResetPassword} className="btn btn-primary w-100">Redefinir palavra-passe</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EsqueciPass;

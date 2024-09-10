const User = require('../models/users');
const Centro = require('../models/centro');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'pint.softinsa@gmail.com',
    pass: 'fovv taph aotg vwce', // Considerar uso de variáveis de ambiente para maior segurança
  },
});


const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendResetCodeEmail = async (user_mail, resetCode) => {
  await transporter.sendMail({
    from: '"SoftShares" <pint.softinsa@gmail.com>',
    to: user_mail,
    subject: "Recuperação de palavra-passe - Código de Verificação",
    text: `Prezado(a) Cliente,

Recebemos uma solicitação para redefinir a palavra-passe da sua conta. Para concluir este processo, por favor, utilize o seguinte código de verificação:

Código de Verificação: ${resetCode}

Se você não solicitou esta alteração, por favor, desconsidere este e-mail.

Atenciosamente,
Equipe SoftShares`,
  });
};

// Rota para solicitar a recuperação de palavra-passe
const requestPasswordReset = async (req, res) => {
  const { user_mail } = req.body;

  try {
    const user = await User.findOne({ where: { user_mail } });

    if (!user) {
      return res.status(400).json({ message: 'Utilizador não encontrado.' });
    }

    const resetCode = generateResetCode();
    const hashedResetCode = await bcrypt.hash(resetCode, 10);

    await User.update(
      { reset_password_code: hashedResetCode },
      { where: { user_id: user.user_id } }
    );

    await sendResetCodeEmail(user_mail, resetCode);

    res.status(200).json({ message: 'Código de recuperação enviado para o e-mail.' });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de palavra-passe:', error);
    res.status(500).json({ message: 'Erro ao solicitar redefinição de palavra-passe.' });
  }
};

// Rota para confirmar o código de recuperação
const confirmResetCode = async (req, res) => {
  const { user_mail, resetCode } = req.body;

  try {
    const user = await User.findOne({ where: { user_mail } });

    if (!user) {
      return res.status(400).json({ message: 'Utilizador não encontrado.' });
    }

    // Verifique se o código de recuperação está definido
    if (!user.reset_password_code) {
      return res.status(400).json({ message: 'Código de recuperação não foi solicitado ou já utilizado.' });
    }

    // Comparar o código fornecido com o código hash armazenado
    const isCodeValid = await bcrypt.compare(resetCode, user.reset_password_code);

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Código de recuperação inválido.' });
    }

    res.status(200).json({ message: 'Código validado com sucesso.' });
  } catch (error) {
    console.error('Erro ao validar código de recuperação:', error);
    res.status(500).json({ message: 'Erro ao validar código de recuperação.' });
  }
};


// Rota para redefinir a palavra-passe
const resetPassword = async (req, res) => {
  const { user_mail, new_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await User.update(
      { user_password: hashedPassword, reset_password_code: null },
      { where: { user_mail } }
    );

    res.status(200).json({ message: 'palavra-passe redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir palavra-passe:', error);
    res.status(500).json({ message: 'Erro ao redefinir palavra-passe.' });
  }
};











































const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);  // Gera uma palavra-passe aleatória de 8 caracteres
};

const sendPasswordEmail = async (user_mail, generatedPassword) => {
  // Configuração do serviço de e-mail
  let transporter = nodemailer.createTransport({
    service: 'Gmail',  // ou o serviço de e-mail que você estiver usando
    auth: {
      user: 'pint.softinsa@gmail.com',
      pass: 'fovv taph aotg vwce ',
    },
  });

  let info = await transporter.sendMail({
    from: '"SoftShares" <your-email@gmail.com>',
    to: user_mail,
    subject: "Bem-vindo(a) à SoftShares!",
    text: `
    Olá,

    Seja bem-vindo(a) à SoftShares! Estamos felizes em tê-lo(a) connosco.

    A sua conta foi criada com sucesso. Para acessar a plataforma, utilize a palavra-passe temporária fornecida abaixo:

    palavra-passe temporária: ${generatedPassword}

    Por razões de segurança, recomendamos que você altere sua palavra-passe assim que fizer login pela primeira vez. Pode fazer isso acessando a seção de "Redefinir palavra-passe" após o login.

    Caso tenha alguma dúvida ou precise de assistência, não hesite em entrar em contato com a nossa equipa de suporte.

    Atenciosamente,
    Equipa SoftShares

    ---
    Este é um e-mail automático, por favor, não responda a este endereço.
    `,
  });


  console.log("Email enviado: %s", info.messageId);
};




const create = async (req, res) => {
  const { user_name, user_mail, NIF, MORADA, NTELEMOVEL, ID_CENTRO } = req.body;

  if (!user_name || !user_mail || !NIF) {
    return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
    const existingUser = await User.findOne({ where: { user_mail } });

    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já está em uso.' });
    }

    const existingUser1 = await User.findOne({ where: { NIF } });

    if (existingUser1) {
      return res.status(400).json({ message: 'NIF já está em uso.' });
    }

    const existingUser2 = await User.findOne({ where: { NTELEMOVEL } });

    if (existingUser2) {
      return res.status(400).json({ message: 'Número de Telemóvel já está em uso.' });
    }

    // Gerar palavra-passe aleatória
    const generatedPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = await User.create({
      user_name,
      user_mail,
      user_password: hashedPassword,
      email_confirmed: false,
      NIF,
      MORADA,
      NTELEMOVEL,
      ADMINISTRADOR: false,
      DATAINICIO: new Date(),
      ID_CENTRO,
      reset_password: true,
    });

    // Enviar email com a palavra-passe gerada
    await sendPasswordEmail(user_mail, generatedPassword);

    res.status(201).json({ message: 'Utilizador criado com sucesso. Uma palavra-passe temporária foi enviada para o seu email.', user: newUser });
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    res.status(500).json({ message: 'Erro ao criar utilizador.', error: error.message });
  }
};

const login = async (req, res) => {
  const { user_mail, user_password } = req.body;

  if (!user_mail || !user_password) {
    return res.status(400).json({ message: 'E-mail e palavra-passe são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { user_mail } });

    if (!user) {
      return res.status(400).json({ message: 'Utilizador não encontrado.' });
    }

    // Verifique se o usuário é administrador
    
    if (!user.ADMINISTRADOR) {
      return res.status(403).json({ message: 'Acesso restrito a administradores.' });
    }

    const isPasswordValid = await bcrypt.compare(user_password, user.user_password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'palavra-passe incorreta.' });
    }

    const token = jwt.sign({ user_id: user.user_id, user_mail: user.user_mail }, SECRET_KEY, { expiresIn: '1h' });

    // Verifique se é o primeiro login
    if (user.reset_password) {
      // Atualize o campo reset_password para false após o primeiro login
      await User.update({ reset_password: false }, { where: { user_id: user.user_id } });
      return res.status(200).json({ message: 'Login bem-sucedido. Primeiro login.', token, firstLogin: true });
    } else {
      return res.status(200).json({ message: 'Login bem-sucedido.', token, firstLogin: false });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro ao fazer login.' });
  }
};

const loginMobile = async (req, res) => {
  const { user_mail, user_password } = req.body;

  if (!user_mail || !user_password) {
    return res.status(400).json({ message: 'E-mail e palavra-passe são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { user_mail } });

    if (!user) {
      return res.status(400).json({ message: 'Utilizador não encontrado.' });
    }

    // Check if the user is validated by an administrator
    if (!user.VALIDAR) {
      return res.status(403).json({ message: 'Utilizador não validado por um administrador.' });
    }

    const isPasswordValid = await bcrypt.compare(user_password, user.user_password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'palavra-passe incorreta.' });
    }

    const token = jwt.sign({ user_id: user.user_id, user_mail: user.user_mail }, SECRET_KEY, { expiresIn: '1h' });

    // Verifique se é o primeiro login
    if (user.reset_password) {
      // Atualize o campo reset_password para false após o primeiro login
      await User.update({ reset_password: false }, { where: { user_id: user.user_id } });
      return res.status(200).json({ message: 'Login bem-sucedido. Primeiro login.', token, firstLogin: true });
    } else {
      return res.status(200).json({ message: 'Login bem-sucedido.', token, firstLogin: false });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro ao fazer login.' });
  }
};




const sendWelcomeEmail = async (user_mail, user_name) => {
  // Configuração do serviço de e-mail
  let transporter = nodemailer.createTransport({
    service: 'Gmail',  // ou o serviço de e-mail que você estiver usando
    auth: {
      user: 'pint.softinsa@gmail.com',
      pass: 'fovv taph aotg vwce',
    },
  });

  let info = await transporter.sendMail({
    from: '"SoftShares" <pint.softinsa@gmail.com>',
    to: user_mail,
    subject: "Bem-vindo(a) à SoftShares!",
    text: `
    Olá ${user_name},

    Seja bem-vindo(a) à SoftShares! Estamos felizes em tê-lo(a) connosco.

    A sua conta foi criada com sucesso. Agora, pode explorar a nossa plataforma e aproveitar todos os recursos disponíveis.

    Caso tenha alguma dúvida ou precise de assistência, não hesite em entrar em contato com a nossa equipa de suporte.

    Atenciosamente,
    Equipa SoftShares

    ---
    Este é um e-mail automático, por favor, não responda a este endereço.
    `,
  });

  console.log("Email enviado: %s", info.messageId);
};













const googleLogin = async (req, res) => {
  const { user_mail, user_name, user_photo } = req.body;

  try {
    let user = await User.findOne({ where: { user_mail } });
    let firstLogin = false;

    if (!user) {
      // Criar um novo utilizador (primeiro login)
      user = await User.create({
        user_name,
        user_mail,
        user_password: null,
        email_confirmed: true,
        reset_password: true, // Primeiro login, precisa redefinir a palavra-passe
        NIF: 123456789, // Defina um NIF padrão ou inválido
        DATAINICIO: new Date(), // Defina a data atual como valor padrão para DATAINICIO
        MORADA: 'Endereço não fornecido', // Ou qualquer valor padrão apropriado
        NTELEMOVEL: 0, // Número de telefone padrão ou inválido
        ADMINISTRADOR: false, // Valor padrão para o campo ADMINISTRADOR
        VALIDAR: false,
        ID_CENTRO: null,  // Valor padrão para o campo ID_CENTRO
      });
      firstLogin = true;

      // Enviar o e-mail de boas-vindas apenas para novos utilizadores
      await sendWelcomeEmail(user_mail, user_name);
    } else {
      // Se o usuário existe, verificar se é administrador
      if (!user.ADMINISTRADOR) {
        return res.status(403).json({ message: 'Acesso restrito a administradores.' });
      }

      if (user.reset_password) {
        // Se o usuário já existe e reset_password é true, é o primeiro login
        firstLogin = false;

        // Atualizar o campo reset_password para false após o primeiro login
        await User.update({ reset_password: false }, { where: { user_id: user.user_id } });

        // Opcional: recarregar o usuário para garantir que temos a versão atualizada
        user = await User.findOne({ where: { user_mail } });
      }
    }

    // Gerar o token JWT
    const token = jwt.sign({ user_id: user.user_id, user_mail: user.user_mail }, SECRET_KEY, { expiresIn: '1h' });

    // Retornar a resposta com o token e a flag firstLogin
    res.status(200).json({ message: 'Login com Google bem-sucedido.', token, firstLogin });
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    res.status(500).json({ message: 'Erro ao fazer login com Google.' });
  }
};


const googleLoginMobile = async (req, res) => {
  const { user_mail, user_name, user_photo } = req.body;

  try {
    let user = await User.findOne({ where: { user_mail } });
    let firstLogin = false;

    if (!user) {
      // Criar um novo utilizador (primeiro login)
      user = await User.create({
        user_name,
        user_mail,
        user_password: null,
        email_confirmed: true,
        reset_password: true, // Primeiro login, precisa redefinir a senha
        NIF: 123456789, // Defina um NIF padrão ou inválido
        DATAINICIO: new Date(), // Defina a data atual como valor padrão para DATAINICIO
        MORADA: 'Endereço não fornecido', // Ou qualquer valor padrão apropriado
        NTELEMOVEL: 0, // Número de telefone padrão ou inválido
        ADMINISTRADOR: false, // Valor padrão para o campo ADMINISTRADOR
        VALIDAR: false,
        ID_CENTRO: null,  // Valor padrão para o campo ID_CENTRO
      });
      firstLogin = true;

      // Enviar o e-mail de boas-vindas apenas para novos utilizadores
      await sendWelcomeEmail(user_mail, user_name);
    } else if (user.reset_password) {
      // Se o usuário já existe e reset_password é true, é o primeiro login
      firstLogin = false;

      // Atualizar o campo reset_password para false após o primeiro login
      await User.update({ reset_password: false }, { where: { user_id: user.user_id } });

      // Opcional: recarregar o usuário para garantir que temos a versão atualizada
      user = await User.findOne({ where: { user_mail } });
    }

    // Gerar o token JWT
    const token = jwt.sign({ user_id: user.user_id, user_mail: user.user_mail }, SECRET_KEY, { expiresIn: '1h' });

    // Retornar a resposta com o token, a flag firstLogin e o status VALIDAR
    res.status(200).json({ 
      message: 'Login com Google bem-sucedido.', 
      token, 
      firstLogin, 
      isValid: user.VALIDAR  // Adicionar campo isValid à resposta
    });
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    res.status(500).json({ message: 'Erro ao fazer login com Google.' });
  }
};

const facebookLogin = async (req, res) => {
  const { user_mail, user_name, user_photo } = req.body;

  try {
    let user = await User.findOne({ where: { user_mail } });
    let firstLogin = false;

    if (!user) {
      // Se o utilizador não existir, cria um novo utilizador (primeiro login)
      user = await User.create({
        user_name,
        user_mail,
        user_password: null,
        email_confirmed: true,
        reset_password: true,  // Indica que é o primeiro login e precisa redefinir a palavra-passe
        NIF: '000000000', // Defina um NIF padrão ou inválido, caso necessário
        DATAINICIO: new Date(), // Data atual como valor padrão para DATAINICIO
        MORADA: 'Endereço não fornecido', // Valor padrão para MORADA
        NTELEMOVEL: '000000000', // Número de telefone padrão ou inválido
        ADMINISTRADOR: false, // Valor padrão para ADMINISTRADOR
        VALIDAR: false, // Valor padrão para VALIDAR
        ID_CENTRO: null,  // Valor padrão para ID_CENTRO
      });
      firstLogin = true;

      // Enviar o e-mail de boas-vindas apenas para novos utilizadores
      await sendWelcomeEmail(user_mail, user_name);
    } else if (user.reset_password) {
      // Se o usuário já existe e reset_password é true, é o primeiro login
      firstLogin = true;

      // Atualizar o campo reset_password para false após o primeiro login
      await User.update({ reset_password: false }, { where: { user_id: user.user_id } });

      // Opcional: recarregar o usuário para garantir que temos a versão atualizada
      user = await User.findOne({ where: { user_mail } });
    }

    // Gerar o token JWT
    const token = jwt.sign({ user_id: user.user_id, user_mail: user.user_mail }, SECRET_KEY, { expiresIn: '1h' });

    // Retornar a resposta com o token e a flag firstLogin
    res.status(200).json({ message: 'Login com Facebook bem-sucedido.', token, firstLogin });
  } catch (error) {
    console.error('Erro ao fazer login com Facebook:', error);
    res.status(500).json({ message: 'Erro ao fazer login com Facebook.' });
  }
};



const changePassword = async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    const { oldPassword, newPassword } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user_id;

    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.user_password);

    if (!isMatch) {
      return res.status(400).json({ message: 'palavra-passe antiga incorreta.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.user_password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'palavra-passe alterada com sucesso.' });
  } catch (error) {
    console.error('Erro ao alterar a palavra-passe do utilizador:', error);
    res.status(500).json({ message: 'Erro ao alterar a palavra-passe do utilizador.', error: error.message });
  }
};

const updateUserCenter = async (req, res) => {
  const { user_id } = req.user;  // Assumes the user_id is obtained from the token
  const { ID_CENTRO } = req.body;

  try {
    // Ensure the center is valid
    const center = await Center.findOne({ where: { ID_CENTRO } });
    if (!center) {
      return res.status(400).json({ message: 'Invalid center.' });
    }

    await User.update({ ID_CENTRO }, { where: { user_id } });

    res.status(200).json({ message: 'User center updated successfully.' });
  } catch (error) {
    console.error('Error updating user center:', error);
    res.status(500).json({ message: 'Error updating user center.' });
  }
};


module.exports = {
  create,
  login,
  loginMobile,
  googleLogin,
  googleLoginMobile,
  facebookLogin,
  requestPasswordReset,
  confirmResetCode,
  resetPassword,
  updateUserCenter,
  changePassword
};
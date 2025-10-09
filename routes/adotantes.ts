import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 

import nodemailer from 'nodemailer'; // Importando nodemailer
import crypto from 'crypto'; // Para gerar um código aleatório

const prisma = new PrismaClient();
const router = Router();


const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_muito_forte_e_longo'; 

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar users:", error);
    res.status(500).json({ erro: "Erro ao buscar users." });
  }
});

function validaSenha(senha: string) {
  const mensa: string[] = [];

  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres");
  }

  let pequenas = 0;
  let grandes = 0;
  let numeros = 0;
  let simbolos = 0;

  for (const letra of senha) {
    if ((/[a-z]/).test(letra)) {
      pequenas++;
    } else if ((/[A-Z]/).test(letra)) {
      grandes++;
    } else if ((/[0-9]/).test(letra)) {
      numeros++;
    } else {
      simbolos++;
    }
  }

  if (pequenas === 0 || grandes === 0 || numeros === 0 || simbolos === 0) {
    mensa.push("Erro... senha deve possuir letras minúsculas, maiúsculas, números e símbolos");
  }

  return mensa;
}

router.post("/", async (req, res) => {
  const { nome, fone, endereco, email, senha } = req.body;

  if (!nome || !fone || !endereco || !email || !senha) {
    return res.status(400).json({ erro: "Informe nome, fone, endereco, email e senha" });
  }

  const erros = validaSenha(senha);
  if (erros.length > 0) {
    return res.status(400).json({ erro: erros.join("; ") });
  }

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(senha, salt);

  try {
    const user = await prisma.user.create({
      data: { nome, fone, endereco, email, senha: hash }
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar user:", error);
    res.status(500).json({ erro: "Erro ao criar user." });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha, persist } = req.body;
  const mensaPadrao = "Login ou senha incorretos";

  if (!email || !senha) {
    return res.status(400).json({ erro: mensaPadrao });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !bcrypt.compareSync(senha, user.senha)) {
      return res.status(400).json({ erro: mensaPadrao });
    }
const tempoToken = persist? "7d" : "2h";

    const token =jwt.sing(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: tempoToken }
    )

    
    res.status(200).json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      token
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ erro: "Erro ao fazer login." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ erro: "user não encontrado." });
    }

    res.status(200).json({
      id: user.id,
      nome: user.nome,
      email: user.email
    });
  } catch (error) {
    console.error("Erro ao buscar user:", error);
    res.status(500).json({ erro: "Erro ao buscar user." });
  }
});






async function enviaEmail(nome: string, email: string, descricao: string, resposta: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "7ded87001@smtp-brevo.com",
      pass: "H8ryhM4gntx7BdsG",
    },
  });

  const info = await transporter.sendMail({
    from: 'dieizonos@gmail.com',
    to: email,
    subject: "Re: Pedido de adoção",
    text: resposta,
    html: `<h3>Estimado user ${nome}</h3>
           <h3>Pedido: ${descricao}</h3>
           <p><strong>${resposta}</strong></p>
           <p>Nós da equipe Adote.com agradecemos seu interesse em adotar um de nossos amigos que aguardam um lar.</p>`
  });

  console.log("Mensagem enviada: %s", info.messageId);
}


router.post("/senha/solicitar-troca", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: "Informe o e-mail." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ erro: "user não encontrado." });
    }

    // Gerar um código de verificação
    const codigo = crypto.randomBytes(3).toString('hex'); // Gera um código de 6 caracteres
    // Armazenar o código e o email no banco de dados
    await prisma.user.update({
      where: { email },
      data: { recoveryCode: codigo } // Supondo que você tenha esse campo na tabela users
    });

    // Enviar o e-mail com o código
    const descricao = "Código para troca de senha"; // descrição do pedido
    const resposta = `Seu código para troca de senha é: ${codigo}`;
    await enviaEmail(user.nome, email, descricao, resposta);

    res.status(200).json({ mensagem: "Código enviado para o e-mail." });
  } catch (error) {
    console.error("Erro ao solicitar troca de senha:", error);
    res.status(500).json({ erro: "Erro ao solicitar troca de senha." });
  }
});

router.post("/senha/trocar", async (req, res) => {
  const { email, codigo, novaSenha } = req.body;

  if (!email || !codigo || !novaSenha) {
    return res.status(400).json({ erro: "Informe o e-mail, código e nova senha." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.recoveryCode !== codigo) {
      return res.status(400).json({ erro: "Código inválido ou user não encontrado." });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(novaSenha, salt);

    // Atualizar a senha e limpar o código
    await prisma.user.update({
      where: { email },
      data: {
        senha: hash,
        recoveryCode: null // Limpa o código após a troca
      }
    });

    res.status(200).json({ mensagem: "Senha trocada com sucesso." });
  } catch (error) {
    console.error("Erro ao trocar a senha:", error);
    res.status(500).json({ erro: "Erro ao trocar a senha." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const user = await prisma.user.delete({
      where: { id: String(id) }
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// router.get("/", async (req, res) => {
//   try {
//     const pedidos = await prisma.pedido.findMany(
//       {
//         include: { user: true, animal: true}
//       }
//     )
//     res.status(200).json(pedidos)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })
router.post("/", async (req, res) => {
    const { userId, animalId, descricao } = req.body;
    if (!userId || !animalId || !descricao) {
        res.status(400).json({ erro: "Informe userId, animalId e descrição!" });
        return;
    }
    try {
        const pedido = await prisma.pedido.create({
            data: { userId, animalId, descricao }
        });
        res.status(201).json(pedido);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// async function enviaEmail (nome: string, email: string, 
//                            descricao: string, resposta: string) {
//                             const transporter = nodemailer.createTransport({
//                               host: "smtp-relay.brevo.com",
//                               port: 587,
//                               secure: false, // true for port 465, false for other ports
//                               auth: {
//                                 user: "7ded87001@smtp-brevo.com",
//                                 pass: "H8ryhM4gntx7BdsG",
//                               },
// });
// const info = await transporter.sendMail({
//   from: 'dieizonos@gmail.com', // sender address
//   to: email, // list of receivers
//   subject: "Re: Pedido de adoção", // Subject line
//   text: resposta, // plain text body
//   html: `<h3>Estimado user ${nome}</h3>
//         <h3>Pedido: ${descricao} </h3>
//         <p>Nós da equipe Adote.com agradecemos seu interesse em adotar um de nossos
//         amigos que aguardam um lar. </p>`
//          // html body
// });
// // console.log("Message sent: %s", info.messageId);
// // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
// }
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { resposta } = req.body;
    if (!resposta) {
        res.status(400).json({ "erro": "Informe a resposta deste pedido." });
        return;
    }
    try {
        const pedido = await prisma.pedido.update({
            where: { id: Number(id) },
            data: { resposta }
        });
        const dados = await prisma.pedido.findUnique({
            where: { id: Number(id) },
            include: {
                user: true
            }
        });
        // // Envia o e-mail com os dados atualizados
        // enviaEmail(dados?.user.nome as string,
        //            dados?.user.email as string, 
        //            dados?.descricao as string,
        //            resposta)
        res.status(200).json(pedido);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query; // Obtém o userId da query string
        const pedidos = await prisma.pedido.findMany({
            where: {
                userId: userId ? String(userId) : undefined // Filtra os pedidos pelo userId
            },
            include: {
                user: true,
                animal: {
                    include: { especie: true,
                        user: true
                    }
                }
            }
        });
        res.status(200).json(pedidos);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const pedido = await prisma.pedido.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(pedido);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.default = router;

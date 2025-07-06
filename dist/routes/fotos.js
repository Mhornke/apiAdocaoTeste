"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// const prisma = new PrismaClient()
const prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'info',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
});
prisma.$on('query', (e) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
});
const router = (0, express_1.Router)();
router.get("/:animalId", async (req, res) => {
    const { animalId } = req.params;
    try {
        const fotos = await prisma.foto.findMany({
            where: { animalId: Number(animalId) }
        });
        res.status(200).json(fotos);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.post("/", async (req, res) => {
    const { descricao, animalId, codigoFoto } = req.body;
    if (!descricao || !animalId || !codigoFoto) {
        res.status(400).json({ erro: "Informe descricao, animalId e codigoFoto!" });
        return;
    }
    try {
        const foto = await prisma.foto.create({
            data: {
                descricao,
                animalId: Number(animalId),
                codigoFoto,
            }
        });
        res.status(201).json(foto);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// router.post("/", upload.single('codigoFoto'), async (req, res) => {
//   const { descricao, animalId } = req.body
//   const codigo = req.file?.buffer.toString("base64")
//   if (!descricao || !animalId || !codigo) {
//     res.status(400).json({ "erro": "Informe descricao, animalId e codigoFoto!" })
//     return
//   }
//   try {
//     const fotos = await prisma.foto.create({
//       data: { descricao, animalId: Number(animalId),
//               codigoFoto: codigo as string
//        }
//     })
//     res.status(201).json(fotos)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const fotos = await prisma.foto.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(fotos);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// router.put("/:id", async (req, res) => {
//   const { id } = req.params
//   const { nome } = req.body
//   if (!nome ) {
//     res.status(400).json({ "erro": "Informe a espécie!" })
//     return
//   }
//   try {
//     const fotos = await prisma.foto.update({
//       where: { id: Number(id) },
//       data: { nome }
//     })
//     res.status(200).json(fotos)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })
// router.get("/lista/animais", async (req, res) => {
//   try {
//     const fotos = await prisma.foto.findMany({
//       include: {
//         animais: true
//       }
//     })
//     res.status(200).json(fotos)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })
exports.default = router;

import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { verificaToken } from "../middewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const animais = await prisma.animal.findMany({
      include: {
        especie: true,
        pedidos: true
    
      }


    })
    res.status(200).json(animais)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", async (req, res) => {
  const { nome, idade, sexo, foto, descricao, porte, especieId, userId } = req.body;

  if (!nome || !idade || !sexo || !foto || !porte || !especieId || !userId) {
 console.log("dados recebidos para o post",req.body);



   
    res.status(400).json({ erro: "Informe nome, sexo, idade, porte e especieId" });
    return;
  }

  try {
    const animal = await prisma.animal.create({
      data: { nome, idade, sexo, foto, descricao, porte, especieId, userId },
    });
    res.status(201).json(animal);
  } catch (error) {
    res.status(400).json(error);
  }
})

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;

  try {
    const animal = await prisma.animal.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(animal);
  } catch (error) {
    res.status(400).json(error);
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, idade, sexo, foto, descricao, porte, especieId, userId } = req.body;

  if (!nome || !idade || !sexo || !foto || !porte || !especieId || !userId) {

    
    res.status(400).json({ erro: "Informe nome, idade, porte, especieId e userId" });
    
    return;
  }

  try {
    const animal = await prisma.animal.update({
      where: { id: Number(id) },
      data: { nome, idade, sexo, foto, descricao, porte, especieId, userId },
    });
    res.status(200).json(animal);
  } catch (error) {
    res.status(400).json(error);
  }
})
router.patch("/:id/adotar", async (req, res) => {
  const { id } = req.params;

  try {
    const animal = await prisma.animal.update({
      where: { id: Number(id) },
      data: { status: false },
    });

    res.status(200).json({ mensagem: "Animal marcado como adotado!", animal });
  } catch (error) {
    res.status(400).json({ erro: "Não foi possível marcar como adotado." });
  }
});

function normalizarTermo(termo: string): string | undefined {
  switch (termo.trim().toLowerCase()) {
    case 'macho':
      return 'Macho';
    case 'fêmea':
    case 'femea':
      return 'Femea';
    case 'gato':
    case 'gatinho':
      return 'Gato';
    case 'cachorro':
    case 'cão':
    case 'cao':
      return 'Cachorro';
    case 'grande':
    case 'Grande':
      return 'Grande';
    case 'pequeno':
    case 'Pequeno':
      return 'Pequeno';
    case 'medio':
    case 'médio':
    case 'Médio':
      return 'Medio';
    default:
      return undefined;
  }
}

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  // Tenta converter o termo em número
  const termoNumero = Number(termo)

  // Se a conversao gerou um NaN (Nota a Number)
  if (isNaN(termoNumero)) {
    try {
      const termoCorrigido = normalizarTermo(termo);

      if (!termoCorrigido) {
        throw new Error('termo não reconhecido')
      }

      const animais = await prisma.animal.findMany({
        include: {
          especie: true,
        },
        where: {
          status:true,
          OR: [
            { nome: { contains: termo } },
            { especie: { nome: { contains: termo } } },
            // Se o termo for "Macho" ou "Femea", faz a busca por sexo
            ...(termoCorrigido === 'Macho' || termoCorrigido === 'Femea' ?
              [{ sexo: termoCorrigido as 'Macho' | 'Femea' }] : []),
            ...(termoCorrigido === 'Pequeno' || termoCorrigido === 'Medio' || termoCorrigido === 'Grande' ?
              [{ porte: termoCorrigido as 'Pequeno' | 'Medio' | 'Grande' }] : []),

            ...(termoCorrigido === 'Gato' || termoCorrigido === 'Cachorro' ?
              [{ especie: { nome: { equals: termoCorrigido, mode: 'insensitive' as const } } }] : []),
          ]
        }
      });

      res.status(200).json(animais);
    } catch (error) {
      res.status(400).json(error);
    }

  } else {
    try {
      const animais = await prisma.animal.findMany({
        include: {
          especie: true,
        },
        where: {
          OR: [
            { idade: termoNumero },

          ]
        }
      })
      res.status(200).json(animais)
    } catch (error) {
      res.status(400).json(error)
    }
  }

})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const animal = await prisma.animal.findUnique({
      where: { id: Number(id) },
      include: {
        especie: true,
        fotos:true
      }
    })
    res.status(200).json(animal)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
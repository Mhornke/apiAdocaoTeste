import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { verificaToken } from "../middewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const animais = await prisma.animal.findMany({
      include: {
        especie: true 
      }

    
    })
    res.status(200).json(animais)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", verificaToken, async (req, res) => {
  const { nome, idade, sexo, foto, descricao, porte, especieId } = req.body;

  if (!nome || !idade || !sexo || !foto || !porte || !especieId) {
    res.status(400).json({ erro: "Informe nome, sexo, idade, porte e especieId" });
    return;
  }

  try {
    const animal = await prisma.animal.create({
      data: { nome, idade, sexo, foto, descricao, porte, especieId },
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

router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const { nome, idade, sexo, foto, descricao, porte, especieId } = req.body;

  if (!nome || !idade || !sexo || !foto || !porte || !especieId) {
    res.status(400).json({ erro: "Informe nome, idade, porte e especieId" });
    return;
  }

  try {
    const animal = await prisma.animal.update({
      where: { id: Number(id) },
      data: { nome, idade, sexo, foto, descricao, porte, especieId },
    });
    res.status(200).json(animal);
  } catch (error) {
    res.status(400).json(error);
  }
})

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  // Tenta converter o termo em número
  const termoNumero = Number(termo)

  // Se a conversao gerou um NaN (Nota a Number)
  if (isNaN(termoNumero)){
    try {
      let termoCorrigido: string | undefined;

      // Verifica se o termo é "macho" ou "fêmea" (em qualquer formato)
      if (termo.toLowerCase() === 'macho') {
          termoCorrigido = 'Macho';
      } else if (termo.toLowerCase() === 'femea' || termo.toLowerCase() === 'fêmea') {
          termoCorrigido = 'Femea';
      } else {
          termoCorrigido = undefined;
      }

      const animais = await prisma.animal.findMany({
          include: {
              especie: true,
          },
          where: {
              OR: [
                  { nome: { contains: termo } },
                  { especie: { nome: { contains: termo } } },
                  // Se o termo for "Macho" ou "Femea", faz a busca por sexo
                  ...(termoCorrigido ? [{ sexo: termoCorrigido as 'Macho' | 'Femea' }] : [])
              ]
          }
      });

      res.status(200).json(animais);
  } catch (error) {
      res.status(400).json(error);
  }
    
  }else{
    try {
      const animais = await prisma.animal.findMany({
        include: {
          especie: true, 
        },
        where: {
          OR: [
            { idade: termoNumero},
        
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
      where : { id: Number(id)},
      include: {
        especie: true
      }
    })
    res.status(200).json(animal)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
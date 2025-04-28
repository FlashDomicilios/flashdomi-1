import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { origen, destino, distancia, precio } = req.body;

  try {
    // Verificar si ya existe la ruta
    const rutaExistente = await prisma.ruta.findFirst({
      where: { origen, destino }
    });

    if (rutaExistente) {
      return res.status(200).json({
        precio: rutaExistente.precio,
        distancia: rutaExistente.distancia,
        source: 'db'
      });
    }

    // Si no existe, guardar la nueva ruta
    const nuevaRuta = await prisma.ruta.create({
      data: { origen, destino, distancia, precio }
    });

    return res.status(201).json({
      precio: nuevaRuta.precio,
      distancia: nuevaRuta.distancia,
      source: 'api'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}
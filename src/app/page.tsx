"use client";

import MapForm from "@/components/MapForm";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("/api/prueba")
      .then((res) => res.json())
      .then((data) => {
        setMensaje(data.mensaje);
      })
      .catch((error) => console.error("Error al llamar API:", error));
  }, []);

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Bienvenido a FLASH</h1>
        <p className="text-lg text-gray-600 mb-4">
          Calcula fácilmente la tarifa de tu domicilio en Tuluá.
        </p>
        <p className="text-md text-gray-700 mb-6">
          <strong>Mensaje desde la API:</strong> {mensaje}
        </p>

        <div className="flex justify-center space-x-4 mb-6">
          <Link href="/mapa">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow">
              Calcula tu tarifa
            </button>
          </Link>
          <Link href="/sobre">
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-full shadow">
              Sobre Nosotros
            </button>
          </Link>
        </div>

        /* Puedes mantener MapForm aquí si quieres mostrarlo desde la home */
        /<MapForm />/
      </div>
    </main>
  );
}
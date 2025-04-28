"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin, DollarSign } from "lucide-react";

export default function MapForm() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [distancia, setDistancia] = useState(0);
  const [precio, setPrecio] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    const map = new window.google.maps.Map(mapRef.current!, {
      center: { lat: 4.085, lng: -76.2012 },
      zoom: 13,
    });

    mapInstance.current = map;
    directionsRendererRef.current = new google.maps.DirectionsRenderer();
    directionsRendererRef.current.setMap(map);
  }, []);

  const calcularPrecioSegunDistancia = (distanciaKm: number): number => {
    if (distanciaKm >= 0.1 && distanciaKm <= 1) return 3000;
    if (distanciaKm > 1 && distanciaKm <= 3) return 3500;
    if (distanciaKm > 3 && distanciaKm <= 4) return 4000;
    if (distanciaKm > 4 && distanciaKm <= 4.5) return 4500;
    if (distanciaKm > 4.5 && distanciaKm <= 5.5) return 5000;
    if (distanciaKm > 5.5 && distanciaKm <= 6) return 6000;
    if (distanciaKm > 6 && distanciaKm <= 7) return 7000;
    return -1; // fuera de rango
  };

  const calcularPrecio = async () => {
    if (!origen || !destino) return;
    setLoading(true);
    setError("");

    try {
      // Consultar si ya existe en la base de datos
      const res = await fetch(`/api/rutas?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.distancia && data?.precio) {
          setDistancia(data.distancia);
          setPrecio(data.precio);
          trazarRutaEnMapa(origen, destino);
          setLoading(false);
          return;
        }
      }

      // Si no existe, calcular usando la API de Google
      const distanceService = new google.maps.DistanceMatrixService();

      distanceService.getDistanceMatrix(
        {
          origins: [origen],
          destinations: [destino],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        async (response, status) => {
          if (status === "OK") {
            const distanciaKm = response.rows[0].elements[0].distance.value / 1000;
            const distanciaRedondeada = parseFloat(distanciaKm.toFixed(2)); // dos decimales
            const precioCalculado = calcularPrecioSegunDistancia(distanciaRedondeada);

            if (precioCalculado === -1) {
              setError("La distancia está fuera del rango permitido (0.1 km a 7 km).");
              setDistancia(distanciaRedondeada);
              setPrecio(0);
            } else {
              setDistancia(distanciaRedondeada);
              setPrecio(precioCalculado);

              // Guardar en la base de datos
              await fetch("/api/rutas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ origen, destino, distancia: distanciaRedondeada, precio: precioCalculado }),
              });
            }

            trazarRutaEnMapa(origen, destino);
          } else {
            alert("Error al calcular la distancia.");
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error al calcular o guardar la ruta:", error);
      alert("Ocurrió un error al procesar la información.");
      setLoading(false);
    }
  };

  const trazarRutaEnMapa = (origen: string, destino: string) => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origen,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);
        } else {
          alert("No se pudo trazar la ruta en el mapa. Verifica las direcciones.");
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 bg-white shadow-xl rounded-2xl border border-gray-200">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-600">
        Calculadora de Tarifas de Domicilio
      </h2>

      <p className="text-center text-gray-500 mb-6">
        Ingresa las direcciones de origen y destino para calcular la distancia y el costo estimado del envío en Tuluá.
      </p>

      <div className="space-y-5">
        <div>
          <label className="flex items-center gap-2 font-medium text-gray-700">
            <MapPin className="w-5 h-5 text-blue-500" />
            Dirección de Origen:
          </label>
          <input
            type="text"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
            className="w-full mt-2 p-3 border rounded-lg text-black placeholder-gray-400 placeholder:italic focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ej: Calle 10 #12-34, Barrio San Pedro"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 font-medium text-gray-700">
            <LocateFixed className="w-5 h-5 text-blue-500" />
            Dirección de Destino:
          </label>
          <input
            type="text"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            className="w-full mt-2 p-3 border rounded-lg text-black placeholder-gray-400 placeholder:italic focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ej: Carrera 8 #5-20, Barrio Alameda"
          />
        </div>

        <button
          onClick={calcularPrecio}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Calculando...
            </>
          ) : (
            "Calcular Precio"
          )}
        </button>

        {(distancia > 0 || precio > 0) && !error && (
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-4 text-center">
            <p className="text-md text-gray-600">
              <strong>Distancia estimada:</strong> {distancia.toFixed(2)} km
            </p>
            <p className="text-md text-gray-600 mt-1">
              <strong>Precio estimado:</strong>{" "}
              <DollarSign className="inline w-4 h-4 text-green-600" />{" "}
              {precio.toLocaleString("es-CO")} COP
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 p-4 rounded-lg border border-red-300 text-center text-red-700 mt-4">
            {error}
          </div>
        )}
      </div>

      <div
        ref={mapRef}
        className="mt-8 h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-sm"
      />
    </div>
  );
}

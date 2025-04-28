"use client";

import MapForm from "../../components/MapForm";

export default function MapaPage() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Flash</h1>
    
        <MapForm />
      </div>
    </main>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Search, Filter, Loader2 } from "lucide-react";
import type { Car } from "../types";
import CarModal from "./CarModal";
import { useAuth } from "../contexts/AuthContext";
import {
  getCarsAPI,
  createCarAPI,
  updateCarAPI,
  deleteCarAPI,
} from "../services/api";

const CarManagement: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const { token } = useAuth();

  // === Fetch Cars ===
  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCarsAPI(token);
      if (Array.isArray(response.data)) {
        setCars(response.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch cars");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // === Filter Cars ===
  const filteredCars = cars.filter((car) => {
    const matchSearch = `${car.year} ${car.brand} ${car.model}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || car.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // === CRUD Handlers ===
  const handleAddCar = () => {
    setEditingCar(null);
    setIsModalOpen(true);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCar(null);
    setIsModalOpen(false);
  };

  const handleDeleteCar = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    const original = [...cars];
    setCars((prev) => prev.filter((c) => c._id !== id));

    try {
      await deleteCarAPI(id, token);
    } catch (err) {
      console.error(err);
      setError("Failed to delete car");
      setCars(original); // rollback
    }
  };

  const handleSaveCar = async (carData: FormData) => {
    try {
      setError(null);

      if (editingCar?._id) {
        
        const updatedCar = await updateCarAPI(editingCar._id, carData, token);

        console.log("Updated car from backend:", updatedCar);

      
        setCars((prevCars) =>
          prevCars.map((car) => (car._id === editingCar._id ? updatedCar : car))
        );
      } else {
        // Create new car
        const newCar = await createCarAPI(carData, token);
        setCars((prevCars) => [newCar, ...prevCars]);
      }

      setIsModalOpen(false);
      setEditingCar(null);
    } catch (err: any) {
      console.error("Error saving car:", err);
      setError(err.message || "Failed to save car");
    }
  };

  const getStatusColor = (status: Car["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status?: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

  // === Render ===
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Car Management</h1>
          <p className="text-gray-600">
            Manage and organize your vehicle listings
          </p>
        </div>
        <button
          onClick={handleAddCar}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
          <Plus className="h-5 w-5" />
          <span>Add New Car</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by year, brand, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Vehicle
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Price
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Mileage
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Updated
                </th>
                <th className="p-4 text-right text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading cars...</p>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-200">
                {filteredCars.map((car) => (
                  <tr key={car._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 flex items-center gap-4">
                      <img
                        src={
                          car.images?.[0] || "https://via.placeholder.com/50"
                        }
                        alt={`${car.brand} ${car.model}`}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {car.year} {car.brand} {car.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.transmission || "N/A"}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold">
                      ₦{Number(car.price || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-600">
                      {(car.mileage || 0).toLocaleString()} miles
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          car.status
                        )}`}>
                        {formatStatus(car.status)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(
                        car.updatedAt || Date.now()
                      ).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditCar(car)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!loading && filteredCars.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No cars found. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CarModal
          car={editingCar}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCar}
        />
      )}
    </div>
  );
};

export default CarManagement;

// import React, { useState, useEffect, useCallback } from "react";
// import { Plus, Edit, Trash2, Search, Filter, Loader2 } from "lucide-react";
// import type { Car } from "../types";
// import CarModal from "./CarModal";
// import { useAuth } from "../contexts/AuthContext";
// import {
//   getCarsAPI,
//   createCarAPI,
//   updateCarAPI,
//   deleteCarAPI,
// } from "../services/api";

// const CarManagement: React.FC = () => {
//   const [cars, setCars] = useState<Car[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingCar, setEditingCar] = useState<Car | null>(null);

//   // UI State
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const { token } = useAuth();

//   const fetchCars = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await getCarsAPI(token);

//       if (Array.isArray(response.data)) {
//         setCars(response.data);
//       } else {
//         console.error("Expected response.data to be an array", response);
//         setCars([]);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch cars");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchCars();
//   }, [fetchCars]);

//   const filteredCars = cars.filter((car) => {
//     const matchesSearch = `${car.year} ${car.brand} ${car.model}`
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === "all" || car.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const handleAddCar = () => {
//     setEditingCar(null);
//     setIsModalOpen(true);
//   };

//   const handleEditCar = (car: Car) => {
//     setEditingCar(car);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setEditingCar(null);
//   };

//   const handleDeleteCar = async (carId: string) => {
//     if (!window.confirm("Are you sure you want to delete this car?")) return;

//     const originalCars = [...cars];
//     setCars(originalCars.filter((car) => car._id !== carId));

//     try {
//       await deleteCarAPI(carId, token);
//     } catch (err) {
//       setError("Failed to delete car.");
//       console.error(err);
//       setCars(originalCars);
//     }
//   };

//   const handleSaveCar = async (carData: FormData) => {
//     const originalCars = [...cars];
//     setError(null);

//     if (editingCar?._id) {
//       const updatedCarData = Object.fromEntries(carData.entries());
//       const updatedCar = {
//         ...editingCar,
//         ...updatedCarData,
//         price: Number(updatedCarData.price),
//         year: Number(updatedCarData.year),
//         mileage: Number(updatedCarData.mileage),
//         features: carData.getAll("features[]") as string[],
//       } as Car;

//       setCars((prevCars) =>
//         prevCars.map((car) => (car._id === editingCar._id ? updatedCar : car))
//       );
//     }

//     try {
//       if (editingCar?._id) {
//         await updateCarAPI(editingCar._id, carData, token);
//       } else {
//         const newCar = await createCarAPI(carData, token);
//         setCars((prevCars) => [newCar, ...prevCars]);
//       }

//       handleCloseModal();
//       fetchCars(); // Refetch to ensure data consistency
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to save car";
//       setError(errorMessage);
//       console.error("Error saving car:", err);
//       setCars(originalCars); // Revert on error
//     }
//   };

//   const getStatusColor = (status: Car["status"]) => {
//     switch (status) {
//       case "available":
//         return "bg-green-100 text-green-800";
//       case "sold":
//         return "bg-red-100 text-red-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };
//   const formatStatus = (status: string | undefined): string => {
//     if (!status) return "Unknown";
//     return status.charAt(0).toUpperCase() + status.slice(1);
//   };
//   return (
//     <div className="space-y-6">
//       {/* Header & Add button */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Car Management</h1>
//           <p className="text-gray-600">Manage your vehicle inventory</p>
//         </div>
//         <button
//           onClick={handleAddCar}
//           className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
//           <Plus className="h-5 w-5" />
//           <span>Add New Car</span>
//         </button>
//       </div>

//       {/* Error */}
//       {error && (
//         <div
//           className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
//           role="alert">
//           <p>{error}</p>
//         </div>
//       )}

//       {/* Search & Filter */}
//       <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by year, brand, or model..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//         <div className="relative">
//           <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
//             <option value="all">All Status</option>
//             <option value="available">Available</option>
//             <option value="sold">Sold</option>
//             <option value="pending">Pending</option>
//           </select>
//         </div>
//       </div>

//       {/* Cars Table */}
//       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="p-4 text-left text-sm font-semibold text-gray-600">
//                   Vehicle
//                 </th>
//                 <th className="p-4 text-left text-sm font-semibold text-gray-600">
//                   Price
//                 </th>
//                 <th className="p-4 text-left text-sm font-semibold text-gray-600">
//                   Mileage
//                 </th>
//                 <th className="p-4 text-left text-sm font-semibold text-gray-600">
//                   Status
//                 </th>
//                 <th className="p-4 text-left text-sm font-semibold text-gray-600">
//                   Updated
//                 </th>
//                 <th className="p-4 text-right text-sm font-semibold text-gray-600">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             {loading ? (
//               <tbody>
//                 <tr>
//                   <td colSpan={6} className="text-center p-12">
//                     <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
//                     <p className="text-gray-500 mt-2">Loading Cars...</p>
//                   </td>
//                 </tr>
//               </tbody>
//             ) : (
//               <tbody className="divide-y divide-gray-200">
//                 {filteredCars.map((car, index) => (
//                   <tr key={index} className="hover:bg-gray-50">
//                     <td className="p-4 flex items-center space-x-4">
//                       <img
//                         src={
//                           car.images?.[0] || "https://via.placeholder.com/50"
//                         }
//                         alt={`${car.brand} ${car.model}`}
//                         className="w-12 h-12 rounded-lg object-cover"
//                       />
//                       <div>
//                         <div className="font-semibold text-gray-900">
//                           {car.year} {car.brand} {car.model}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {car.transmission || "N/A"}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4 font-semibold">
//                       ₦{(car.price || 0).toLocaleString()}
//                     </td>
//                     <td className="p-4">
//                       {(car.mileage || 0).toLocaleString()} miles
//                     </td>
//                     <td className="p-4">
//                       <span
//                         className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                           car.status
//                         )}`}>
//                         {formatStatus(car.status)}
//                       </span>
//                     </td>
//                     <td className="p-4 text-gray-500 text-sm">
//                       {new Date(
//                         car.updatedAt || Date.now()
//                       ).toLocaleDateString()}
//                     </td>
//                     <td className="p-4 text-right flex items-center justify-end space-x-2">
//                       <button
//                         onClick={() => handleEditCar(car)}
//                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                         <Edit className="h-4 w-4" />
//                       </button>
//                       <button
//                         onClick={() => handleDeleteCar(car._id)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             )}
//           </table>
//         </div>

//         {!loading && filteredCars.length === 0 && (
//           <div className="text-center p-12 text-gray-500">
//             <p>No cars found. Try adjusting your search or filters.</p>
//           </div>
//         )}
//       </div>

//       {isModalOpen && (
//         <CarModal
//           car={editingCar}
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//           onSave={handleSaveCar}
//         />
//       )}
//     </div>
//   );
// };

// export default CarManagement;

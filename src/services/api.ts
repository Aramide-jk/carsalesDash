import type {
  Car,
  InspectionBooking,
  Purchase,
  CarAPIResponse,
} from "../types";

// const API_BASE_URL = "https://carsalesbackend-production.up.railway.app/api";
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
console.log(API_BASE_URL);

const apiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: any,
  token?: string | null,
  isFormData: boolean = false
): Promise<T> => {
  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    if (response.status === 204) return null as T;

    return response.json();
  } catch (error) {
    console.error(`API Error on ${method} ${endpoint}:`, error);
    throw error;
  }
};
// --- Car Management ---
export const getCarsAPI = (token: string | null) =>
  apiRequest<CarAPIResponse>("/cars", "GET", null, token);

export const createCarAPI = (carData: FormData, token: string | null) =>
  apiRequest<Car>("/admin/cars", "POST", carData, token, true);

export const updateCarAPI = (
  id: string,
  carData: FormData,
  token: string | null
) => apiRequest<Car>(`/admin/cars/${id}`, "PATCH", carData, token, true);

export const deleteCarAPI = (id: string, token: string | null) =>
  apiRequest<void>(`/admin/cars/${id}`, "DELETE", null, token);

// --- Inspection Management ---
export const getInspectionsAPI = (token: string | null) =>
  apiRequest<InspectionBooking[]>("/inspections", "GET", null, token);

export const updateInspectionStatusAPI = (
  id: string,
  status: InspectionBooking["status"],
  token: string | null
) =>
  apiRequest<InspectionBooking>(
    `/inspections/${id}/status`,
    "PATCH",
    { status },
    token
  );

export const getSellRequestsAPI = (token: string | null) =>
  apiRequest<any[]>("/sell-requests", "GET", null, token);

export const updateSellRequestStatusAPI = (
  id: string,
  status: "pending" | "approved" | "rejected",
  token: string | null
) => apiRequest<any>(`/admin/sell-requests/${id}`, "PATCH", { status }, token);

// --- Purchase Management ---
export const getPurchasesAPI = (token: string | null) =>
  apiRequest<Purchase[]>("/purchases", "GET", null, token);

export const updatePurchaseStatusAPI = (
  id: string,
  status: Purchase["status"],
  token: string | null
) =>
  apiRequest<Purchase>(`/purchases/${id}/status`, "PATCH", { status }, token);

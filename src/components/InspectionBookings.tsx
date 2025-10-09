import { transformInspection } from "../utils/TransformInspection";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Car,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import type { InspectionBooking } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { getInspectionsAPI, updateInspectionStatusAPI } from "../services/api";

const InspectionBookings: React.FC = () => {
  const [bookings, setBookings] = useState<InspectionBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rawBookings = await getInspectionsAPI(token);

      const transformedBookings = rawBookings.map((booking: any) =>
        transformInspection(booking)
      );

      setBookings(transformedBookings);
    } catch (err) {
      setError("Failed to fetch inspection bookings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.userName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.userEmail || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.userPhone || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.carBrand || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.carModel || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.carYear || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: InspectionBooking["status"]
  ) => {
    try {
      const rawUpdated = await updateInspectionStatusAPI(
        bookingId,
        newStatus,
        token
      );

      const updatedBooking = transformInspection(rawUpdated);

      setBookings(
        bookings.map((b) => (b._id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      setError("Failed to update booking status.");
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";

    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Inspection Bookings
        </h1>
        <p className="text-gray-600">Manage customer inspection appointments</p>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
          role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", count: bookings.length, color: "blue" },
          {
            label: "Pending",
            count: bookings.filter((b) => b.status === "pending").length,
            color: "yellow",
          },
          {
            label: "Confirmed",
            count: bookings.filter((b) => b.status === "confirmed").length,
            color: "green",
          },
          {
            label: "Completed",
            count: bookings.filter((b) => b.status === "completed").length,
            color: "purple",
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
              <Calendar className={`h-8 w-8 text-${stat.color}-600`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 ">
                  Car
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading Bookings...</p>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {booking.userName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {booking.userEmail}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {booking.userPhone || "Not Provided"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {booking.carBrand} {booking.carModel}
                          {booking.carYear}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {formatDate(booking.inspectionDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {formatTime(booking.inspectionTime)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          booking.status
                        )}`}>
                        {booking.status
                          ? booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          updateBookingStatus(
                            booking._id,
                            e.target.value as InspectionBooking["status"]
                          )
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No bookings found</div>
            <p className="text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionBookings;

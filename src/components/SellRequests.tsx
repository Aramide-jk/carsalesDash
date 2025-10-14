import React, { useState, useEffect } from "react";
import {
  FileText,
  User,
  Phone,
  Mail,
  Car,
  Search,
  Filter,
  Eye,
  Check,
  X,
  MapPin,
  Calendar,
} from "lucide-react";
import type { SellRequest } from "../types";
import {
  getSellRequestsAPI,
  updateSellRequestStatusAPI,
} from "../services/api";

const SellRequests: React.FC = () => {
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<SellRequest | null>(
    null
  );
  const [_, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("jk_autos_token");
        const response = await getSellRequestsAPI(token);
        setSellRequests(response);
      } catch (err) {
        console.error("Failed to fetch sell requests:", err);
        setError("Failed to fetch sell requests");
      } finally {
        setLoading(false);
      }
    };

    fetchSellRequests();
  }, []);
  const filteredRequests = sellRequests.filter((request) => {
    const matchesSearch =
      (request.ownerName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (request.ownerEmail?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (request.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (request.model?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateRequestStatus = async (
    requestId: string,
    newStatus: "pending" | "approved" | "rejected"
  ) => {
    try {
      const token = localStorage.getItem("jk_autos_token");
      const updatedRequest = await updateSellRequestStatusAPI(
        requestId,
        newStatus,
        token
      );

      setSellRequests(
        sellRequests.map((request) =>
          request._id === requestId ? updatedRequest : request
        )
      );
    } catch (err) {
      console.error("Failed to update request:", err);
      alert("Failed to update request status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "N/A"; // fallback if date is missing
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // const formatStatus = (status?: string) => {
  //   if (!status) return "N/A";
  //   return status.charAt(0).toUpperCase() + status.slice(1);
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sell Car Requests</h1>
        <p className="text-gray-600">Manage customer car selling requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Requests",
            count: sellRequests.length,
            color: "blue",
            icon: FileText,
          },
          {
            label: "Pending",
            count: sellRequests.filter((r) => r.status === "pending").length,
            color: "yellow",
            icon: FileText,
          },
          {
            label: "Approved",
            count: sellRequests.filter((r) => r.status === "approved").length,
            color: "green",
            icon: Check,
          },
          {
            label: "Rejected",
            count: sellRequests.filter((r) => r.status === "rejected").length,
            color: "red",
            icon: X,
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.count}
                  </p>
                </div>
                <Icon className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by owner name, email, brand, or model..."
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Vehicle
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {request.ownerName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {request.ownerEmail}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {request.ownerPhone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {request.year} {request.brand} {request.model}
                        </span>
                      </div>
                      {/* <div className="flex items-center space-x-2">
                        <Fuel className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {request.engine}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {(request.mileage || 0).toLocaleString()} miles
                      </div> */}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        ₦{(request.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {request.location || "Not specified"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        request.status
                      )}`}>
                      {request.status
                        ? request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)
                        : "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details">
                        <Eye className="h-4 w-4" />
                      </button>
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateRequestStatus(request._id, "approved")
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve">
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateRequestStatus(request._id, "rejected")
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No sell requests found</div>
            <p className="text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Sell Request Details
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Owner Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Owner Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <p className="text-gray-900">{selectedRequest.ownerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {selectedRequest.ownerEmail}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <p className="text-gray-900">
                      {selectedRequest.ownerPhone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <p className="text-gray-900">
                      {selectedRequest.location || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Brand
                    </label>
                    <p className="text-gray-900">{selectedRequest.brand}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <p className="text-gray-900">{selectedRequest.model}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <p className="text-gray-900">{selectedRequest.year}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <p className="text-gray-900">
                      ₦{(selectedRequest.price || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mileage
                    </label>
                    <p className="text-gray-900">
                      {selectedRequest.mileage.toLocaleString()} miles
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Engine
                    </label>
                    <p className="text-gray-900">{selectedRequest.engine}</p>
                  </div>
                </div>

                {selectedRequest.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedRequest.description}
                    </p>
                  </div>
                )}

                {selectedRequest.features.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Features
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedRequest.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Images */}

              {(selectedRequest?.interiorImages?.length > 0 ||
                selectedRequest?.exteriorImages?.length > 0) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Vehicle Images
                  </h3>

                  {selectedRequest?.exteriorImages?.length > 0 && (
                    <>
                      <h4 className="text-md font-medium mt-2 mb-1">
                        Exterior
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedRequest.exteriorImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Exterior ${i + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {selectedRequest?.interiorImages?.length > 0 && (
                    <>
                      <h4 className="text-md font-medium mt-4 mb-1">
                        Interior
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedRequest.interiorImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Interior ${i + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* {selectedRequest.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Vehicle Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRequest.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Vehicle ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )} */}

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Documents
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedRequest.idFront && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Front
                      </label>
                      <img
                        src={selectedRequest.idFront}
                        alt="ID Front"
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}
                  {selectedRequest.idBack && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Back
                      </label>
                      <img
                        src={selectedRequest.idBack}
                        alt="ID Back"
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}
                  {selectedRequest.carReg && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Car Registration
                      </label>
                      <img
                        src={selectedRequest.carReg}
                        alt="Car Registration"
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}
                  {selectedRequest.customPaper && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Paper
                      </label>
                      <img
                        src={selectedRequest.customPaper}
                        alt="Custom Paper"
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedRequest.status === "pending" && (
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      updateRequestStatus(selectedRequest._id, "rejected");
                      setSelectedRequest(null);
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      updateRequestStatus(selectedRequest._id, "approved");
                      setSelectedRequest(null);
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellRequests;

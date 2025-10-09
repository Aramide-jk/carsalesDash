import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  User,
  Phone,
  Mail,
  Car,
  DollarSign,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import type { Purchase } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { getPurchasesAPI, updatePurchaseStatusAPI } from "../services/api";

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPurchases = await getPurchasesAPI(token);
      setPurchases(fetchedPurchases);
    } catch (err) {
      setError("Failed to fetch purchases.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      (purchase.userName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (purchase.userEmail || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (purchase.carDetails || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (purchase.transactionId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updatePurchaseStatus = async (
    purchaseId: string,
    newStatus: Purchase["status"]
  ) => {
    try {
      const updatedPurchase = await updatePurchaseStatusAPI(
        purchaseId,
        newStatus,
        token
      );
      setPurchases(
        purchases.map((p) => (p._id === purchaseId ? updatedPurchase : p))
      );
    } catch (err) {
      setError("Failed to update purchase status.");
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // const totalRevenue = purchases
  //   .filter((p) => p.status === "completed")
  //   .reduce((sum, p) => sum + p.purchaseAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
        <p className="text-gray-600">
          Track customer purchases and transactions
        </p>
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
          {
            label: "Total Purchases",
            count: purchases.length,
            color: "blue",
            icon: CreditCard,
          },
          {
            label: "Completed",
            count: purchases.filter((p) => p.status === "completed").length,
            color: "green",
            icon: CreditCard,
          },
          {
            label: "Pending",
            count: purchases.filter((p) => p.status === "pending").length,
            color: "yellow",
            icon: CreditCard,
          },
          {
            label: "Total Revenue",
            count: `₦{totalRevenue.toLocaleString()}`,
            color: "purple",
            icon: DollarSign,
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
              placeholder="Search by name, email, car, or transaction ID..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Car
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Payment
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
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading Purchases...</p>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-200">
                {filteredPurchases.map((purchase, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {purchase.userName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {purchase.userEmail}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {purchase.userPhone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {purchase.carDetails}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-lg font-semibold text-gray-900">
                          {purchase.purchaseAmount !== undefined &&
                          purchase.purchaseAmount !== null
                            ? `₦${purchase.purchaseAmount.toLocaleString()}`
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {purchase.paymentMethod}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {purchase.transactionId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        {formatDate(purchase.purchaseDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          purchase.status
                        )}`}>
                        {purchase.status
                          ? purchase.status.charAt(0).toUpperCase() +
                            purchase.status.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={purchase.status}
                        onChange={(e) =>
                          updatePurchaseStatus(
                            purchase._id,
                            e.target.value as Purchase["status"]
                          )
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!loading && filteredPurchases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No purchases found</div>
            <p className="text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;

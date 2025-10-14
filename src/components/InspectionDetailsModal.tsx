import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Car,
  Calendar,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";
import type { InspectionBooking } from "../types";

interface InspectionDetailsModalProps {
  booking: InspectionBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value?: string | number;
}> = ({ icon: Icon, label, value }) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-500">
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </label>
    <p className="mt-1 text-gray-900">{value || "N/A"}</p>
  </div>
);

const InspectionDetailsModal: React.FC<InspectionDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !booking) return null;
  console.log(booking);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Inspection Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem icon={User} label="Name" value={booking.userName} />
              <DetailItem icon={Mail} label="Email" value={booking.userEmail} />
              <DetailItem
                icon={Phone}
                label="Phone"
                value={booking.userPhone}
              />
            </div>
          </div>

          {/* Vehicle & Appointment Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Appointment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                icon={Car}
                label="Vehicle"
                value={`${booking.carBrand} ${booking.carModel} (${booking.carYear})`}
              />
              <DetailItem
                icon={MapPin}
                label="Location"
                value={booking.location}
              />
              <DetailItem
                icon={Calendar}
                label="Inspection Date"
                value={formatDate(booking.inspectionDate)}
              />
              <DetailItem
                icon={Clock}
                label="Inspection Time"
                value={booking.inspectionTime}
              />
            </div>
            {booking.note && (
              <div className="mt-4">
                <DetailItem
                  icon={FileText}
                  label="Additional Notes"
                  value={booking.note}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailsModal;

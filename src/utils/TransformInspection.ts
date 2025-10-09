import type { InspectionBooking } from "../types";

export const transformInspection = (booking: any): InspectionBooking => {
  const inspectionDate = booking.date ? new Date(booking.date) : null;

  return {
    _id: booking._id,

    // User info
    userId: booking.user?._id || "N/A",
    userName: booking.user?.name || "Unknown User",
    userEmail: booking.user?.email || "No Email",
    userPhone: booking.user?.phone || "Not Provided",

    // Car info (split fields)
    carId: booking.car?._id || "N/A",
    carBrand: booking.car?.brand || "N/A",
    carModel: booking.car?.model || "N/A",
    carYear: booking.car?.year ? String(booking.car.year) : "N/A",

    // Other details
    location: booking.location || "N/A",
    note: booking.note || "N/A",

    // Date/time — always safe
    inspectionDate: inspectionDate ? inspectionDate.toISOString() : "",
    inspectionTime: inspectionDate
      ? inspectionDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",

    status: booking.status || "pending",
    createdAt: booking.createdAt
      ? new Date(booking.createdAt).toISOString()
      : new Date().toISOString(),
  };
};

// export const transformInspection = (booking: any): InspectionBooking => {
//   const inspectionDate = booking.date ? new Date(booking.date) : null;

//   return {
//     _id: booking._id,
//     userId: booking.user?._id || "",
//     userName: booking.user?.name || "Unknown User",
//     userEmail: booking.user?.email || "No Email",
//     userPhone: booking.user?.phone || "Not Provided",

//     carId: booking.car?._id || "",
//     carBrand: booking.car?.brand || "Unknown",
//     carModel: booking.car?.model || "Unknown",
//     carYear: booking.car?.year?.toString() || "N/A",

//     location: booking.location || "",
//     note: booking.note || "",

//     inspectionDate: inspectionDate
//       ? inspectionDate.toISOString().split("T")[0]
//       : "",
//     inspectionTime: inspectionDate
//       ? inspectionDate.toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         })
//       : "",

//     status: booking.status || "pending",
//     createdAt: booking.createdAt
//       ? new Date(booking.createdAt).toISOString()
//       : new Date().toISOString(),
//   };
// };

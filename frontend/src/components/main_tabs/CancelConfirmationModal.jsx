// src/components/CancelConfirmationModal.jsx
import React from 'react';

const CancelConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  bookingId
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(10, 10, 20, 0.85)",
      zIndex: 11000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backdropFilter: "blur(6px)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #b00020, #cf102d)",
          padding: "28px 32px",
          textAlign: "center",
          color: "#fff"
        }}>
          <div style={{ fontSize: "42px", marginBottom: "8px" }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>
            Cancel Booking?
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#333", marginBottom: "20px" }}>
            Are you sure you want to cancel <strong>Booking #{bookingId}</strong>?
          </p>
          <p style={{ color: "#b00020", fontWeight: "600", marginBottom: "24px" }}>
            This action cannot be undone.
          </p>
        </div>

        {/* Footer Buttons */}
        <div style={{ 
          padding: "20px 28px", 
          borderTop: "1px solid #eee", 
          display: "flex", 
          gap: "12px",
          background: "#fff"
        }}>
          <button 
            onClick={onClose}
            style={{ 
              flex: 1, 
              padding: "14px", 
              borderRadius: "10px", 
              border: "1px solid #ddd", 
              background: "#fff", 
              fontWeight: "600",
              fontSize: "15px"
            }}
          >
            No, Keep Booking
          </button>

          <button 
            onClick={onConfirm}
            style={{ 
              flex: 1, 
              padding: "14px", 
              background: "#b00020", 
              color: "white", 
              border: "none", 
              borderRadius: "10px", 
              fontWeight: "700",
              fontSize: "15px"
            }}
          >
            Yes, Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
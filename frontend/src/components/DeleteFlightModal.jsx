import React, { useState } from 'react';

const DeleteFlightModal = ({
  isOpen,
  onClose,
  onConfirm,
  flightId,
  flightInfo = "" 
}) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!adminPassword) {
      setError("Password is required");
      return;
    }

    // You can add more validation here if needed
    onConfirm(adminPassword);
    setAdminPassword("");
    setError("");
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(10, 10, 20, 0.85)",
      zIndex: 12000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backdropFilter: "blur(6px)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        maxWidth: "440px",
        width: "100%",
        boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
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
            Delete Flight
          </h2>
          <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
            Flight #{flightId} {flightInfo && `— ${flightInfo}`}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px" }}>
          <p style={{ color: "#b00020", fontWeight: "600", marginBottom: "20px" }}>
            This action is permanent and cannot be undone.
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
              Enter your Admin Password to confirm
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px"
              }}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            />
            {error && <p style={{ color: "#b00020", fontSize: "14px", marginTop: "6px" }}>{error}</p>}
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          padding: "20px 28px",
          borderTop: "1px solid #eee",
          display: "flex",
          gap: "12px"
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px",
              background: "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: "14px",
              background: "#b00020",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Yes, Delete Flight
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFlightModal;
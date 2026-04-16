// src/components/TransactionModal.jsx
import React, { useState, useEffect } from 'react';

const TransactionModal = ({
  isOpen,
  onClose,
  flight,
  selectedCabinClass,
  getPriceForClass,
  loggedInUser,
  onConfirmBooking
}) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [saveCardForFuture, setSaveCardForFuture] = useState(false);

  const [cardInfo, setCardInfo] = useState({
    card_name: "",
    card_number: "",
    card_expiration_date: "",
    card_security_code: ""
  });

  const hasSavedCard = !!(loggedInUser?.card_number && loggedInUser.card_number.length > 4);

  // Reset logic when modal opens or selection changes
  useEffect(() => {
    if (isOpen) {
      if (hasSavedCard) {
        setUseSavedCard(true);
      } else {
        setUseSavedCard(false);
      }
      
      setCardInfo({
        card_name: "",
        card_number: "",
        card_expiration_date: "",
        card_security_code: ""
      });
    }
  }, [isOpen, hasSavedCard]);

  // When switching to "Use a different card", clear the fields
  useEffect(() => {
    if (!useSavedCard) {
      setCardInfo({
        card_name: "",
        card_number: "",
        card_expiration_date: "",
        card_security_code: ""
      });
    }
  }, [useSavedCard]);

  if (!isOpen || !flight) return null;

  const baseFare = Number(getPriceForClass(flight, selectedCabinClass)) || 0;
  const taxes = Number((baseFare * 0.18).toFixed(2));
  const total = Number((baseFare + taxes).toFixed(2));

  const handlePayNow = () => {
    if (!useSavedCard) {
      if (!cardInfo.card_name || !cardInfo.card_number || !cardInfo.card_expiration_date || !cardInfo.card_security_code) {
        alert("Please fill in all payment fields.");
        return;
      }
    }

    onConfirmBooking({
      flight_id: flight.flight_id,
      cabin_class: selectedCabinClass,
      base_fare: baseFare,
      taxes: taxes,
      total_amount: total,
      save_card: saveCardForFuture && !useSavedCard,
      ...(useSavedCard ? {} : cardInfo)
    });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(10, 10, 20, 0.85)",
      zIndex: 10000,
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
        maxWidth: "620px",
        maxHeight: "92vh",
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #cf102d 100%)",
          padding: "32px 36px 28px",
          textAlign: "center",
          color: "#fff"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>💳</div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>
            Complete Your Booking
          </h2>
          <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: "15px" }}>
            {flight.airline_name} • {selectedCabinClass} Class
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
          <button
            onClick={() => setActiveTab("summary")}
            style={{
              flex: 1,
              padding: "16px",
              fontWeight: activeTab === "summary" ? "700" : "600",
              borderBottom: activeTab === "summary" ? "4px solid #cf102d" : "none",
              background: "none",
              border: "none",
              fontSize: "15px"
            }}
          >
            Flight Summary
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            style={{
              flex: 1,
              padding: "16px",
              fontWeight: activeTab === "payment" ? "700" : "600",
              borderBottom: activeTab === "payment" ? "4px solid #cf102d" : "none",
              background: "none",
              border: "none",
              fontSize: "15px"
            }}
          >
            Price & Payment
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {activeTab === "summary" && (
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: "20px" }}>{flight.airline_name}</h3>
              <p style={{ fontSize: "17px", fontWeight: "500", marginBottom: "16px" }}>
                {flight.departure_city} ({flight.departure_code}) → {flight.arrival_city} ({flight.arrival_code})
              </p>
              <div style={{ lineHeight: "1.8" }}>
                <p><strong>Date:</strong> {new Date(flight.date_of_departure).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                <p><strong>Aircraft:</strong> {flight.aircraft_name}</p>
                <p><strong>Cabin Class:</strong> <span style={{ textTransform: "capitalize", fontWeight: "600" }}>{selectedCabinClass}</span></p>
                <p><strong>Estimated Duration:</strong> {flight.estimated_time_hours || "N/A"} hours</p>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div>
              <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "12px", marginBottom: "24px" }}>
                <p><strong>Base Fare ({selectedCabinClass}):</strong> ${baseFare.toFixed(2)}</p>
                <p><strong>Taxes & Fees (18%):</strong> ${taxes.toFixed(2)}</p>
                <hr style={{ margin: "12px 0" }} />
                <p style={{ fontSize: "22px", fontWeight: "700", margin: 0 }}>
                  Total: ${total.toFixed(2)}
                </p>
              </div>

              <h4 style={{ marginBottom: "16px" }}>Payment Method</h4>

              {/* Saved Card Option */}
              {hasSavedCard && (
                <label style={{ 
                  display: "block", 
                  marginBottom: "12px", 
                  fontSize: "15px", 
                  cursor: "pointer",
                  padding: "14px",
                  border: useSavedCard ? "2px solid #1a73e8" : "1px solid #ddd",
                  borderRadius: "8px"
                }}>
                  <input 
                    type="radio" 
                    checked={useSavedCard} 
                    onChange={() => setUseSavedCard(true)} 
                    style={{ marginRight: "10px" }}
                  /> 
                  Use saved card ending in <strong>{loggedInUser.card_number.slice(-4)}</strong>
                </label>
              )}

              {/* Use Different Card Option */}
              <label style={{ 
                display: "block", 
                marginBottom: hasSavedCard ? "16px" : "0", 
                fontSize: "15px", 
                cursor: "pointer",
                padding: "14px",
                border: !useSavedCard ? "2px solid #1a73e8" : "1px solid #ddd",
                borderRadius: "8px"
              }}>
                <input 
                  type="radio" 
                  checked={!useSavedCard} 
                  onChange={() => setUseSavedCard(false)} 
                  style={{ marginRight: "10px" }}
                /> 
                Use a different card
              </label>

              {/* Payment Fields - Show only when "Use a different card" is selected */}
              {!useSavedCard && (
                <div style={{ marginTop: "20px", background: "#fafafa", padding: "18px", borderRadius: "10px" }}>
                  <input 
                    placeholder="Name on card" 
                    value={cardInfo.card_name} 
                    onChange={(e) => setCardInfo({ ...cardInfo, card_name: e.target.value })}
                    style={{ width: "100%", marginBottom: "10px", padding: "10px", borderRadius: "6px" }}
                  />
                  <input 
                    placeholder="Card number" 
                    value={cardInfo.card_number} 
                    onChange={(e) => setCardInfo({ ...cardInfo, card_number: e.target.value })}
                    style={{ width: "100%", marginBottom: "10px", padding: "10px", borderRadius: "6px" }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input 
                      placeholder="MM/YY" 
                      value={cardInfo.card_expiration_date} 
                      onChange={(e) => setCardInfo({ ...cardInfo, card_expiration_date: e.target.value })}
                      style={{ flex: 1, padding: "10px", borderRadius: "6px" }}
                    />
                    <input 
                      placeholder="CVC" 
                      value={cardInfo.card_security_code} 
                      onChange={(e) => setCardInfo({ ...cardInfo, card_security_code: e.target.value })}
                      style={{ width: "90px", padding: "10px", borderRadius: "6px" }}
                    />
                  </div>
                </div>
              )}

              <label style={{ display: "flex", alignItems: "center", marginTop: "24px", gap: "8px", fontSize: "15px" }}>
                <input 
                  type="checkbox" 
                  checked={saveCardForFuture} 
                  onChange={(e) => setSaveCardForFuture(e.target.checked)} 
                />
                Save this card to my account for future use
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
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
              fontWeight: "600" 
            }}
          >
            Cancel
          </button>

          {activeTab === "payment" && (
            <button 
              onClick={handlePayNow}
              style={{ 
                flex: 2, 
                padding: "14px", 
                background: "#cf102d", 
                color: "white", 
                border: "none", 
                borderRadius: "10px", 
                fontWeight: "700",
                fontSize: "16px"
              }}
            >
              Pay ${total.toFixed(2)} Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
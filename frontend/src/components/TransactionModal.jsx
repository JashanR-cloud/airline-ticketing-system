// src/components/TransactionModal.jsx
import React, { useState, useEffect } from "react";

const TransactionModal = ({
  isOpen,
  onClose,
  flight,
  selectedCabinClass,
  getPriceForClass,
  loggedInUser,
  onConfirmBooking,
  numPassengers = 1,
  loyaltyDiscount = 0
}) => {
  // =============================
  // STATE
  // =============================
  const [activeTab, setActiveTab] = useState("summary");
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [saveCardForFuture, setSaveCardForFuture] = useState(false);

  const [cardInfo, setCardInfo] = useState({
    card_name: "",
    card_number: "",
    card_expiration_date: "",
    card_security_code: ""
  });

  const hasSavedCard =
    !!(loggedInUser?.card_number && loggedInUser.card_number.length > 4);

  // =============================
  // RESET MODAL ON OPEN
  // =============================
  useEffect(() => {
    if (isOpen) {
      setActiveTab("summary");
      setUseSavedCard(hasSavedCard);
      setSaveCardForFuture(false);

      setCardInfo({
        card_name: "",
        card_number: "",
        card_expiration_date: "",
        card_security_code: ""
      });
    }
  }, [isOpen, hasSavedCard]);

  if (!isOpen || !flight) return null;

  // =============================
  // PRICE CALCULATIONS
  // =============================
  const baseFarePerTicket =
    Number(getPriceForClass(flight, selectedCabinClass)) || 0;

  const baseFareTotal = Number(
    (baseFarePerTicket * numPassengers).toFixed(2)
  );

  const discountAmount =
    loyaltyDiscount > 0
      ? Number((baseFareTotal * loyaltyDiscount).toFixed(2))
      : 0;

  const discountedBase = Number(
    (baseFareTotal - discountAmount).toFixed(2)
  );

  const taxes = Number((discountedBase * 0.18).toFixed(2));

  const total = Number((discountedBase + taxes).toFixed(2));

  const tierName =
    loyaltyDiscount >= 0.15
      ? "Diamond"
      : loyaltyDiscount >= 0.10
      ? "Platinum"
      : loyaltyDiscount >= 0.05
      ? "Gold"
      : null;

  // =============================
  // SUBMIT PAYMENT
  // =============================
  const handlePayNow = () => {
    if (!useSavedCard) {
      if (
        !cardInfo.card_name ||
        !cardInfo.card_number ||
        !cardInfo.card_expiration_date ||
        !cardInfo.card_security_code
      ) {
        alert("Please fill in all payment fields.");
        return;
      }
    }

    onConfirmBooking({
      flight_id: flight.flight_id,
      cabin_class: selectedCabinClass,
      base_fare: baseFareTotal,
      taxes,
      total_amount: total,
      passenger_id: loggedInUser?.passenger_id,
      num_passengers: numPassengers,
      save_card: saveCardForFuture && !useSavedCard,
      card_name: useSavedCard ? null : cardInfo.card_name,
      card_number: useSavedCard ? null : cardInfo.card_number,
      card_expiration_date: useSavedCard
        ? null
        : cardInfo.card_expiration_date,
      card_security_code: useSavedCard
        ? null
        : cardInfo.card_security_code
    });
  };

  // =============================
  // REUSABLE STYLES
  // =============================
  const glassCard = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "18px"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
    marginBottom: "12px"
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,10,20,0.82)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}
    >
      {/* MAIN MODAL */}
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          maxHeight: "92vh",
          overflow: "hidden",
          borderRadius: "26px",
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(30,41,59,0.97))",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          color: "white"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "28px 30px 22px",
            background:
              "linear-gradient(135deg, rgba(255,138,61,0.18), rgba(255,179,71,0.08))",
            borderBottom: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <div
            style={{
              fontSize: "34px",
              marginBottom: "8px"
            }}
          >
            ✈️
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: "800"
            }}
          >
            Complete Your Booking
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "rgba(255,255,255,0.72)",
              fontSize: "14px"
            }}
          >
            {flight.airline_name} • {selectedCabinClass} Class
          </p>
        </div>

        {/* TAB NAV */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          {["summary", "payment"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "16px",
                border: "none",
                background: "transparent",
                color:
                  activeTab === tab
                    ? "#ffb347"
                    : "rgba(255,255,255,0.66)",
                fontWeight: activeTab === tab ? "800" : "600",
                borderBottom:
                  activeTab === tab
                    ? "3px solid #ff8a3d"
                    : "3px solid transparent",
                cursor: "pointer"
              }}
            >
              {tab === "summary"
                ? "Flight Summary"
                : "Price & Payment"}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px"
          }}
        >
          {/* SUMMARY TAB */}
          {activeTab === "summary" && (
            <div>
              <div
                style={{
                  ...glassCard,
                  padding: "22px"
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "16px",
                    fontSize: "22px"
                  }}
                >
                  {flight.airline_name}
                </h3>

                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#ffb347"
                  }}
                >
                  {flight.departure_city} ({flight.departure_code}) →{" "}
                  {flight.arrival_city} ({flight.arrival_code})
                </p>

                <div
                  style={{
                    lineHeight: "1.9",
                    color: "rgba(255,255,255,0.82)"
                  }}
                >
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      flight.date_of_departure
                    ).toLocaleString()}
                  </p>

                  <p>
                    <strong>Aircraft:</strong>{" "}
                    {flight.aircraft_name}
                  </p>

                  <p>
                    <strong>Cabin:</strong>{" "}
                    {selectedCabinClass}
                  </p>

                  <p>
                    <strong>Passengers:</strong>{" "}
                    {numPassengers}
                  </p>

                  <p>
                    <strong>Duration:</strong>{" "}
                    {flight.estimated_time_hours || "N/A"} hrs
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === "payment" && (
            <div>
              {/* PRICE BOX */}
              <div
                style={{
                  ...glassCard,
                  padding: "22px",
                  marginBottom: "24px"
                }}
              >
                <h4
                  style={{
                    marginTop: 0,
                    marginBottom: "14px",
                    color: "#ffb347"
                  }}
                >
                  Price Details
                </h4>

                <p>
                  Base Fare × {numPassengers}: $
                  {baseFareTotal.toFixed(2)}
                </p>

                {loyaltyDiscount > 0 && (
                  <p
                    style={{
                      color: "#6ee7b7",
                      fontWeight: "700"
                    }}
                  >
                    {tierName} Discount: -$
                    {discountAmount.toFixed(2)}
                  </p>
                )}

                <p>Taxes & Fees: ${taxes.toFixed(2)}</p>

                <hr
                  style={{
                    borderColor: "rgba(255,255,255,0.08)"
                  }}
                />

                <h2
                  style={{
                    marginBottom: 0,
                    color: "#ffb347"
                  }}
                >
                  Total: ${total.toFixed(2)}
                </h2>
              </div>

              {/* PAYMENT METHOD */}
              <h4 style={{ marginBottom: "14px" }}>
                Payment Method
              </h4>

              {hasSavedCard && (
                <label
                  style={{
                    ...glassCard,
                    display: "block",
                    padding: "14px",
                    marginBottom: "12px",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    checked={useSavedCard}
                    onChange={() => setUseSavedCard(true)}
                    style={{ marginRight: "10px" }}
                  />
                  Use saved card ending in{" "}
                  <strong>
                    {loggedInUser.card_number.slice(-4)}
                  </strong>
                </label>
              )}

              <label
                style={{
                  ...glassCard,
                  display: "block",
                  padding: "14px",
                  cursor: "pointer",
                  marginBottom: "18px"
                }}
              >
                <input
                  type="radio"
                  checked={!useSavedCard}
                  onChange={() => setUseSavedCard(false)}
                  style={{ marginRight: "10px" }}
                />
                Use a different card
              </label>

              {/* NEW CARD FORM */}
              {!useSavedCard && (
                <div
                  style={{
                    ...glassCard,
                    padding: "18px",
                    marginBottom: "18px"
                  }}
                >
                  <input
                    placeholder="Name on card"
                    value={cardInfo.card_name}
                    onChange={(e) =>
                      setCardInfo({
                        ...cardInfo,
                        card_name: e.target.value
                      })
                    }
                    style={inputStyle}
                  />

                  <input
                    placeholder="Card number"
                    value={cardInfo.card_number}
                    onChange={(e) =>
                      setCardInfo({
                        ...cardInfo,
                        card_number: e.target.value
                      })
                    }
                    style={inputStyle}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "10px"
                    }}
                  >
                    <input
                      placeholder="MM/YY"
                      value={cardInfo.card_expiration_date}
                      onChange={(e) =>
                        setCardInfo({
                          ...cardInfo,
                          card_expiration_date:
                            e.target.value
                        })
                      }
                      style={{
                        ...inputStyle,
                        flex: 1,
                        marginBottom: 0
                      }}
                    />

                    <input
                      placeholder="CVC"
                      value={cardInfo.card_security_code}
                      onChange={(e) =>
                        setCardInfo({
                          ...cardInfo,
                          card_security_code:
                            e.target.value
                        })
                      }
                      style={{
                        ...inputStyle,
                        width: "100px",
                        marginBottom: 0
                      }}
                    />
                  </div>
                </div>
              )}

              <label
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  color: "rgba(255,255,255,0.78)"
                }}
              >
                <input
                  type="checkbox"
                  checked={saveCardForFuture}
                  onChange={(e) =>
                    setSaveCardForFuture(
                      e.target.checked
                    )
                  }
                />
                Save card for future use
              </label>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: "20px 28px",
            display: "flex",
            gap: "12px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              border:
                "1px solid rgba(255,255,255,0.14)",
              background:
                "rgba(255,255,255,0.04)",
              color: "white",
              fontWeight: "700",
              cursor: "pointer"
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
                borderRadius: "14px",
                border: "none",
                background:
                  "linear-gradient(135deg,#ff8a3d,#ffb347)",
                color: "#1f1400",
                fontWeight: "800",
                fontSize: "16px",
                cursor: "pointer",
                boxShadow:
                  "0 10px 24px rgba(255,138,61,0.25)"
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
import { useState } from "react";

const API = "http://localhost:8000";

// ─── Options ─────────────────────────────────────────────────────────────────

const SEAT_OPTIONS = ["Window", "Middle", "Aisle"];

const MEAL_OPTIONS = [
  "No preference",
  "Vegetarian",
  "Vegan",
  "Kosher",
  "Halal",
  "Gluten-Free",
  "Diabetic",
  "Low Sodium",
  "Nut-Free",
  "Child Meal",
];

const SPECIAL_NEEDS_OPTIONS = [
  "None",
  "Wheelchair Assistance",
  "Visual Impairment",
  "Hearing Impairment",
  "Cognitive / Developmental Disability",
  "Oxygen Required",
  "Stretcher Required",
  "Unaccompanied Minor",
  "Travelling with Service Animal",
  "Other",
];

// ─── Shared Field wrapper ────────────────────────────────────────────────────

function Field({ label, required, children }) {
  return (
    <div className="acct-field">
      <label className="acct-label">
        {label}{required && <span className="acct-req">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Email validation helper ─────────────────────────────────────────────────

function isValidEmail(email) {
  // Must have characters before @, an @, characters after, a dot, and a TLD
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Create Account Modal ────────────────────────────────────────────────────

export function CreateAccountModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [form, setForm] = useState({
    role: "Passenger",
    email: "", password: "", confirmPassword: "",
    first_name: "", last_name: "", date_of_birth: "",
    phone_number: "", address: "", id_number: "",
    passport_status: false, visa_status: false,
    country_of_origin: "",
    seat_preferences: "", meal_preferences: "", special_needs: "",
  });

  const set = (e) =>
    setForm({ ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const emailInvalid = emailTouched && form.email.trim() && !isValidEmail(form.email);

  const validateStep1 = () => {
    if (!form.email.trim()) return "Email is required.";
    if (!isValidEmail(form.email)) return "Please enter a valid email address (must include @).";
    if (!form.password.trim()) return "Password is required.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const validateStep2 = () => {
    const required = ["first_name", "last_name", "date_of_birth", "phone_number", "address", "id_number"];
    for (const f of required) {
      if (!form[f].toString().trim()) return `${f.replace(/_/g, " ")} is required.`;
    }
    return null;
  };

  const handleNext = () => {
    setEmailTouched(true);
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      // Pass back both registration data AND the original form so App can auto-login
      onSuccess({ ...data, email: form.email, password: form.password, role: form.role });
    } catch {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="acct-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="acct-modal">
        <button className="acct-close" onClick={onClose}>✕</button>
        <div className="acct-header">
          <div className="acct-logo">RHA</div>
          <h2>Create Account</h2>
          <p className="acct-sub">Step {step} of 2 — {step === 1 ? "Login Details" : "Passenger Information"}</p>
        </div>

        <div className="acct-progress">
          <div className={`acct-prog-dot ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`acct-prog-line ${step >= 2 ? "filled" : ""}`} />
          <div className={`acct-prog-dot ${step >= 2 ? "active" : ""}`}>2</div>
        </div>

        {step === 1 && (
          <div className="acct-section">
            <Field label="Account Type" required>
              <div className="acct-role-toggle">
                {["Passenger", "Employee"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`acct-role-btn ${form.role === r ? "acct-role-active" : ""}`}
                    onClick={() => setForm({ ...form, role: r })}
                  >
                    {r === "Passenger" ? "✈ Passenger" : "🏢 Employee"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Email Address" required>
              <input
                className={`acct-input ${emailInvalid ? "acct-input-error" : ""}`}
                type="email"
                name="email"
                value={form.email}
                onChange={set}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@example.com"
              />
              {emailInvalid && (
                <span className="acct-field-hint">Must include an @ symbol — e.g. name@example.com</span>
              )}
            </Field>

            <Field label="Password" required>
              <input className="acct-input" type="password" name="password" value={form.password} onChange={set} placeholder="Create a password" />
            </Field>

            <Field label="Confirm Password" required>
              <input className="acct-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={set} placeholder="Repeat your password" />
            </Field>

            {error && <p className="acct-error">{error}</p>}

            <div className="acct-actions">
              <button className="acct-btn-outline" onClick={onClose}>Cancel</button>
              <button className="acct-btn-primary" onClick={handleNext}>Next →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="acct-section">
            <div className="acct-row">
              <Field label="First Name" required>
                <input className="acct-input" type="text" name="first_name" value={form.first_name} onChange={set} placeholder="Jane" />
              </Field>
              <Field label="Last Name" required>
                <input className="acct-input" type="text" name="last_name" value={form.last_name} onChange={set} placeholder="Doe" />
              </Field>
            </div>

            <div className="acct-row">
              <Field label="Date of Birth" required>
                <input className="acct-input" type="date" name="date_of_birth" value={form.date_of_birth} onChange={set} />
              </Field>
              <Field label="Phone Number" required>
                <input className="acct-input" type="tel" name="phone_number" value={form.phone_number} onChange={set} placeholder="+1 555 000 0000" />
              </Field>
            </div>

            <Field label="Address" required>
              <input className="acct-input" type="text" name="address" value={form.address} onChange={set} placeholder="123 Main St, City, Country" />
            </Field>

            <Field label="ID / Passport Number" required>
              <input className="acct-input" type="text" name="id_number" value={form.id_number} onChange={set} placeholder="ID or passport number" />
            </Field>

            <div className="acct-row">
              <Field label="Seat Preference">
                <select className="acct-input" name="seat_preferences" value={form.seat_preferences} onChange={set}>
                  <option value="">No preference</option>
                  {SEAT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Meal Preference">
                <select className="acct-input" name="meal_preferences" value={form.meal_preferences} onChange={set}>
                  {MEAL_OPTIONS.map((o) => <option key={o} value={o === "No preference" ? "" : o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Special Needs">
              <select className="acct-input" name="special_needs" value={form.special_needs} onChange={set}>
                {SPECIAL_NEEDS_OPTIONS.map((o) => <option key={o} value={o === "None" ? "" : o}>{o}</option>)}
              </select>
            </Field>

            <div className="acct-check-row">
              <label className="acct-check">
                <input type="checkbox" name="passport_status" checked={form.passport_status} onChange={set} />
                I have a valid passport
              </label>
              <label className="acct-check">
                <input type="checkbox" name="visa_status" checked={form.visa_status} onChange={set} />
                I have an active visa
              </label>
            </div>

            {error && <p className="acct-error">{error}</p>}

            <div className="acct-actions">
              <button className="acct-btn-outline" onClick={() => { setStep(1); setError(""); }}>← Back</button>
              <button className="acct-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating…" : "Create Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Edit Account Modal ──────────────────────────────────────────────────────

export function EditAccountModal({ user, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    date_of_birth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
    phone_number: user.phone_number || "",
    address: user.address || "",
    id_number: user.id_number || "",
    passport_status: !!user.passport_status,
    visa_status: !!user.visa_status,
    country_of_origin: user.country_of_origin || "",
    seat_preferences: user.seat_preferences || "",
    meal_preferences: user.meal_preferences || "",
    special_needs: user.special_needs || "",
    password: "",
    confirmPassword: "",
  });

  const set = (e) =>
    setForm({ ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const validate = () => {
    const required = ["first_name", "last_name", "date_of_birth", "phone_number", "address", "id_number"];
    for (const f of required) {
      if (!form[f].toString().trim()) return `${f.replace(/_/g, " ")} is required.`;
    }
    if (form.password && form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      delete payload.confirmPassword;

      const res = await fetch(`${API}/account/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Update failed."); return; }
      setSuccess("Account updated successfully!");
      onSaved({ ...user, ...form });
    } catch {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="acct-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="acct-modal">
        <button className="acct-close" onClick={onClose}>✕</button>
        <div className="acct-header">
          <div className="acct-logo">RHA</div>
          <h2>Edit Account</h2>
          <p className="acct-sub">{user.email} · <span className="acct-role-tag">{user.role}</span></p>
        </div>

        <div className="acct-section">
          <div className="acct-row">
            <Field label="First Name" required>
              <input className="acct-input" type="text" name="first_name" value={form.first_name} onChange={set} />
            </Field>
            <Field label="Last Name" required>
              <input className="acct-input" type="text" name="last_name" value={form.last_name} onChange={set} />
            </Field>
          </div>

          <div className="acct-row">
            <Field label="Date of Birth" required>
              <input className="acct-input" type="date" name="date_of_birth" value={form.date_of_birth} onChange={set} />
            </Field>
            <Field label="Phone Number" required>
              <input className="acct-input" type="tel" name="phone_number" value={form.phone_number} onChange={set} />
            </Field>
          </div>

          <Field label="Address" required>
            <input className="acct-input" type="text" name="address" value={form.address} onChange={set} />
          </Field>

          <Field label="ID / Passport Number" required>
            <input className="acct-input" type="text" name="id_number" value={form.id_number} onChange={set} />
          </Field>

          <div className="acct-row">
            <Field label="Seat Preference">
              <select className="acct-input" name="seat_preferences" value={form.seat_preferences} onChange={set}>
                <option value="">No preference</option>
                {SEAT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Meal Preference">
              <select className="acct-input" name="meal_preferences" value={form.meal_preferences} onChange={set}>
                {MEAL_OPTIONS.map((o) => <option key={o} value={o === "No preference" ? "" : o}>{o}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Special Needs">
            <select className="acct-input" name="special_needs" value={form.special_needs} onChange={set}>
              {SPECIAL_NEEDS_OPTIONS.map((o) => <option key={o} value={o === "None" ? "" : o}>{o}</option>)}
            </select>
          </Field>

          <div className="acct-check-row">
            <label className="acct-check">
              <input type="checkbox" name="passport_status" checked={form.passport_status} onChange={set} />
              Valid passport
            </label>
            <label className="acct-check">
              <input type="checkbox" name="visa_status" checked={form.visa_status} onChange={set} />
              Active visa
            </label>
          </div>

          <div className="acct-divider">
            <span>Change Password <em>(leave blank to keep current)</em></span>
          </div>

          <div className="acct-row">
            <Field label="New Password">
              <input className="acct-input" type="password" name="password" value={form.password} onChange={set} placeholder="New password" />
            </Field>
            <Field label="Confirm New Password">
              <input className="acct-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={set} placeholder="Repeat new password" />
            </Field>
          </div>

          {error && <p className="acct-error">{error}</p>}
          {success && <p className="acct-success">{success}</p>}

          <div className="acct-actions">
            <button className="acct-btn-outline" onClick={onClose}>Cancel</button>
            <button className="acct-btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import DrugCard from "./DrugCard";
import QRScanner from "qr-scanner";

const API_URL = "https://balsam-beta-backend.onrender.com";

function StoragePage() {
  const [drugs, setDrugs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newDrug, setNewDrug] = useState({
    BrandName: "",
    ScientificName: "",
    PurchaseDate: "",
    ExpirationDate: "",
    PurchasePrice: "",
    SellingPrice: "",
    Quantity: "",
    Location: "",
    Tags: "",
    Group: "",
  });

  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("userId");

  // Fetch drugs on mount
  useEffect(() => {
    fetch(`${API_URL}/drugs/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setDrugs(data.drugs);
      })
      .catch(console.error);
  }, [userId]);

  // Unified QR handler
  const handleQRScan = async (value) => {
    try {
      console.log("QR detected:", value);
      const response = await fetch(`${API_URL}/drugs/qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: value, UserId: userId }),
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Drug added from QR code!");
        setDrugs(prev => [...prev, JSON.parse(JSON.stringify(data.result))]);
        setShowQRModal(false);
      } else {
        alert("❌ Failed:\n" + data.error);
      }
    } catch (err) {
      alert("❌ Error:\n" + err.message);
      console.error(err);
    }
  };

  // Handle image selection for QR scan
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await QRScanner.scanImage(file, { returnDetailedScanResult: true });
      console.log("🟢 Photo-based QR detected:", result.data);
      await handleQRScan(result.data);
    } catch (err) {
      console.error("Failed to scan QR from image:", err);
      alert("❌ Could not detect QR code from the photo.");
    }
  };

  // Handle manual input for creating drugs
  const handleCreateInput = (e) => {
    const { name, value } = e.target;
    setNewDrug(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateDrug = async () => {
    try {
      const payload = {
        UserId: userId,
        BrandName: newDrug.BrandName || null,
        ScientificName: newDrug.ScientificName || null,
        PurchaseDate: newDrug.PurchaseDate || null,
        ExpirationDate: newDrug.ExpirationDate || null,
        PurchasePrice: newDrug.PurchasePrice ? parseInt(newDrug.PurchasePrice) : null,
        SellingPrice: newDrug.SellingPrice ? parseInt(newDrug.SellingPrice) : null,
        Quantity: newDrug.Quantity ? parseInt(newDrug.Quantity) : null,
        Location: newDrug.Location || null,
        Tags: newDrug.Tags?.trim() || null,
        Group: newDrug.Group || "Unknown",
      };

      const response = await fetch(`${API_URL}/drugs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        alert("Drug created!");
        setDrugs(prev => [...prev, data.drug]);
        setShowCreateModal(false);
        setNewDrug({
          BrandName: "",
          ScientificName: "",
          PurchaseDate: "",
          ExpirationDate: "",
          PurchasePrice: "",
          SellingPrice: "",
          Quantity: "",
          Location: "",
          Tags: "",
          Group: "",
        });
      } else {
        alert("Failed to create drug");
      }
    } catch (err) {
      console.error("Error creating drug:", err);
      alert("Error creating drug");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Storage Page</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => setShowCreateModal(true)}>Add Drug Manually</button>
        <button onClick={() => {
          setShowQRModal(true);
          fileInputRef.current?.click();
        }}>Scan QR Code</button>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handlePhotoChange}
      />

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {drugs.map(drug => (
          <DrugCard
            key={drug.id}
            {...drug}
            userId={userId}
            onDelete={(id) => setDrugs(prev => prev.filter(d => d.id !== id))}
            onUpdate={(updated) => setDrugs(prev => prev.map(d => d.id === updated.id ? updated : d))}
          />
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "400px" }}>
            <h3>Create Drug</h3>
            {Object.keys(newDrug).map(key => (
              <div key={key} style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontWeight: "bold" }}>{key}</label>
                <input
                  name={key}
                  type={key.includes("Price") || key === "Quantity" ? "number" :
                    key.includes("Date") ? "date" : "text"}
                  value={newDrug[key]}
                  onChange={handleCreateInput}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={handleCreateDrug}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoragePage;

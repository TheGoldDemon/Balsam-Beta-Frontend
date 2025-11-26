import { useState, useEffect, useRef } from "react";
import DrugCard from "./DrugCard";
import QRScanner from "qr-scanner";

const API_URL = "https://balsam-beta-backend.onrender.com";

function StoragePage() {
  const [drugs, setDrugs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
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

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const userId = localStorage.getItem("userId");

  // Fetch drugs
  useEffect(() => {
    fetch(`${API_URL}/drugs/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setDrugs(data.drugs);
      })
      .catch(console.error);
  }, [userId]);

  // Handle QR scan result
  const handleQRResult = async (value) => {
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
      } else {
        alert("❌ Failed:\n" + data.error);
      }
    } catch (err) {
      alert("❌ Error:\n" + err.message);
      console.error(err);
    }
  };

  // =========================================
  // Multiple image selection
  // =========================================
  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    for (let file of files) {
      try {
        const result = await QRScanner.scanImage(file, { returnDetailedScanResult: true });
        if (result) await handleQRResult(result.data);
      } catch (err) {
        console.error("Error scanning image:", err);
      }
    }
    e.target.value = "";
  };

  // =========================================
  // Camera capture
  // =========================================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      streamRef.current = stream;
      setShowCameraModal(true);
    } catch (err) {
      console.error("Cannot start camera:", err);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const result = await QRScanner.scanImage(canvas, { returnDetailedScanResult: true });
      if (result) {
        await handleQRResult(result.data);
      } else {
        alert("❌ No QR code detected. Try again.");
      }
    } catch (err) {
      console.error("Error scanning captured photo:", err);
      alert("Error scanning QR code");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCameraModal(false);
  };

  // =========================================
  // Manual drug creation
  // =========================================
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
      } else alert("Failed to create drug");
    } catch (err) {
      console.error(err);
      alert("Error creating drug");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Storage Page</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => setShowCreateModal(true)}>Add Drug Manually</button>
        <button onClick={() => fileInputRef.current?.click()}>Select Images</button>
        <button onClick={startCamera}>Capture QR with Camera</button>
      </div>

      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handlePhotoChange}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
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

      {/* Camera Modal */}
      {showCameraModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000,
          flexDirection: "column"
        }}>
          <video
            ref={videoRef}
            style={{ width: "300px", height: "300px", borderRadius: "8px", objectFit: "cover" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button onClick={capturePhoto}>Snap Photo</button>
            <button onClick={stopCamera}>Close Camera</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoragePage;

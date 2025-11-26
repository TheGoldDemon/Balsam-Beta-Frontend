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

  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
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
  const handleNativeQRScan = async (value) => {
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

  // QR scanning effect
  useEffect(() => {
    if (!showQRModal) return;

    const video = videoRef.current;
    let stopNative = false;
    let fallbackCancelled = false;

    // Native BarcodeDetector
    const startNativeScanner = async () => {
      if (!("BarcodeDetector" in window)) return false;

      let formats = [];
      try {
        formats = await window.BarcodeDetector.getSupportedFormats();
      } catch {}

      if (!formats.includes("qr_code")) return false;

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      console.log("✅ Native BarcodeDetector supported, starting scan...");

      // ---- Advanced constraints applied here ----
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: "continuous", // experimental
          zoom: true,               // experimental
        },
      });
      // -----------------------------------------

      video.srcObject = stream;
      await video.play();

      const scanLoop = async () => {
        if (stopNative) return stream.getTracks().forEach(t => t.stop());

        try {
          const results = await detector.detect(video);
          if (results.length > 0) {
            stopNative = true;
            stream.getTracks().forEach(t => t.stop());

            console.log("🟢 Native QR detected:", results[0].rawValue);
            await handleNativeQRScan(results[0].rawValue);
            return;
          }
        } catch (err) {
          console.warn("Native scan error:", err);
        }

        requestAnimationFrame(scanLoop);
      };

      scanLoop();
      return true;
    };

    // Fallback qr-scanner
    const startFallbackScanner = async () => {
      fallbackCancelled = false;

      const retry = async () => {
        while (!fallbackCancelled) {
          try {
            const devices = await QRScanner.listCameras(true);
            if (!devices.length) throw new Error("No cameras found");

            const scanner = new QRScanner(video, (result) => {
              console.log("🟡 Fallback QR detected:", result.data || result);
              handleNativeQRScan(result.data || result);
              scanner.stop();
            }, {
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 5,
              preferredCamera: "environment",
            });

            await scanner.start();
            qrScannerRef.current = scanner;
            console.log("⚡ Fallback QRScanner started");
            break;
          } catch (err) {
            console.warn("Retrying fallback scanner in 1s...", err);
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      };

      retry();
    };

    startNativeScanner().then((supported) => {
      if (!supported) {
        console.log("⚠ Native QR not supported → starting fallback");
        startFallbackScanner();
      }
    });

    return () => {
      stopNative = true;
      fallbackCancelled = true;
      qrScannerRef.current?.stop();
      qrScannerRef.current = null;
    };
  }, [showQRModal]);

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
        <button onClick={() => setShowQRModal(true)}>Scan QR Code</button>
      </div>

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

      {/* QR Scanner Modal */}
      {showQRModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000,
          flexDirection: "column", position: "relative"
        }}>
          <video ref={videoRef} style={{
            width: "300px", height: "300px",
            borderRadius: "8px", objectFit: "cover"
          }} />

          {/* Scan guide */}
          <div style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            border: "2px dashed #0f0",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none"
          }} />

          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button onClick={() => setShowQRModal(false)}>Cancel</button>
            <button onClick={() => qrScannerRef.current?.toggleFlash?.()}>Toggle Flash</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoragePage;

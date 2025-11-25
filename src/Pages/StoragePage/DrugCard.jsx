import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const DrugCard = ({
  id, // Drug ID
  BrandName,
  ScientificName,
  PurchaseDate,
  ExpirationDate,
  PurchasePrice,
  SellingPrice,
  Quantity,
  Location,
  Tags,
  Group,
  userId, // Needed for update/delete requests
  onDelete, // Callback to remove from parent state
  onUpdate, // Callback to update parent state
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    BrandName,
    ScientificName,
    PurchaseDate,
    ExpirationDate,
    PurchasePrice,
    SellingPrice,
    Quantity,
    Location,
    Tags: Array.isArray(Tags) ? Tags.join(', ') : '',
    Group,
  });

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(prev => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const updates = {
        ...formData,
        PurchasePrice: formData.PurchasePrice ? parseInt(formData.PurchasePrice) : null,
        SellingPrice: formData.SellingPrice ? parseInt(formData.SellingPrice) : null,
        Quantity: formData.Quantity ? parseInt(formData.Quantity) : null,
        Tags: formData.Tags?.trim() || null, // ← Prisma-safe
      };

      const response = await fetch(`${API_URL}/drugs/update/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserId: userId, updates }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Drug updated successfully!');
        onUpdate && onUpdate(data.updated);
        setShowEditModal(false);
      } else {
        alert('Failed to update drug');
      }
    } catch (err) {
      console.error('Error updating drug data:', err);
      alert('Error updating drug');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this drug?')) return;
    try {
      const response = await fetch(`${API_URL}/drugs/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserId: userId }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Drug deleted!');
        onDelete && onDelete(id);
      } else {
        alert('Failed to delete drug');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting drug');
    }
  };

  return (
    <>
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px',
          width: '250px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          transition: '0.3s',
        }}
        onClick={toggleDetails}
      >
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ margin: '0', fontSize: '18px' }}>{BrandName}</h2>
          <p style={{ margin: '0', color: '#555' }}>{ScientificName || '-'}</p>
          <p style={{ margin: '4px 0', fontWeight: 'bold' }}>${SellingPrice ?? '-'}</p>
          <p style={{ margin: '0', color: '#777' }}>Location: {Location || '-'}</p>
        </div>

        {showDetails && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: '#f9f9f9',
              borderRadius: '6px',
              border: '1px solid #eee',
            }}
          >
            <p><strong>Purchase Date:</strong> {PurchaseDate || '-'}</p>
            <p><strong>Expiration Date:</strong> {ExpirationDate || '-'}</p>
            <p><strong>Purchase Price:</strong> ${PurchasePrice ?? '-'}</p>
            <p><strong>Selling Price:</strong> ${SellingPrice ?? '-'}</p>
            <p><strong>Quantity:</strong> {Quantity ?? '-'}</p>
            <p><strong>Location:</strong> {Location || '-'}</p>
            <p><strong>Tags:</strong> {Tags || '-'}</p>
            <p><strong>Group:</strong> {Group || '-'}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}>Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Edit Drug</h3>
            {Object.keys(formData).map(key => (
              <div key={key} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>{key}</label>
                <input
                  type={key.includes("Price") || key === "Quantity" ? 'number' : key.includes("Date") ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                {key === 'Tags' && <small>Separate multiple tags with commas</small>}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleUpdate}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DrugCard;

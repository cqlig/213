import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';


const CreateTicket = () => {
  
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    event_name: 'La asunción de Figuras'
  });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/tickets', formData);
      setTicket(response.data);
      setFormData({
        buyer_name: '',
        buyer_email: '',
        event_name: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };



  const downloadQROnly = async () => {
    try {
      // Crear un div temporal con el QR
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '40px';
      tempDiv.style.width = '400px';
      tempDiv.style.height = '400px';
      tempDiv.style.display = 'flex';
      tempDiv.style.alignItems = 'center';
      tempDiv.style.justifyContent = 'center';
      
      document.body.appendChild(tempDiv);
      
      // Crear el QR en el div temporal
      const qrContainer = document.createElement('div');
      tempDiv.appendChild(qrContainer);
      
      // Usar QRCode.react para renderizar el QR
      const { default: QRCodeReact } = await import('qrcode.react');
      const qrElement = document.createElement('div');
      qrContainer.appendChild(qrElement);
      
      // Renderizar el QR usando React
      const React = await import('react');
      const ReactDOM = await import('react-dom');
      
      ReactDOM.render(
        React.createElement(QRCodeReact, {
          value: ticket.id,
          size: 320,
          level: 'H',
          includeMargin: true,
          bgColor: '#ffffff',
          fgColor: '#000000'
        }),
        qrElement
      );
      
      // Esperar un momento para que se renderice
      setTimeout(async () => {
        try {
          // Capturar el QR con html2canvas
          const canvas = await html2canvas(qrContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            width: 400,
            height: 400
          });
          
          // Descargar la imagen
          const link = document.createElement('a');
          link.download = `QR-${ticket.buyer_name.replace(/\s+/g, '_')}-${ticket.event_name.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
          
          // Limpiar el div temporal
          document.body.removeChild(tempDiv);
        } catch (error) {
          console.error('Error capturing QR:', error);
          document.body.removeChild(tempDiv);
          alert('Error al capturar el QR. Por favor intenta nuevamente.');
        }
      }, 200);
      
    } catch (error) {
      console.error('Error downloading QR:', error);
      alert('Error al descargar el QR. Por favor intenta nuevamente.');
    }
  };

  return (
    <div>
      <div className="form-container">
        <h2>✨ Crear Nueva Entrada</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="buyer_name">Nombre del Comprador *</label>
            <input
              type="text"
              id="buyer_name"
              name="buyer_name"
              value={formData.buyer_name}
              onChange={handleInputChange}
              required
              placeholder="Ingresa el nombre completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="buyer_email">Correo Electrónico</label>
            <input
              type="email"
              id="buyer_email"
              name="buyer_email"
              value={formData.buyer_email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="event_name">Nombre del Evento *</label>
            <input
              type="text"
              id="event_name"
              name="event_name"
              value={formData.event_name}
              readOnly
              required
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Entrada'}
          </button>
        </form>

        {error && (
          <div className="result-message result-error">
            {error}
          </div>
        )}
      </div>

      {ticket && (
        <div className="ticket-container">
          <div id="ticket-to-print">
            <div className="ticket-header">
              <h2>🎫 Entrada Generada Exitosamente</h2>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>ID: {ticket.id}</p>
            </div>

            <div className="ticket-info">
              <div>
                <strong>Comprador:</strong>
                <p>{ticket.buyer_name}</p>
              </div>
              {ticket.buyer_email && (
                <div>
                  <strong>Correo:</strong>
                  <p>{ticket.buyer_email}</p>
                </div>
              )}
              <div>
                <strong>Evento:</strong>
                <p>{ticket.event_name}</p>
              </div>
              <div>
                <strong>Fecha de Creación:</strong>
                <p>{new Date(ticket.created_at).toLocaleString('es-ES')}</p>
              </div>
              <div>
                <strong>Estado:</strong>
                <span className={`status-badge status-valid`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div className="qr-container">
              <QRCode 
                value={ticket.id} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>



          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <button 
              onClick={downloadQROnly} 
              className="print-button" 
              style={{ 
                background: 'var(--primary-gradient)',
                minWidth: '200px',
                height: '45px',
                fontSize: '1rem',
                padding: '0 25px',
                borderRadius: '12px',
                fontWeight: '500'
              }}
            >
              📱 Descargar QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicket;
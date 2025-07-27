import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';


const TicketViewer = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tickets/${id}`);
      setTicket(response.data);
    } catch (err) {
      setError('Ticket no encontrado');
      console.error('Error fetching ticket:', err);
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

  const getStatusBadgeClass = (status) => {
    return status === 'Válido' ? 'status-valid' : 'status-redeemed';
  };

  if (loading) {
    return (
      <div className="form-container">
        <h2>Detalles del Ticket</h2>
        <p>Cargando ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="form-container">
        <h2>Detalles del Ticket</h2>
        <div className="result-message result-error">
          {error}
        </div>
        <Link to="/tickets" className="nav-button">
          Volver a la Lista
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="ticket-container">
        <div id="ticket-to-print">
                      <div className="ticket-header">
              <h2>🎫 Detalles del Ticket</h2>
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
              <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
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



                  <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
            <Link 
              to="/tickets" 
              className="nav-button" 
              style={{ 
                background: 'var(--secondary-gradient)',
                minWidth: '200px',
                height: '45px',
                fontSize: '1rem',
                padding: '0 25px',
                borderRadius: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              📋 Volver a la Lista
            </Link>
          </div>
      </div>
    </div>
  );
};

export default TicketViewer; 
import React, { useState, useRef } from 'react';
import axios from 'axios';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';

const TicketScanner = () => {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanningImage, setScanningImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Manejar el ciclo de vida del escáner de cámara
  React.useEffect(() => {
    if (!isCameraActive) {
      if (html5QrCodeRef.current) {
        const safeStopAndClear = async () => {
          try {
            if (typeof html5QrCodeRef.current.getState === 'function' && html5QrCodeRef.current.getState() === 2) {
              await html5QrCodeRef.current.stop();
            }
          } catch (e) {}
          try {
            await html5QrCodeRef.current.clear();
          } catch (e) {}
          html5QrCodeRef.current = null;
        };
        safeStopAndClear();
      }
      return;
    }
    // Iniciar escáner
    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      async (decodedText, decodedResult) => {
        setTicketId(decodedText);
        await validateTicket(decodedText);
        setIsCameraActive(false);
        try { await html5QrCode.stop(); } catch (e) {}
        try { await html5QrCode.clear(); } catch (e) {}
      },
      (errorMessage) => {
        // Solo mostrar errores importantes
        // setError('Error al escanear: ' + errorMessage);
      }
    ).catch((err) => {
      setError('No se pudo acceder a la cámara: ' + err);
      setIsCameraActive(false);
    });
    return () => {
      if (html5QrCode) {
        const safeStopAndClear = async () => {
          try {
            if (typeof html5QrCode.getState === 'function' && html5QrCode.getState() === 2) {
              await html5QrCode.stop();
            }
          } catch (e) {}
          try {
            await html5QrCode.clear();
          } catch (e) {}
        };
        safeStopAndClear();
      }
      html5QrCodeRef.current = null;
    };

  }, [isCameraActive]);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) {
      setError('Por favor ingresa un ID de ticket');
      return;
    }

    validateTicket(ticketId);
  };

  const handleRedeem = async () => {
    if (!result?.valid || result?.already_redeemed) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/tickets/redeem', {
        ticket_id: ticketId.trim()
      });

      // Update the result to show as redeemed
      setResult({
        ...result,
        ticket: {
          ...result.ticket,
          status: 'Canjeado'
        },
        already_redeemed: true,
        message: response.data.message || '🎉 ¡Ticket canjeado exitosamente! ¡Que disfrute el evento!',
        success: true
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al canjear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setTicketId('');
    setResult(null);
    setError('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Función para manejar la selección de imagen
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        setError('');
      } else {
        setError('Por favor selecciona un archivo de imagen válido');
      }
    }
  };

  // Función para escanear QR desde imagen
  const scanQRFromImage = async () => {
    if (!selectedImage) {
      setError('Por favor selecciona una imagen primero');
      return;
    }

    setScanningImage(true);
    setError('');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          console.log('QR Code encontrado:', code.data);
          setTicketId(code.data);
          setScanningImage(false);
          // Automáticamente validar el ticket encontrado
          validateTicket(code.data);
        } else {
          setError('No se encontró ningún código QR en la imagen. Asegúrate de que la imagen sea clara y el QR esté bien visible.');
          setScanningImage(false);
        }
      };
      
      img.onerror = () => {
        setError('Error al cargar la imagen');
        setScanningImage(false);
      };
      
      img.src = imagePreview;
    } catch (error) {
      console.error('Error scanning QR:', error);
      setError('Error al escanear el código QR');
      setScanningImage(false);
    }
  };

  // Función para validar ticket (extraída de handleValidate)
  const validateTicket = async (ticketIdToValidate) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/tickets/validate', {
        ticket_id: ticketIdToValidate.trim()
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al validar el ticket');
    } finally {
      setLoading(false);
    }
  };

  const getResultClass = () => {
    if (!result) return '';
    if (result.success) return 'result-success'; // Ticket recién canjeado
    if (result.valid && !result.already_redeemed) return 'result-success';
    if (result.already_redeemed) return 'result-warning';
    return 'result-error';
  };

  return (
    <div>
      <div className="scanner-container">
        <h2>🔍 Escanear/Validar Entrada</h2>
        <p style={{ textAlign: 'center', color: '#718096', fontSize: '1.1rem' }}>
          Ingresa el ID del ticket, escanea el código QR o sube una foto del QR
        </p>

        {/* Método 1: Ingresar ID manualmente */}
        <div className="scanner-method" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '16px' }}>📝 Ingresar ID Manualmente</h3>
          <form onSubmit={handleValidate}>
            <input
              type="text"
              className="scanner-input"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="Pega aquí el ID del ticket..."
              disabled={loading}
            />

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !ticketId.trim()}
            >
              {loading ? 'Validando...' : 'Validar Ticket'}
            </button>
          </form>
        </div>

        {/* Método 2: Escanear con cámara */}
        <div className="scanner-method" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '16px' }}>📱 Escanear con Cámara</h3>
          <button 
            type="button"
            className="nav-button"
            onClick={() => setIsCameraActive(!isCameraActive)}
            style={{ 
              background: isCameraActive ? '#dc3545' : 'var(--secondary-gradient)',
              marginBottom: '10px'
            }}
          >
            {isCameraActive ? '🚫 Detener Cámara' : '📷 Activar Cámara'}
          </button>

          {isCameraActive && (
            <div style={{ marginTop: '20px' }}>
              <div id="qr-reader" style={{ width: '100%' }} />
            </div>
          )}
        </div>

        {/* Método 3: Subir imagen del QR */}
        <div className="scanner-method" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '16px' }}>📷 Subir Foto del QR</h3>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              type="button"
              className="nav-button"
              onClick={() => fileInputRef.current.click()}
              style={{ 
                marginRight: '10px', 
                background: 'var(--secondary-gradient)',
                marginBottom: '10px',
                minWidth: 'fit-content'
              }}
            >
              📁 Seleccionar Imagen
            </button>
            {selectedImage && (
              <button 
                type="button"
                className="submit-button"
                onClick={scanQRFromImage}
                disabled={scanningImage}
                style={{ background: '#28a745' }}
              >
                {scanningImage ? 'Escaneando...' : '🔍 Escanear QR'}
              </button>
            )}
          </div>

          {imagePreview && (
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  border: '2px solid #ddd',
                  borderRadius: '8px'
                }} 
              />
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                {selectedImage?.name}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="result-message result-error">
            {error}
          </div>
        )}

        {result && (
          <div className={`result-message ${getResultClass()}`}>
            <h3>{result.message}</h3>
            
            {result.ticket && (
              <div className="ticket-info">
                <div>
                  <strong>Comprador:</strong>
                  <p>{result.ticket.buyer_name}</p>
                </div>
                {result.ticket.buyer_email && (
                  <div>
                    <strong>Correo:</strong>
                    <p>{result.ticket.buyer_email}</p>
                  </div>
                )}
                <div>
                  <strong>Evento:</strong>
                  <p>{result.ticket.event_name}</p>
                </div>
                <div>
                  <strong>ID:</strong>
                  <p>{result.ticket.id}</p>
                </div>
                <div>
                  <strong>Creado:</strong>
                  <p>{new Date(result.ticket.created_at).toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <strong>Estado:</strong>
                  <span className={`status-badge ${result.ticket.status === 'Válido' ? 'status-valid' : 'status-redeemed'}`}>
                    {result.ticket.status}
                  </span>
                </div>
              </div>
            )}

            {result.valid && !result.already_redeemed && !result.success && (
              <button 
                onClick={handleRedeem}
                className="submit-button"
                disabled={loading}
                style={{ marginTop: '20px', background: 'var(--success-gradient)' }}
              >
                {loading ? 'Canjeando...' : '✅ Canjear Ticket'}
              </button>
            )}

            {result.already_redeemed && !result.success && (
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: 'var(--warning-gradient)', 
                color: 'white', 
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                ⚠️ Este ticket ya fue canjeado anteriormente
              </div>
            )}

            {result.success && (
              <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                background: 'var(--success-gradient)', 
                color: 'white', 
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                {result.message}
              </div>
            )}
          </div>
        )}

        <button 
          onClick={clearForm}
          className="nav-button"
          style={{ marginTop: '20px', background: '#6c757d' }}
        >
          🔄 Limpiar Formulario
        </button>
      </div>
    </div>
  );
};

export default TicketScanner; 
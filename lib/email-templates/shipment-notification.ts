// Email template types
interface ShipmentNotificationEmailProps {
  // Sender Information
  senderName: string;
  senderTC: string;
  senderAddress: string;
  senderContact: string;
  senderPhoneCode?: string;
  
  // Receiver Information
  receiverName: string;
  receiverAddress: string;
  cityPostal: string;
  destination: string;
  receiverContact: string;
  receiverPhoneCode?: string;
  receiverEmail: string;
  
  // Shipment Information
  contentDescription: string;
  contentValue?: number;
  
  // Price Card Information
  selectedCarrier?: string;
  cargoPrice?: number;
  serviceType?: string;
  packageQuantity?: number;
  totalWeight?: number;
  chargeableWeight?: number;
  destinationCountry?: string;
  // Optional enhanced fields (if available)
  actualWeight?: number;
  volumetricWeight?: number;
  calculationMethod?: string;
  region?: string | number;
  
  // Metadata
  submissionId: string;
  submittedAt: string;
}

// Export a function to generate plain HTML string
export function generateShipmentNotificationHTML(props: ShipmentNotificationEmailProps): string {
  const formatPhoneNumber = (code?: string, number?: string) => {
    if (!number) return 'N/A';
    return code ? `${code} ${number}` : number;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Shipment Request</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 700px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 20px;
    }
    .section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      flex: 0 0 40%;
    }
    .info-value {
      color: #333;
      flex: 1;
      text-align: right;
      word-break: break-word;
    }
    .price-card {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .price-card h3 {
      margin: 0 0 15px 0;
      color: #667eea;
      font-size: 16px;
    }
    .price-highlight {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
      margin: 10px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }
    .metadata {
      background: #f0f4ff;
      padding: 15px;
      border-radius: 8px;
      font-size: 12px;
      color: #666;
    }
    .metadata strong {
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚚 New Shipment Request</h1>
      <p>A new shipment request has been submitted through the website</p>
    </div>

    <div class="content">
      <!-- Sender Information -->
      <div class="section">
        <div class="section-title">📤 Sender Information</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${props.senderName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">TC/Tax No:</span>
            <span class="info-value">${props.senderTC}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Contact:</span>
            <span class="info-value">${formatPhoneNumber(props.senderPhoneCode, props.senderContact)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span class="info-value">${props.senderAddress}</span>
          </div>
        </div>
      </div>

      <!-- Receiver Information -->
      <div class="section">
        <div class="section-title">📥 Receiver Information</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${props.receiverName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${props.receiverEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Contact:</span>
            <span class="info-value">${formatPhoneNumber(props.receiverPhoneCode, props.receiverContact)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Destination:</span>
            <span class="info-value">${props.destination} (${props.destinationCountry || 'N/A'})</span>
          </div>
          <div class="info-row">
            <span class="info-label">City/Postal:</span>
            <span class="info-value">${props.cityPostal}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span class="info-value">${props.receiverAddress}</span>
          </div>
        </div>
      </div>

      <!-- Shipment Information -->
      <div class="section">
        <div class="section-title">📦 Shipment Information</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Content:</span>
            <span class="info-value">${props.contentDescription}</span>
          </div>
          ${props.contentValue ? `
          <div class="info-row">
            <span class="info-label">Value:</span>
            <span class="info-value">$${typeof props.contentValue === 'number' ? props.contentValue.toFixed(2) : props.contentValue}</span>
          </div>
          ` : ''}
          ${props.packageQuantity ? `
          <div class="info-row">
            <span class="info-label">Quantity:</span>
            <span class="info-value">${props.packageQuantity} box(es)</span>
          </div>
          ` : ''}
          ${props.actualWeight ? `
          <div class="info-row">
            <span class="info-label">Actual Weight:</span>
            <span class="info-value">${props.actualWeight} kg ${props.calculationMethod === 'actual' ? '✓ (Used for calculation)' : ''}</span>
          </div>
          ` : ''}
          ${props.volumetricWeight ? `
          <div class="info-row">
            <span class="info-label">Volumetric Weight:</span>
            <span class="info-value">${props.volumetricWeight} kg ${props.calculationMethod === 'volumetric' ? '✓ (Used for calculation)' : ''}</span>
          </div>
          ` : ''}
          ${props.chargeableWeight ? `
          <div class="info-row">
            <span class="info-label">Chargeable Weight:</span>
            <span class="info-value"><strong>${props.chargeableWeight} kg</strong></span>
          </div>
          ` : ''}
          ${props.totalWeight ? `
          <div class="info-row">
            <span class="info-label">Total Weight:</span>
            <span class="info-value">${props.totalWeight} kg</span>
          </div>
          ` : ''}
        </div>

        ${props.selectedCarrier && props.cargoPrice ? `
        <div class="price-card">
          <h3>💰 Selected Shipping Option</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Carrier:</span>
              <span class="info-value">${props.selectedCarrier}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Service:</span>
              <span class="info-value">${props.serviceType || 'N/A'}</span>
            </div>
            ${props.region ? `
            <div class="info-row">
              <span class="info-label">Region:</span>
              <span class="info-value">${props.region}</span>
            </div>
            ` : ''}
          </div>
          <div class="price-highlight">
            Total Price: $${typeof props.cargoPrice === 'number' ? props.cargoPrice.toFixed(2) : props.cargoPrice}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Metadata -->
      <div class="metadata">
        <strong>Submission ID:</strong> ${props.submissionId}<br />
        <strong>Submitted At:</strong> ${new Date(props.submittedAt).toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'long'
        })}
      </div>
    </div>

    <div class="footer">
      <p><strong>Dexpell AI</strong> - Shipment Request Notification</p>
      <p>This is an automated email. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}


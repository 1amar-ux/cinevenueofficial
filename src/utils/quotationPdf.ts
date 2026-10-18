import { EventProposalRecord, EventQuotation } from "../types/entertainmentEvent";

/**
 * Generates an official, branded CineVenue Quotation Document
 * Company: CINEVENUE PVT LTD
 * Print / Save as PDF compliant vertical A4 layout
 */
export function generateAndDownloadQuotationPdf(
  proposal: EventProposalRecord,
  quotation: EventQuotation
): void {
  const htmlContent = generateQuotationHtml(proposal, quotation);
  const printWindow = window.open("", "_blank", "width=900,height=1150");

  if (!printWindow) {
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CineVenue_Quotation_${quotation.quotationNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 600);
}

function generateQuotationHtml(
  proposal: EventProposalRecord,
  quotation: EventQuotation
): string {
  const itemRows = quotation.items.map((item, index) => `
    <tr style="border-bottom: 1px solid #222228; ${index % 2 === 0 ? 'background: #111116;' : 'background: #0d0d11;'}">
      <td style="padding: 12px 14px; text-align: center; color: #888899; font-size: 13px;">${index + 1}</td>
      <td style="padding: 12px 14px;">
        <div style="font-weight: 700; color: #F5F5FA; font-size: 13px;">${item.serviceName}</div>
        <div style="font-size: 11px; color: #9A9AA8; margin-top: 3px;">${item.description || ''}</div>
      </td>
      <td style="padding: 12px 14px; text-align: center; color: #DDDDEE; font-size: 13px;">${item.quantity} ${item.unit}</td>
      <td style="padding: 12px 14px; text-align: right; color: #DDDDEE; font-size: 13px;">₹${item.unitPrice.toLocaleString('en-IN')}</td>
      <td style="padding: 12px 14px; text-align: right; font-weight: 700; color: #D4AF37; font-size: 13px;">₹${item.totalPrice.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const milestoneRows = quotation.paymentMilestones.map((m, idx) => `
    <tr style="border-bottom: 1px solid #1a1a22;">
      <td style="padding: 8px 10px; color: #888899; font-size: 11px;">Phase ${idx + 1}</td>
      <td style="padding: 8px 10px; color: #F0F0F5; font-size: 11px; font-weight: 600;">${m.milestone}</td>
      <td style="padding: 8px 10px; text-align: center; color: #D4AF37; font-size: 11px; font-weight: 700;">${m.percentage}%</td>
      <td style="padding: 8px 10px; text-align: right; color: #FFFFFF; font-size: 11px; font-weight: 700;">₹${m.amount.toLocaleString('en-IN')}</td>
      <td style="padding: 8px 10px; text-align: right; color: #888899; font-size: 11px;">${m.dueOn}</td>
    </tr>
  `).join('');

  const inclusionList = quotation.inclusions.map(inc => `<li style="margin-bottom: 4px;">${inc}</li>`).join('');
  const exclusionList = quotation.exclusions.map(exc => `<li style="margin-bottom: 4px;">${exc}</li>`).join('');
  const termsList = quotation.termsAndConditions.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CineVenue Event Quotation - ${quotation.quotationNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0B0B0E;
      color: #E2E2EA;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      line-height: 1.4;
    }
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      background: #0E0E14;
      border: 1px solid #2A2A38;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    }
    @media print {
      body {
        background: #0B0B0E;
      }
      .page-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Top Action Bar (hidden in print) -->
    <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #181822; border: 1px solid #333344; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 13px; color: #D4AF37; font-weight: 600;">
        Official CineVenue Quotation Document
      </div>
      <button onclick="window.print()" style="background: linear-gradient(135deg, #D4AF37, #AA820A); color: #000; font-weight: bold; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 12px;">
        Print / Save as PDF
      </button>
    </div>

    <!-- Letterhead Header -->
    <table style="width: 100%; border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 20px;">
      <tr>
        <td style="vertical-align: top;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; background: #D4AF37; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 20px; font-family: serif;">C</div>
            <div>
              <div style="font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF;">CINE<span style="color: #D4AF37;">VENUE</span></div>
              <div style="font-size: 9px; letter-spacing: 1.5px; color: #9A9AA8; text-transform: uppercase;">PVT LTD</div>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 10px; color: #888899; line-height: 1.4;">
            Cinematic Event Management & Production Directorate<br>
            Plot 42, Silicon Valley, Hitec City, Hyderabad - 500081, India<br>
            CIN: U92100TG2026PTC188290 | GSTIN: 36AAACC1234D1Z5<br>
            Web: www.cinevenue.com | Email: events@cinevenue.com
          </div>
        </td>
        <td style="vertical-align: top; text-align: right;">
          <div style="display: inline-block; background: #161620; border: 1px solid #D4AF37; border-radius: 8px; padding: 10px 16px; text-align: right;">
            <div style="font-size: 10px; color: #9A9AA8; text-transform: uppercase; letter-spacing: 1px;">QUOTATION REFERENCE</div>
            <div style="font-size: 16px; font-weight: 800; color: #D4AF37; margin-top: 2px;">${quotation.quotationNumber}</div>
            <div style="font-size: 10px; color: #777788; margin-top: 4px;">Revision ${quotation.revision} | Date: ${new Date(quotation.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div style="font-size: 10px; color: #4ADE80; font-weight: 600; margin-top: 3px;">Valid until: ${new Date(quotation.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Client & Event Meta Table -->
    <table style="width: 100%; margin-bottom: 22px; background: #121218; border: 1px solid #262634; border-radius: 8px; border-collapse: separate; border-spacing: 0;">
      <tr>
        <td style="width: 50%; padding: 14px; border-right: 1px solid #262634; vertical-align: top;">
          <div style="font-size: 10px; text-transform: uppercase; color: #D4AF37; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px;">QUOTATION PREPARED FOR</div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF;">${proposal.companyName}</div>
          <div style="font-size: 12px; color: #C0C0D0; margin-top: 2px;">Attn: ${proposal.contactPerson}</div>
          <div style="font-size: 11px; color: #8E8EA0; margin-top: 3px;">Mobile: ${proposal.mobile}</div>
          <div style="font-size: 11px; color: #8E8EA0;">Email: ${proposal.email}</div>
          ${proposal.officeAddress ? `<div style="font-size: 10px; color: #777788; margin-top: 3px;">Address: ${proposal.officeAddress}</div>` : ''}
        </td>
        <td style="width: 50%; padding: 14px; vertical-align: top;">
          <div style="font-size: 10px; text-transform: uppercase; color: #D4AF37; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px;">EVENT SPECIFICATIONS</div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF;">${proposal.eventName}</div>
          <div style="font-size: 12px; color: #C0C0D0; margin-top: 2px;">Type: <span style="color: #D4AF37;">${proposal.eventType}</span> (${proposal.category.replace('_', ' ').toUpperCase()})</div>
          <div style="font-size: 11px; color: #8E8EA0; margin-top: 3px;">Date: ${proposal.preferredDate} | City: ${proposal.preferredCity}</div>
          <div style="font-size: 11px; color: #8E8EA0;">Venue: ${proposal.preferredVenue}</div>
          <div style="font-size: 11px; color: #8E8EA0;">Expected Audience: ${proposal.expectedAudience.toLocaleString('en-IN')} Patrons</div>
        </td>
      </tr>
    </table>

    <!-- Services Table -->
    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #D4AF37; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px;">SCOPE OF SERVICES & COST BREAKDOWN</div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #2A2A38; border-radius: 6px; overflow: hidden;">
        <thead>
          <tr style="background: #181824; border-bottom: 2px solid #D4AF37; color: #D4AF37; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 10px; text-align: center; width: 40px;">#</th>
            <th style="padding: 10px; text-align: left;">Service Description & Deliverables</th>
            <th style="padding: 10px; text-align: center; width: 90px;">Qty / Unit</th>
            <th style="padding: 10px; text-align: right; width: 110px;">Unit Rate</th>
            <th style="padding: 10px; text-align: right; width: 120px;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <!-- Totals Table -->
    <table style="width: 100%; margin-bottom: 22px;">
      <tr>
        <td style="width: 55%; vertical-align: top; padding-right: 20px;">
          <div style="background: #121218; border: 1px solid #262634; border-radius: 6px; padding: 10px;">
            <div style="font-size: 10px; text-transform: uppercase; color: #D4AF37; font-weight: 700; margin-bottom: 6px;">PAYMENT MILESTONES</div>
            <table style="width: 100%; border-collapse: collapse;">
              ${milestoneRows}
            </table>
          </div>
        </td>
        <td style="width: 45%; vertical-align: top;">
          <div style="background: #14141E; border: 1px solid #333348; border-radius: 8px; padding: 14px;">
            <table style="width: 100%; font-size: 12px;">
              <tr>
                <td style="color: #9A9AA8; padding: 4px 0;">Subtotal:</td>
                <td style="text-align: right; color: #FFFFFF; font-weight: 600;">₹${quotation.subtotal.toLocaleString('en-IN')}</td>
              </tr>
              ${quotation.discountAmount > 0 ? `
              <tr>
                <td style="color: #4ADE80; padding: 4px 0;">Corporate Discount:</td>
                <td style="text-align: right; color: #4ADE80; font-weight: 600;">-₹${quotation.discountAmount.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr>
                <td style="color: #9A9AA8; padding: 4px 0;">GST (${quotation.taxRatePercent}%):</td>
                <td style="text-align: right; color: #FFFFFF; font-weight: 600;">₹${quotation.taxAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-top: 1px solid #D4AF37; font-size: 15px;">
                <td style="color: #D4AF37; font-weight: 800; padding: 10px 0 4px 0;">Grand Total:</td>
                <td style="text-align: right; color: #D4AF37; font-weight: 900; padding: 10px 0 4px 0;">₹${quotation.grandTotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="font-size: 10px; color: #888899; padding: 2px 0;">Required Advance (${quotation.advancePercentage}%):</td>
                <td style="text-align: right; font-size: 11px; color: #FFFFFF; font-weight: 700;">₹${quotation.advanceAmount.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <!-- Inclusions, Exclusions & Terms -->
    <table style="width: 100%; margin-bottom: 24px; font-size: 10px; border-collapse: separate; border-spacing: 8px;">
      <tr>
        <td style="width: 50%; background: #111116; border: 1px solid #22222E; border-radius: 6px; padding: 10px; vertical-align: top;">
          <div style="font-weight: 800; color: #4ADE80; margin-bottom: 6px; text-transform: uppercase;">✔ Inclusions</div>
          <ul style="margin: 0; padding-left: 16px; color: #B0B0C0; line-height: 1.5;">
            ${inclusionList}
          </ul>
        </td>
        <td style="width: 50%; background: #111116; border: 1px solid #22222E; border-radius: 6px; padding: 10px; vertical-align: top;">
          <div style="font-weight: 800; color: #F87171; margin-bottom: 6px; text-transform: uppercase;">✖ Exclusions</div>
          <ul style="margin: 0; padding-left: 16px; color: #B0B0C0; line-height: 1.5;">
            ${exclusionList}
          </ul>
        </td>
      </tr>
    </table>

    <!-- Terms and Conditions -->
    <div style="background: #0D0D12; border: 1px solid #20202A; border-radius: 6px; padding: 10px 14px; margin-bottom: 24px; font-size: 9.5px; color: #8E8EA0;">
      <div style="font-weight: 800; color: #D4AF37; margin-bottom: 4px; text-transform: uppercase; font-size: 10px;">TERMS & CONDITIONS</div>
      <ul style="margin: 0; padding-left: 16px; line-height: 1.45;">
        ${termsList}
      </ul>
    </div>

    <!-- Signatures & Authorization -->
    <table style="width: 100%; border-top: 1px dashed #333348; padding-top: 18px; font-size: 11px;">
      <tr>
        <td style="width: 50%; vertical-align: bottom;">
          <div style="color: #D4AF37; font-weight: 800;">FOR CINEVENUE PVT LTD</div>
          <div style="margin-top: 36px; border-bottom: 1px solid #555566; width: 180px;"></div>
          <div style="font-size: 10px; color: #888899; margin-top: 4px;">Authorized Directorate Signatory</div>
          <div style="font-size: 9px; color: #666677;">Prepared by: ${quotation.preparedBy}</div>
        </td>
        <td style="width: 50%; vertical-align: bottom; text-align: right;">
          <div style="color: #FFFFFF; font-weight: 800;">ACCEPTED & CONFIRMED BY CLIENT</div>
          <div style="margin-top: 36px; border-bottom: 1px solid #555566; width: 180px; margin-left: auto;"></div>
          <div style="font-size: 10px; color: #888899; margin-top: 4px;">Sign & Stamp (${proposal.companyName})</div>
          <div style="font-size: 9px; color: #666677;">Name / Designation / Date</div>
        </td>
      </tr>
    </table>

    <!-- Footer Notice -->
    <div style="text-align: center; margin-top: 20px; font-size: 8.5px; color: #555566; border-top: 1px solid #1a1a24; padding-top: 8px;">
      This estimate is computer generated and becomes a binding contract upon client sign-off and payment of the designated advance milestone.
    </div>
  </div>
</body>
</html>
  `;
}

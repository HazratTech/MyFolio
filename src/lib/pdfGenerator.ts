import CryptoJS from "crypto-js";

export function generateInvoiceHTML(invoice: any, profile: any, client: any): string {
  const items = invoice.items || [];

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #0f172a; background: #ffffff;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
          <td style="vertical-align: top;">
            <h1 style="margin: 0; color: #0f172a; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">${profile?.tradeName || "RelayWorks"}</h1>
            <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px; font-weight: 500;">${profile?.legalName || "RelayWorks Tech"}</p>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">${[profile?.address, profile?.city, profile?.state, profile?.country || "India"].filter(Boolean).join(", ")}</p>
            ${profile?.pan ? `<p style="margin: 3px 0 0 0; color: #64748b; font-size: 11px;">PAN: <strong>${profile.pan}</strong></p>` : ""}
            ${profile?.gstin ? `<p style="margin: 2px 0 0 0; color: #64748b; font-size: 11px;">GSTIN: <strong>${profile.gstin}</strong></p>` : ""}
          </td>
          <td style="vertical-align: top; text-align: right;">
            <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">INVOICE</h2>
            <p style="margin: 6px 0 0 0; font-size: 14px; font-weight: 700; color: #2563eb; font-family: monospace;"># ${invoice.invoiceNumber}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Issue Date: <strong style="color:#0f172a;">${invoice.issueDate}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Due Date: <strong style="color:#0f172a;">${invoice.dueDate}</strong></p>
          </td>
        </tr>
      </table>

      <div style="background: #f8fafc; border-radius: 10px; padding: 18px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 6px 0; font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.8px;">Billed To</p>
        <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">${client?.legalName || invoice.clientName}</p>
        ${client?.address ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">${client.address}</p>` : ""}
        <p style="margin: 2px 0 0 0; font-size: 13px; color: #475569;">Country: <strong>${client?.country || invoice.clientCountry}</strong></p>
        ${client?.taxId ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Tax ID / Registration: ${client.taxId}</p>` : ""}
      </div>

      ${invoice.isExport ? `
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 14px; margin-bottom: 24px; border-radius: 6px;">
          <p style="margin: 0; font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">Export Notice</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #1e3a8a;">
            SUPPLY MEANT FOR EXPORT UNDER BOND OR LETTER OF UNDERTAKING (LUT) WITHOUT PAYMENT OF IGST.
          </p>
        </div>
      ` : ""}

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <thead>
          <tr style="background: #0f172a; color: #ffffff;">
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600;">Description</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600;">SAC/HSN</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600;">Rate (${invoice.currency})</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600;">Amount (${invoice.currency})</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item: any, idx: number) => `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 12px; font-size: 13px; color: #1e293b; font-weight: 500;">${item.description}</td>
              <td style="padding: 12px; font-size: 12px; color: #64748b; text-align: center;">${item.sacHsnCode || "-"}</td>
              <td style="padding: 12px; font-size: 13px; color: #1e293b; text-align: right;">${item.quantity}</td>
              <td style="padding: 12px; font-size: 13px; color: #1e293b; text-align: right;">${invoice.currency} ${Number(item.rate).toLocaleString()}</td>
              <td style="padding: 12px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">${invoice.currency} ${Number(item.amount).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
          <td style="width: 55%; vertical-align: top; padding-right: 20px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #334155;">Payment Instructions:</p>
            <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">${invoice.terms || "Cryptocurrency (USDT/USDC) or Direct Bank Transfer accepted."}</p>
          </td>
          <td style="width: 45%; vertical-align: top;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Subtotal:</td>
                <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right; font-weight: 600;">${invoice.currency} ${Number(invoice.subtotal).toLocaleString()}</td>
              </tr>
              ${invoice.discount > 0 ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #dc2626;">Discount:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #dc2626; text-align: right; font-weight: 600;">- ${invoice.currency} ${Number(invoice.discount).toLocaleString()}</td>
                </tr>
              ` : ""}
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Tax (0% Export):</td>
                <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right; font-weight: 600;">${invoice.currency} 0.00</td>
              </tr>
              <tr style="border-top: 2px solid #0f172a;">
                <td style="padding: 10px 0; font-size: 15px; font-weight: 800; color: #0f172a;">TOTAL:</td>
                <td style="padding: 10px 0; font-size: 18px; font-weight: 800; color: #2563eb; text-align: right;">${invoice.currency} ${Number(invoice.totalAmount).toLocaleString()}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 16px; margin-top: 36px; font-size: 10px; color: #94a3b8; text-align: center;">
        <p style="margin: 0;">Digitally generated by ${profile?.tradeName || "RelayWorks"} Billing &amp; Ledger System.</p>
        ${invoice.pdfHash ? `<p style="margin: 4px 0 0 0; font-family: monospace; color: #64748b;">Document Hash (SHA-256): ${invoice.pdfHash}</p>` : ""}
      </div>
    </div>
  `;
}

export function computeSHA256(input: string): string {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}

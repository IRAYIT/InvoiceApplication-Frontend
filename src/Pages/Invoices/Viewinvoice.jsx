import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import InvoiceService from "../../services/InvoicesService";
import "./ViewInvoice.css";
import PaymentModal from "./PaymentModal";
import SendInvoicePanel from "./Sendinvoicepanel";
import ConfirmDialog from "./ConfirmDialog";
import companyLogo from "../../assets/logo192.png";

/* ── Small inline icons (kept consistent with ManageInvoices icon set) ──
   NOTE: width/height are no longer hardcoded here — sizing is controlled
   via CSS (.sidebar-links svg, .go-to-client svg) so it can be matched
   to the reference design without touching these components again. */
const IconPrint = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M6 9V3h12v6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 14h12v7H6z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDuplicate = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="9" y="9" width="12" height="12" rx="1.5" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M4 7h16" strokeLinecap="round" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
  </svg>
);

const IconClient = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.6 3.1-6.3 7-6.3s7 2.7 7 6.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHistory = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const formatKr = (n) =>
  `${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;

const formatHistoryTimestamp = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Maps InvoiceExtraFieldDTO.key back to the readable label shown in
// InvoiceForm's "More options" dropdown, so ViewInvoice doesn't just
// display the raw camelCase key.
const EXTRA_FIELD_LABEL_KEYS = {
  extraFieldsLong: "viewInvoice.extraFieldLabels.extraFieldsLong",
  buyerPersonalId: "viewInvoice.extraFieldLabels.buyerPersonalId",
  buyerVat: "viewInvoice.extraFieldLabels.buyerVat",
  reverseCharge: "viewInvoice.extraFieldLabels.reverseCharge",
  threePartyTrade: "viewInvoice.extraFieldLabels.threePartyTrade",
  brfOrgNo: "viewInvoice.extraFieldLabels.brfOrgNo",
  apartmentDesignation: "viewInvoice.extraFieldLabels.apartmentDesignation",
  propertyDesignation: "viewInvoice.extraFieldLabels.propertyDesignation",
};

// Brand name shown in the "sent via" footer box — matches the reference
// design's "Denna faktura skickades via Fakturan.nu." branding line.
const BRAND_NAME = "Invoice Application";

export default function ViewInvoice({ invoiceId, invoice: invoiceProp, onNavigate, autoPrint }) {
  const { t } = useTranslation();
  const [invoice, setInvoice] = useState(invoiceProp || null);
  const [loading, setLoading] = useState(!invoiceProp);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [sendPanelOpen, setSendPanelOpen] = useState(false);
  const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);
  const invoiceDocRef = useRef(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [paymentHistoryError, setPaymentHistoryError] = useState(null);
  const [sendSuccessMessage, setSendSuccessMessage] = useState("");

  const id = invoiceProp?.id ?? invoiceId;

  useEffect(() => {
    if (invoiceProp) return;
    if (!id) {
      setError(t("invoiceForm.noInvoiceSpecified"));
      setLoading(false);
      return;
    }
    let cancelled = false;

    setLoading(true);
    setError(null);

    InvoiceService.getInvoiceById(id)
      .then(({ data }) => {
        if (cancelled) return;
        setInvoice(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || t("viewInvoice.loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, invoiceProp]);

  useEffect(() => {
    if (!id) return;
  
    let cancelled = false;
  
    const fetchPaymentHistory = async () => {
      setPaymentHistoryLoading(true);
      setPaymentHistoryError(null);
  
      try {
        const { data } = await InvoiceService.getPayments(id);
  
        if (cancelled) return;
  
        // Adjust this based on your actual backend response
        const payments = Array.isArray(data)
          ? data
          : data?.payments || [];
  
        setPaymentHistory(payments);
      } catch (err) {
        if (!cancelled) {
          setPaymentHistoryError(
            err?.response?.data?.message ||
            t("viewInvoice.paymentHistoryLoadFailed")
          );
        }
      } finally {
        if (!cancelled) {
          setPaymentHistoryLoading(false);
        }
      }
    };
  
    fetchPaymentHistory();
  
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (autoPrint && invoice && !loading) {
      handleViewPdf();
    }
  }, [autoPrint, loading]);

  const handlePaidCheckbox = () => {
    if (invoice.status === "PAID") return;
    setPaymentModalOpen(true);
  };

  const handlePaymentSaved = (summary) => {
    setInvoice((prev) => ({
      ...prev,
      status: summary.status,
      amountPaid: summary.totalPaid,
    }));
  
    // Update payment history immediately after saving
    setPaymentHistory(summary.payments || []);
  
    setPaymentModalOpen(false);
  };

  const handleSentToggle = async () => {
    // Only DRAFT <-> SENT is a manual toggle — PAID/OVERDUE/CANCELLED
    // shouldn't be silently reverted by unchecking this box.
    if (invoice.status !== "DRAFT" && invoice.status !== "SENT") return;
    const wasSent = invoice.status === "SENT";
    const prevStatus = invoice.status;
    setInvoice((prev) => ({ ...prev, status: wasSent ? "DRAFT" : "SENT" }));
    try {
      const { data } = wasSent
        ? await InvoiceService.markInvoiceUnsent(invoice.id)
        : await InvoiceService.markInvoiceSent(invoice.id);
      setInvoice(data); // server's version — includes the new history entry
    } catch (err) {
      setInvoice((prev) => ({ ...prev, status: prevStatus }));
      setActionError(err?.response?.data?.message || t("viewInvoice.updateFailed"));
    }
  };

  const handleSendInvoiceClick = () => {
    setSendPanelOpen((open) => !open);
  };

  const handleInvoiceSent = ({ method, target }) => {
    const methodLabelKey =
      method === "EMAIL"
        ? "viewInvoice.methodLabels.email"
        : method === "POST"
        ? "viewInvoice.methodLabels.post"
        : "viewInvoice.methodLabels.eInvoice";
    const methodLabel = t(methodLabelKey);
    if (method === "EMAIL") {
      setSendSuccessMessage(t("sendPanel.emailSentTo", { email: target }));
    } else if (method === "POST") {
      setSendSuccessMessage(t("sendPanel.postQueued"));
    } else if (method === "E_INVOICE") {
      setSendSuccessMessage(t("sendPanel.eInvoiceSentTo", { ref: target }));
    }
    setInvoice((prev) => ({
      ...prev,
      status: prev.status === "DRAFT" ? "SENT" : prev.status,
      history: [
        {
          label: t("viewInvoice.sentByTo", { method: methodLabel, target }),
          timestamp: new Date().toISOString(),
        },
        ...(prev.history || []),
      ],
    }));
    setSendPanelOpen(false);
  };

  const handleViewPdf = async () => {
    setActionError(null);
    const pdfWindow = window.open("", "_blank");
    if (pdfWindow) {
      pdfWindow.document.write(t("viewInvoice.generatingPdf"));
    }

    const node = invoiceDocRef.current;
    if (!node) return;

    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        const scale = pageHeight / imgHeight;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, pageHeight);
      }

      const blobUrl = pdf.output("bloburl");

      if (pdfWindow) {
        pdfWindow.location.href = blobUrl;
      } else {
        pdf.save(`invoice-${invoice.invoiceNumber || invoice.id}.pdf`);
      }
    } catch (err) {
      console.error(err);
      if (pdfWindow) pdfWindow.close();
      setActionError(t("viewInvoice.pdfFailed"));
    }
  };

  const handleCredit = () => {
    onNavigate && onNavigate("creditInvoice", invoice.id);
  };

  const handleDuplicateClick = () => {
    setDuplicateConfirmOpen(true);
  };

  const handleConfirmDuplicate = () => {
    setDuplicateConfirmOpen(false);
    // The "newInvoice" route's component is expected to accept a
    // duplicateFromId param and pre-fill itself from that invoice —
    // see InvoiceForm's duplicateFromId prop.
    onNavigate && onNavigate("duplicateInvoice", invoice.id);
  };

  const handleGoToClient = () => {
    onNavigate && onNavigate("clientDetail", invoice.clientId);
  };

  if (loading) {
    return (
      <main className="content">
        <div className="loading-state">{t("invoiceForm.loadingInvoice")}</div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="content">
        <div className="error-state">{error || t("viewInvoice.notFound")}</div>
      </main>
    );
  }

  // ── Field mapping fixes ──────────────────────────────────────────
  // Backend returns `items`, not `lineItems`.
  const items = invoice.items || [];

  // Backend returns subtotal / taxAmount / totalAmount at the invoice
  // level (not net / vatAmount / total).
  const net = invoice.subtotal ?? 0;
  const vatAmount = invoice.taxAmount ?? 0;
  const grandTotal = invoice.totalAmount ?? 0;
  const rounding = invoice.roundingAmount || 0;

  // No single vatRate field on the invoice — derive it from the first
  // line item's taxPercent (falls back to 25 if there are no items).
  const vatRate = items[0]?.taxPercent ?? 25;

  const history = invoice.history || [];

  const paymentEvents = paymentHistory.map((payment) => ({
    label: t("viewInvoice.paymentReceived", {
      amount: `${Number(payment.amountPaid || 0).toFixed(2)}${payment.cash ? ` ${t("paymentModal.cashSuffix")}` : ""}`,
    }),
    timestamp: payment.createdAt || payment.paymentDate || "",
    type: "PAYMENT",
    id: payment.id,
  }));
  const extraFields = invoice.extraFields || [];
  const taxDeductionApplied = Boolean(invoice.taxDeductionApplied);
  const isPaid = invoice.status === "PAID";
  const isSent = invoice.status !== "DRAFT" && invoice.status !== "CANCELLED";

  return (
    <main className="content invoice-view">
      <h1 className="invoice-page-title">
        {t("viewInvoice.title", { number: invoice.invoiceNumber })}
      </h1>
      {sendSuccessMessage && (
        <div className="send-banner send-banner-success">
          {sendSuccessMessage}
        </div>
      )}

      {sendPanelOpen && (
        <SendInvoicePanel
          invoice={invoice}
          onClose={() => setSendPanelOpen(false)}
          onSent={handleInvoiceSent}
        />
      )}

      <div className="invoice-view-grid">
        {/* ── Invoice document ─────────────────────────────── */}
        <section className="invoice-doc" ref={invoiceDocRef}>
          <div className="invoice-doc-header">
          <h1 className="invoice-doc-title">{t("viewInvoice.docTitle")}</h1>
          </div>

          <div className="invoice-meta-row">
            <div className="invoice-meta-box">
              <div className="meta-box-columns">
                <div className="meta-fields-col">
                  <div className="meta-line">
                  <span>{t("viewInvoice.meta.invoiceNo")}</span>
                    <strong>{invoice.invoiceNumber}</strong>
                  </div>
                  <div className="meta-line">
                  <span>{t("viewInvoice.meta.clientNo")}</span>
                    <strong>{invoice.clientNumber ?? invoice.clientId}</strong>
                  </div>
                  <div className="meta-line">
                  <span>{t("viewInvoice.meta.invoiceDate")}</span>
                    <strong>{invoice.invoiceDate}</strong>
                  </div>
                  <div className="meta-line">
                  <span>{t("viewInvoice.meta.paymentTerms")}</span>
                  <strong>{invoice.paymentTerms || t("invoiceForm.paymentTermsOptions.Net 30")}</strong>
                  </div>
                  <div className="meta-line">
                  <span>{t("viewInvoice.meta.paymentDue")}</span>
                    <strong>{invoice.dueDate}</strong>
                  </div>
                </div>

                <div className="meta-refs-col">
                  {invoice.yourReference && (
                    <div className="meta-reference-block">
                      <span className="meta-reference-label">{t("viewInvoice.meta.yourReference")}</span>
                      <div className="meta-reference-value">{invoice.yourReference}</div>
                    </div>
                  )}
                  {invoice.ourReference && (
                    <div className="meta-reference-block">
                      <span className="meta-reference-label">{t("viewInvoice.meta.ourReference")}</span>
                      <div className="meta-reference-value">{invoice.ourReference}</div>
                    </div>
                  )}
                </div>
              </div>

              <p className="meta-note">{t("viewInvoice.interestNote")}</p>
            </div>

            <div className="invoice-address-box">
            <div className="address-label">{t("clients.detail.billTo")}</div>
              <div className="address-body">
                <strong>{invoice.clientName}</strong>
                {(invoice.billingAddressLines || []).map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr>
              <th>{t("viewInvoice.table.product")}</th>
                <th>{t("viewInvoice.table.quantity")}</th>
                <th>{t("viewInvoice.table.pricePerUnit")}</th>
                <th>{t("viewInvoice.table.total")}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td></td>
                  <td>1.00</td>
                  <td>0.00</td>
                  <td>0.00</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{Number(item.quantity || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td>{Number(item.unitPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td>{Number(item.lineTotal || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="invoice-totals">
            <div className="totals-line">
            <span>{t("viewInvoice.totals.net")}</span>
              <span>{formatKr(net)}</span>
            </div>
            <div className="totals-line">
            <span>{t("viewInvoice.totals.vatCalculated", { rate: vatRate, net: formatKr(net) })}</span>
              <span>{formatKr(vatAmount)}</span>
            </div>
            <div className="totals-line">
            <span>{t("viewInvoice.totals.rounding")}</span>
              <span>{formatKr(rounding)}</span>
            </div>
            <div className="totals-line totals-grand">
            <span>{t("viewInvoice.totals.totalDue")}</span>
              <span>{formatKr(grandTotal)}</span>
            </div>
          </div>

          {/* ── "More options" extra fields + tax deduction ───────────
              Previously this data was UI-only and never reached the
              backend, so nothing rendered here even after saving. */}
          {(extraFields.length > 0 || taxDeductionApplied) && (
            <div className="invoice-extra-fields">
              {extraFields.map((field, i) => (
                <div className="extra-field-line" key={i}>
                  <span className="extra-field-label">{t(EXTRA_FIELD_LABEL_KEYS[field.key] || field.key, { defaultValue: field.key })}</span>
                  <div className="extra-field-text">{field.text}</div>
                </div>
              ))}
              {taxDeductionApplied && (
                <div className="extra-field-line">
                  <span className="extra-field-label">{t("invoiceForm.preliminaryTaxDeduction")}</span>
                  <div className="extra-field-text">{invoice.taxDeductionPercent}%</div>
                </div>
              )}
            </div>
          )}

          <div className="invoice-footer-boxes">
            <div className="footer-box">
              <div className="footer-col">
              <div className="footer-label">{t("viewInvoice.footer.address")}</div>
                <div>{invoice.companyAddress}</div>
              </div>
              <div className="footer-col">
              <div className="footer-label">{t("viewInvoice.footer.companyEmail")}</div>
                <div>{invoice.companyEmail}</div>
                {invoice.approvedForFTax && <div className="footer-note">{t("viewInvoice.footer.approvedForFTax")}</div>}
              </div>
            </div>

            {/* ── Branding footer — matches the reference design's
                "Denna faktura skickades via Fakturan.nu." box. Previously
                missing entirely from ViewInvoice. */}
            <div className="footer-brand-box">
              <img src={companyLogo} alt="Company logo" className="footer-brand-icon" />
              <div className="footer-brand-text">
                <div>
                {t("viewInvoice.footer.sentVia", { brand: BRAND_NAME })}
                </div>
                <div>{t("viewInvoice.footer.tagline")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="invoice-sidebar">
          {actionError && <div className="sidebar-error">{actionError}</div>}

          <button
            className={`btn btn-send ${isSent ? "btn-send-sent" : ""}`}
            onClick={handleSendInvoiceClick}
          >
            {t("invoices.rowActions.send")}
            </button>

          {!(isPaid && isSent) && (
            <button className="btn btn-outline" onClick={() => onNavigate && onNavigate("editInvoice", invoice.id)}>
              {t("viewInvoice.editInvoice")}
              </button>
          )}

          <nav className="sidebar-links">
            <button type="button" onClick={handleViewPdf}>
            <IconPrint /> {t("invoices.rowActions.viewPdf")}
            </button>
            <button type="button" onClick={handleDuplicateClick}>
            <IconDuplicate /> {t("invoices.rowActions.duplicate")}
            </button>
            <button type="button" onClick={handleCredit}>
            <IconTrash /> {t("invoices.rowActions.credit")}
            </button>
          </nav>

          <button type="button" className="sidebar-link go-to-client" onClick={handleGoToClient}>
          <IconClient /> {t("invoices.rowActions.goToClient")}
          </button>

          <div className="sidebar-flags">
            <label>
              <input
                type="checkbox"
                checked={isPaid}
                onClick={(e) => {
                  e.preventDefault();
                  handlePaidCheckbox();
                }}
                onChange={() => {}}
              />
              {t("viewInvoice.paid")}
              </label>
            <label>
              <input type="checkbox" checked={isSent} onChange={handleSentToggle} />
              {t("viewInvoice.sent")}
            </label>
          </div>

          <div className="sidebar-history">
            <div className="history-heading">
            <IconHistory /> {t("viewInvoice.history")}
            </div>

            {paymentHistoryLoading ? (
              <p className="history-empty">
              {t("viewInvoice.loadingPaymentHistory")}
            </p>
            ) : paymentHistoryError ? (
              <p className="history-empty">
                {paymentHistoryError}
              </p>
            ) : history.length === 0 && paymentEvents.length === 0 ? (
              <p className="history-empty">
                {t("viewInvoice.noHistory")}
              </p>
            ) : (
              <>
                {/* Existing invoice history */}
                {history.map((event, i) => (
                  <div className="history-entry" key={`history-${i}`}>
                    <div className="history-label">
                      {event.label}
                    </div>

                    <div className="history-timestamp">
                      {formatHistoryTimestamp(event.timestamp)}
                    </div>
                  </div>
                ))}

                {/* Payment history */}
                {paymentEvents.map((event, i) => (
                  <div
                    className="history-entry"
                    key={`payment-${event.id ?? i}`}
                  >
                    <div className="history-label">
                      {event.label}
                    </div>

                    <div className="history-timestamp">
                      {formatHistoryTimestamp(event.timestamp)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>
      </div>

      {paymentModalOpen && (
        <PaymentModal
          invoice={invoice}
          onClose={() => setPaymentModalOpen(false)}
          onSaved={handlePaymentSaved}
        />
      )}

      {duplicateConfirmOpen && (
        <ConfirmDialog
        message={t("invoices.duplicateConfirmMessage")}
          onCancel={() => setDuplicateConfirmOpen(false)}
          onConfirm={handleConfirmDuplicate}
        />
      )}
    </main>
  );
}
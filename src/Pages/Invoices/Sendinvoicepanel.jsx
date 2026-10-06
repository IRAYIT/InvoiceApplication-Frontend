import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InvoiceService from "../../services/InvoicesService";
import "./SendInvoicePanel.css";

const IconAt = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-4 7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMail = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCloud = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M7 18a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 17.3 8.1 4 4 0 0 1 17 18H7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Inline "send" panel that expands above the invoice document, matching the
 * fakturan.nu reference. Three collapsible sections, each wired to its own
 * backend endpoint. Only one section is expanded at a time.
 */
export default function SendInvoicePanel({ invoice, onClose, onSent }) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("email");

  // ── Send by e-mail ─────────────────────────────────────────
  const [email, setEmail] = useState(invoice.clientEmail || "");
  const [includeMessage, setIncludeMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [includeAttachment, setIncludeAttachment] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSentTo, setEmailSentTo] = useState(null);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setEmailError(t("sendPanel.errors.emailRequired"));
      return;
    }
  
    if (includeAttachment && !attachment) {
      setEmailError(t("sendPanel.errors.attachmentRequired"));
      return;
    }
  
    setEmailSending(true);
    setEmailError(null);
  
    try {
      const personalMessage = includeMessage ? message : "";
  
      await InvoiceService.sendPaidInvoiceEmail(
        invoice.id,
        email.trim(),
        personalMessage,
        includeAttachment ? attachment : null
      );
  
      const sentEmail = email.trim();

      onSent &&
        onSent({
          method: "EMAIL",
          target: sentEmail,
        });

      onClose && onClose();
    } catch (err) {
      console.error("Error sending invoice email:", err);
  
      setEmailError(
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message ||
          t("sendPanel.errors.sendFailed")
      );
    } finally {
      setEmailSending(false);
    }
  };

  // ── Send by postal mail ───────────────────────────────────
  const [postAddress, setPostAddress] = useState((invoice.billingAddressLines || []).join("\n"));
  const [postSending, setPostSending] = useState(false);
  const [postError, setPostError] = useState(null);
  const [postSent, setPostSent] = useState(false);

  const handleSendPost = async () => {
    if (!postAddress.trim()) {
      setPostError(t("sendPanel.errors.addressRequired"));
      return;
    }
    setPostSending(true);
    setPostError(null);
    try {
      await InvoiceService.sendInvoiceByPost(invoice.id, { address: postAddress });
      setPostSent(true);
      onSent && onSent({ method: "POST", target: postAddress });
    } catch (err) {
      setPostError(err?.response?.data?.message || t("sendPanel.errors.postFailed"));
    } finally {
      setPostSending(false);
    }
  };

  // ── Send by e-invoice ──────────────────────────────────────
  const [eInvoiceRef, setEInvoiceRef] = useState(invoice.clientEInvoiceRef || "");
  const [eInvoiceSending, setEInvoiceSending] = useState(false);
  const [eInvoiceError, setEInvoiceError] = useState(null);
  const [eInvoiceSent, setEInvoiceSent] = useState(false);

  const handleSendEInvoice = async () => {
    if (!eInvoiceRef.trim()) {
      setEInvoiceError(t("sendPanel.errors.eInvoiceRefRequired"));
      return;
    }
    setEInvoiceSending(true);
    setEInvoiceError(null);
    try {
      await InvoiceService.sendInvoiceByEInvoice(invoice.id, { reference: eInvoiceRef });
      setEInvoiceSent(true);
      onSent && onSent({ method: "E_INVOICE", target: eInvoiceRef });
    } catch (err) {
      setEInvoiceError(err?.response?.data?.message || t("sendPanel.errors.eInvoiceFailed"));
    } finally {
      setEInvoiceSending(false);
    }
  };

  const toggle = (name) => setActiveSection((cur) => (cur === name ? null : name));

  return (
    <div className="send-panel">
      {emailSentTo && (
        <div className="send-banner send-banner-success">
          {t("sendPanel.emailSentTo", { email: emailSentTo })}
        </div>
      )}
      {postSent && (
        <div className="send-banner send-banner-success">
          {t("sendPanel.postQueued")}
        </div>
      )}
      {eInvoiceSent && (
        <div className="send-banner send-banner-success">
          {t("sendPanel.eInvoiceSentTo", { ref: eInvoiceRef })}
        </div>
      )}

      {/* ── Send by e-mail ── */}
      <section className={`send-section send-section-email ${activeSection === "email" ? "open" : "collapsed"}`}>
        <button type="button" className="send-section-toggle" onClick={() => toggle("email")}>
        <IconAt /> {t("sendPanel.sendByEmail")}
        </button>

        {activeSection === "email" && (
          <div className="send-section-body">
            <div className="send-section-col">
            <label className="send-field-label">{t("sendPanel.email")}</label>
              <input
                type="email"
                className="send-text-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />

              <label className="send-checkbox-row">
                <input type="checkbox" checked={includeMessage} onChange={(e) => setIncludeMessage(e.target.checked)} />
                {t("sendPanel.includeMessage")}
              </label>
              {includeMessage && (
                <textarea
                  className="send-textarea"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("sendPanel.messagePlaceholder")}
                />
              )}

              <label className="send-checkbox-row">
                <input
                  type="checkbox"
                  checked={includeAttachment}
                  onChange={(e) => setIncludeAttachment(e.target.checked)}
                />
                {t("sendPanel.addAttachment")}
                </label>
              {includeAttachment && (
                <input
                  type="file"
                  className="send-file-input"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
              )}

              {emailError && <div className="send-field-error">{emailError}</div>}

              <div className="send-actions">
                <button className="btn btn-send-sm" onClick={handleSendEmail} disabled={emailSending}>
                {emailSending ? t("sendPanel.sending") : t("sendPanel.send")}
                </button>
                <button className="btn btn-cancel-sm" type="button" onClick={onClose}>
                  {t("common.cancel")}
                </button>
              </div>
            </div>

            <div className="send-section-col send-followup-col">
            <h3>{t("sendPanel.followUpTitle")}</h3>
              <p className="send-followup-line">
              <strong>{t("sendPanel.autoMode")}</strong> <span className="send-off">{t("sendPanel.off")}</span>{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>{t("sendPanel.readMore")}</a>
              </p>
              <p className="send-followup-desc">
              {t("sendPanel.autoModeDesc")}
              </p>

              <p className="send-followup-line">
              <strong>{t("sendPanel.smsUnopened")}</strong> <span className="send-off">{t("sendPanel.off")}</span>{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>{t("sendPanel.readMore")}</a>                <strong>SMS if unopened after three days:</strong> <span className="send-off">OFF</span>{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>Read more</a>
              </p>
              <p className="send-followup-desc">
              {t("sendPanel.smsUnopenedDesc")}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Send by postal mail ── */}
      <section className={`send-section send-section-post ${activeSection === "post" ? "open" : "collapsed"}`}>
        <button type="button" className="send-section-toggle" onClick={() => toggle("post")}>
        <IconMail /> {t("sendPanel.sendByPost")}
        </button>

        {activeSection === "post" && (
          <div className="send-section-body send-section-body-single">
            <label className="send-field-label">{t("sendPanel.postalAddress")}</label>
            <textarea
              className="send-textarea"
              rows={3}
              value={postAddress}
              onChange={(e) => setPostAddress(e.target.value)}
            />
            <p className="send-followup-desc">
            {t("sendPanel.postFeeDesc")}
            </p>
            {postError && <div className="send-field-error">{postError}</div>}
            <div className="send-actions">
              <button className="btn btn-send-sm" onClick={handleSendPost} disabled={postSending}>
              {postSending ? t("sendPanel.sending") : t("sendPanel.sendByPostBtn")}
              </button>
              <button className="btn btn-cancel-sm" type="button" onClick={onClose}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Send by e-invoice ── */}
      <section className={`send-section send-section-einvoice ${activeSection === "einvoice" ? "open" : "collapsed"}`}>
        <button type="button" className="send-section-toggle" onClick={() => toggle("einvoice")}>
        <IconCloud /> {t("sendPanel.sendByEInvoice")}
        </button>

        {activeSection === "einvoice" && (
          <div className="send-section-body send-section-body-single">
            <label className="send-field-label">{t("sendPanel.eInvoiceRefLabel")}</label>
            <input
              type="text"
              className="send-text-input"
              value={eInvoiceRef}
              onChange={(e) => setEInvoiceRef(e.target.value)}
              placeholder="e.g. 0037123456789"
            />
            {eInvoiceError && <div className="send-field-error">{eInvoiceError}</div>}
            <div className="send-actions">
              <button className="btn btn-send-sm" onClick={handleSendEInvoice} disabled={eInvoiceSending}>
              {eInvoiceSending ? t("sendPanel.sending") : t("sendPanel.sendByEInvoiceBtn")}
              </button>
              <button className="btn btn-cancel-sm" type="button" onClick={onClose}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
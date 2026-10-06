import React from "react";
import { useTranslation } from "react-i18next";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();
  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog-card" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-btn confirm-dialog-cancel" onClick={onCancel}>
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button type="button" className="confirm-dialog-btn confirm-dialog-confirm" onClick={onConfirm}>
            {confirmLabel ?? t("common.yesContinue")}
          </button>
        </div>
      </div>
    </div>
  );
}
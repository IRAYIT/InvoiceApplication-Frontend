import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <select
      className="language-switcher"
      value={i18n.language?.startsWith("sv") ? "sv" : "en"}
      onChange={(e) => changeLanguage(e.target.value)}
      aria-label={i18n.t("common.language")}
    >
      <option value="en">English</option>
      <option value="sv">Swedish</option>
    </select>
  );
};

export default LanguageSwitcher;
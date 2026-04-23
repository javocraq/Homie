import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Seo from "../components/Seo";
import { useLanguage } from "../i18n/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Seo
        title={t('notfound.seoTitle')}
        description={t('notfound.seoDesc')}
        canonical={`https://homiebnb.com${location.pathname}`}
        noindex
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">{t('notfound.msg')}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('notfound.back')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;

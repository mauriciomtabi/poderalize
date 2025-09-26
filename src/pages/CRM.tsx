import { Layout } from "@/components/layout/Layout";
import { CRMProvider } from "@/contexts/CRMContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { CRMHeader } from "@/components/crm/CRMHeader";
import { CRMContent } from "@/components/crm/CRMContent";

const CRM = () => {
  return (
    <CRMProvider>
      <Layout title="CRM - Gestão de Leads">
        <div className="h-full flex flex-col animate-fade-in">
          <ErrorBoundary>
            <CRMHeader />
            <div className="flex-1 min-h-0 min-w-0 p-6">
              <CRMContent />
            </div>
          </ErrorBoundary>
        </div>
      </Layout>
    </CRMProvider>
  );
};

export default CRM;
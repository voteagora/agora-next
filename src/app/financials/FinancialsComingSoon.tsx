import Hero from "@/components/Hero/Hero";
import Tenant from "@/lib/tenant/tenant";
import financialMock from "@/assets/tenant/financial_mock.png";
import financialDocMock from "@/assets/tenant/financial-doc-mock.png";

export default async function FinancialsComingSoon() {
  const { ui, namespace } = Tenant.current();

  if (!ui.toggle("financials-coming-soon")) {
    return <div>Route not supported for namespace</div>;
  }

  return (
    <div className="flex flex-col">
      {/* Proposals Section */}
      <div className="flex flex-col max-w-[76rem]">
        {ui.toggle("financials-coming-soon")?.enabled && (
          <div className="relative">
            <img
              src={financialMock.src}
              alt="Static proposals"
              className="w-full h-auto blur-[10px] opacity-60 block"
            />
            <img
              src={financialDocMock.src}
              alt="Static proposals"
              className="w-full h-auto blur-[10px] opacity-60 block mt-4"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-primary text-center text-base leading-6">
                Coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

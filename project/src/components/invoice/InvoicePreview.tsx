import { InvoiceData } from "@/lib/types";

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview = ({ data }: InvoicePreviewProps) => {
  const calculateTotal = () => {
    return data.services.reduce((total, service) => {
      return total + service.numberOfLessons * service.rate;
    }, 0);
  };

  const formatAddress = (address: string) => {
    const parts = address.split(/,|\s+(?=\d{5})/);
    return parts.map((part, index) => (
      <span key={index} className="block">
        {part.trim()}
      </span>
    ));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg text-sm">
      <div className="border-b pb-4 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold mb-2">FACTURE</h1>
        </div>
        <div className="text-sm text-gray-600">
          <p>N° {data.invoiceNumber}</p>
          <p>Date : {data.invoiceDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h2 className="font-semibold mb-2">De :</h2>
          <div className="text-sm">
            <p className="font-semibold">{data.companyName}</p>
            <p>{data.companyAddress}</p>
            <p>SIRET : {data.siret}</p>
            {data.showAgreementInfo && (
              <p>N° Agrément SAP : {data.agreementNumber}</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Facturer à :</h2>
          <div className="text-sm">
            <p className="font-semibold">{data.clientName}</p>
            {formatAddress(data.clientAddress)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-xs">Date</th>
              <th className="text-left py-2 text-xs">Description</th>
              <th className="text-right py-2 text-xs">Nombre</th>
              <th className="text-right py-2 text-xs">Tarif (€)</th>
              <th className="text-right py-2 text-xs">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.services.map((service) => (
              <tr key={service.id} className="border-b">
                <td className="py-1 text-xs">{service.date}</td>
                <td className="py-1 text-xs">{service.description}</td>
                <td className="text-right py-1 text-xs">
                  {service.numberOfLessons}
                </td>
                <td className="text-right py-1 text-xs">
                  {service.rate.toFixed(2)} €
                </td>
                <td className="text-right py-1 text-xs">
                  {(service.numberOfLessons * service.rate).toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-4">
        <div className="w-1/3">
          <div className="flex justify-between py-1">
            <span className="font-semibold text-xs">Total HT</span>
            <span className="text-xs">{calculateTotal().toFixed(2)} €</span>
          </div>
          <div className="flex justify-between py-1 border-t border-b font-bold">
            <span className="text-xs">Total TTC</span>
            <span className="text-xs">{calculateTotal().toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <div className="text-xs">
        <p className="mb-2">Mode de paiement : {data.paymentMethod}</p>
        {data.showAgreementInfo && (
          <p className="text-xs text-gray-600">
            Entreprise agréée Services à la Personne sous le numéro{" "}
            {data.agreementNumber}. Ces prestations ouvrent droit au crédit
            d&apos;impôt de 50% selon larticle 199 sexdecies du Code Général des
            Impôts.
          </p>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;

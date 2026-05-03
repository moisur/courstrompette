import { InvoiceData } from "@/lib/types/invoice";

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview = ({ data }: InvoicePreviewProps) => {
  const calculateTotal = () =>
    data.services.reduce((total, service) => total + service.numberOfLessons * service.rate, 0);

  const formatAddress = (address: string) => {
    const parts = address.split(/,|\s+(?=\d{5})/);
    return parts.map((part, index) => (
      <span key={index} className="block">
        {part.trim()}
      </span>
    ));
  };

  return (
    <div className="mx-auto flex min-h-[29.7cm] w-full max-w-[21cm] flex-col rounded-lg bg-white p-8 text-sm text-black shadow-lg">
      <div className="mb-4 border-b pb-4">
        <div className="flex items-center justify-between">
          <h1 className="mb-2 text-2xl font-bold">FACTURE</h1>
        </div>
        <div className="text-sm text-gray-600">
          <p>N° {data.invoiceNumber || "[Numero]"}</p>
          <p>Date : {data.invoiceDate || new Date().toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">De :</h2>
          <div className="text-sm">
            <p className="text-lg font-bold">{data.companyName}</p>
            <p className="text-gray-600">{data.companyAddress}</p>
            <p className="mt-2">
              <span className="font-semibold">SIRET :</span> {data.siret}
            </p>
            {data.showAgreementInfo && (
              <p>
                <span className="font-semibold">Agrement SAP :</span> {data.agreementNumber}
              </p>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Facturer a :</h2>
          <div className="text-sm">
            <p className="text-lg font-bold">{data.clientName}</p>
            <div className="font-medium text-gray-600">{formatAddress(data.clientAddress)}</div>
          </div>
        </div>
      </div>

      <div className="flex-grow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 text-xs font-bold uppercase">Date</th>
              <th className="py-2 text-xs font-bold uppercase">Prestation</th>
              <th className="py-2 text-right text-xs font-bold uppercase">Qte</th>
              <th className="py-2 text-right text-xs font-bold uppercase">Prix unitaire</th>
              <th className="py-2 text-right text-xs font-bold uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.services.map((service) => (
              <tr key={service.id}>
                <td className="py-3 text-xs">{service.date}</td>
                <td className="py-3 text-xs font-medium">{service.description}</td>
                <td className="py-3 text-right text-xs">{service.numberOfLessons}</td>
                <td className="py-3 text-right text-xs">{service.rate.toFixed(2)} €</td>
                <td className="py-3 text-right text-xs font-semibold">
                  {(service.numberOfLessons * service.rate).toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 border-t-2 border-black pt-4">
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between px-2 py-1">
              <span className="text-sm font-bold">TOTAL TTC</span>
              <span className="text-lg font-bold">{calculateTotal().toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t pt-4 text-[10px] text-gray-500">
        <p className="mb-1 font-bold uppercase text-gray-800">
          Mode de paiement : {data.paymentMethod || "Non specifie"}
        </p>
        <p className="mb-2 italic">Exoneration de TVA, article 293 B du Code general des impots.</p>
        {data.showAgreementInfo && (
          <p>
            Entreprise agreee Services a la Personne sous le numero {data.agreementNumber}. Ces
            prestations ouvrent droit au credit d impot de 50% selon l article 199 sexdecies du
            Code General des Impots.
          </p>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;

import { InvoiceData } from "@/lib/types/invoice";

interface AttestationPreviewProps {
  data: InvoiceData;
}

const AttestationPreview = ({ data }: AttestationPreviewProps) => {
  const formatAddress = (address: string | undefined) => {
    if (!address) return null;
    const parts = address.split(/,|\s+(?=\d{5})/);
    return parts.map((part, index) => (
      <span key={index} className="block">
        {part.trim()}
      </span>
    ));
  };

  return (
    <div className="mx-auto min-h-[29.7cm] w-full max-w-[21cm] rounded-lg bg-white p-8 font-serif text-sm text-black shadow-lg">
      <div className="mb-10 text-right">
        <p className="font-semibold">{data.companyName}</p>
        <p>{data.companyAddress}</p>
        <p>N°SIRET: {data.siret}</p>
      </div>

      <div className="mb-10 text-right">
        <p>Date : {new Date(data.invoiceDate || new Date()).toLocaleDateString("fr-FR")}</p>
      </div>

      <div className="mb-10 text-left">
        <p className="font-semibold">{data.clientName || "[Prenom Nom]"}</p>
        {formatAddress(data.clientAddress) || <p>[Adresse]</p>}
      </div>

      <h1 className="mb-10 text-center text-xl font-bold uppercase underline">Attestation fiscale annuelle</h1>

      <div className="mb-10 text-justify leading-relaxed">
        <p className="mb-4">
          Je soussigne, {data.companyName}, certifie que {data.clientName || "[Prenom Nom du beneficiaire]"} a
          beneficie de services a la personne : cours de trompette a domicile.
        </p>
        <p>
          En {data.attestationYear || "[Annee]"}, le montant des factures effectivement acquittees represente
          une somme totale de : <span className="font-semibold">{(data.totalAmountPaid || 0).toFixed(2)} €</span>.
        </p>
      </div>

      {data.services && data.services.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-2 text-center font-semibold">Detail des prestations ({data.attestationYear})</h2>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="border-r border-gray-300 p-1 text-left">Date</th>
                <th className="border-r border-gray-300 p-1 text-left">Description</th>
                <th className="border-r border-gray-300 p-1 text-right">Nombre</th>
                <th className="border-r border-gray-300 p-1 text-right">Tarif (€)</th>
                <th className="p-1 text-right">Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {data.services
                .filter((service) => service.date.startsWith(data.attestationYear || ""))
                .map((service) => (
                  <tr key={service.id} className="border-b border-gray-300">
                    <td className="border-r border-gray-300 p-1">{service.date}</td>
                    <td className="border-r border-gray-300 p-1">{service.description}</td>
                    <td className="border-r border-gray-300 p-1 text-right">{service.numberOfLessons}</td>
                    <td className="border-r border-gray-300 p-1 text-right">{service.rate.toFixed(2)}</td>
                    <td className="p-1 text-right">{(service.numberOfLessons * service.rate).toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 text-center text-xs text-gray-600">
        <p>
          Ces prestations ouvrent droit au credit d impot de 50% selon l article 199 sexdecies du Code
          General des Impots, sous reserve de modification de la legislation.
        </p>
        <div className="mt-16 text-right">
          <p>Fait a Paris, le {new Date().toLocaleDateString("fr-FR")}</p>
          <p className="mt-8">Signature :</p>
        </div>
      </div>
    </div>
  );
};

export default AttestationPreview;

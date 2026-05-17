import { InvoiceData } from "@/lib/types";

interface AttestationPreviewProps {
  data: InvoiceData;
}

const AttestationPreview = ({ data }: AttestationPreviewProps) => {
  // Helper to format address (can be extracted to utils if used elsewhere)
  const formatAddress = (address: string | undefined) => {
    if (!address) return null;
    // Basic split, adjust regex if more complex addresses are common
    const parts = address.split(/,|\s+(?=\d{5})/);
    return parts.map((part, index) => (
      <span key={index} className="block">
        {part.trim()}
      </span>
    ));
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg text-sm font-serif">
      {/* Header Section */}
      <div className="text-right mb-10">
        <p className="font-semibold">{data.companyName}</p>
        <p>{data.companyAddress}</p>
        <p>N°SIRET: {data.siret}</p>
        {/* <p>N° Agrément SAP: {data.agreementNumber}</p> */}
      </div>

      <div className="text-right mb-10">
        <p>Date : {new Date(data.invoiceDate || new Date()).toLocaleDateString("fr-FR")}</p>
      </div>

      {/* Beneficiary Section */}
      <div className="mb-10">
        <p className="font-semibold">{data.clientName || "[Prénom Nom]"}</p>
        {formatAddress(data.clientAddress) || <p>[Adresse]</p>}
        {/* Add Postal Code / City if available in data */}
        {/* <p>[Code postal] - [Ville]</p> */}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-center mb-10 underline uppercase">
        Attestation Fiscale Annuelle
      </h1>

      {/* Body Text */}
      <div className="mb-10 leading-relaxed text-justify">
        <p className="mb-4">
          Je soussigné, {data.companyName}, certifie que{" "}
          {data.clientName || "[Prénom Nom du bénéficiaire]"}, a bénéficié de
          services à la personne : cours de trompette à domicile.
        </p>
        <p>
          En {data.attestationYear || "[Année]"}, le montant des factures
          effectivement acquittées représente une somme totale de :{" "}
          <span className="font-semibold">
            {(data.totalAmountPaid || 0).toFixed(2)} €
          </span>
          .
        </p>
      </div>

      {/* Optional: List of Services (if needed on attestation) */}
      {data.services && data.services.length > 0 && (
        <div className="mb-10">
          <h2 className="font-semibold mb-2 text-center">
            Détail des prestations ({data.attestationYear})
          </h2>
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="text-left p-1 border-r border-gray-300">Date</th>
                <th className="text-left p-1 border-r border-gray-300">
                  Description
                </th>
                <th className="text-right p-1 border-r border-gray-300">
                  Nombre
                </th>
                <th className="text-right p-1 border-r border-gray-300">
                  Tarif (€)
                </th>
                <th className="text-right p-1">Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {data.services
                .filter((service) =>
                  service.date.startsWith(data.attestationYear || "")
                ) // Filter by year
                .map((service) => (
                  <tr key={service.id} className="border-b border-gray-300">
                    <td className="p-1 border-r border-gray-300">
                      {service.date}
                    </td>
                    <td className="p-1 border-r border-gray-300">
                      {service.description}
                    </td>
                    <td className="text-right p-1 border-r border-gray-300">
                      {service.numberOfLessons}
                    </td>
                    <td className="text-right p-1 border-r border-gray-300">
                      {service.rate.toFixed(2)}
                    </td>
                    <td className="text-right p-1">
                      {(service.numberOfLessons * service.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Text */}
      <div className="text-xs text-gray-600 mt-10 text-center">
        <p>
          Ces prestations ouvrent droit au crédit d&apos;impôt de 50% selon
          l&apos;article 199 sexdecies du Code Général des Impôts, sous réserve
          de modification de la législation.
        </p>
        {/* Add signature line if needed */}
        <div className="mt-16 text-right">
          <p>Fait à Paris, le {new Date().toLocaleDateString("fr-FR")}</p>
          <p className="mt-8">Signature :</p>
        </div>
      </div>
    </div>
  );
};

export default AttestationPreview;

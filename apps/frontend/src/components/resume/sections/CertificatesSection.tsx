import CertificateItem from '../items/CertificateItem';

interface Certificate {
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

interface CertificatesSectionProps {
  certificates: Certificate[];
}

export default function CertificatesSection({ certificates }: CertificatesSectionProps) {
  if (!certificates || certificates.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          证书认证
        </h2>
        <div className="flex-1 ml-4 h-px bg-gray-300 dark:bg-gray-600"></div>
      </div>
      
      <div className="space-y-4">
        {certificates.map((cert, index) => (
          <CertificateItem key={index} certificate={cert} />
        ))}
      </div>
    </section>
  );
} 
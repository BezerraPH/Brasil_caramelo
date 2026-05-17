import { PageContainer } from "@/components/PageContainer";
import { PetGame } from "@/components/PetGame";

export default function CachorroPage() {
  return (
    <PageContainer narrow>
      <header className="bc-animate-in mb-6 text-center">
        <h1 className="text-2xl font-bold text-bc-blue">Meu Caramelo</h1>
        <p className="text-sm text-bc-brown">
          Cuide do seu companheiro virtual todo dia
        </p>
      </header>
      <PetGame />
    </PageContainer>
  );
}

import { Helmet } from "react-helmet-async";
import PoliceTablet from "@/components/tablet/PoliceTablet";
import { useTabletVisibility } from "@/hooks/useFiveM"; // 1. Importa o hook

const Index = () => {
  const { isVisible } = useTabletVisibility();

  if (!isVisible) return null;

  return (
    <>
      <Helmet>
        <title>Tablet Policial - VRPex</title>
      </Helmet>
      
      {/* ALTERAÇÃO AQUI: Adicionado w-full h-full bg-transparent */}
      <div className="w-full h-full min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
        <PoliceTablet />
      </div>
    </>
  );
};

export default Index;
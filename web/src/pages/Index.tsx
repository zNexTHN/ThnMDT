import { Helmet } from "react-helmet-async";
import PoliceTablet from "@/components/tablet/PoliceTablet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Tablet Policial - VRPex</title>
        <meta name="description" content="Sistema de gestão policial para VRPex. Gerencie ocorrências, cidadãos, veículos e recrutamento." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center overflow-hidden">
        <PoliceTablet />
      </div>
    </>
  );
};

export default Index;

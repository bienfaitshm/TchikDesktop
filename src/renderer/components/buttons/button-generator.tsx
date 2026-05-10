import { RefreshCcw, Wand2 } from 'lucide-react';
import { ButtonLoader, ButtonLoaderProps } from '@/renderer/components/form/button-loader';

type ButtonGeneratorProps = {
  hasGenerated?: boolean;
};

const ButtonGenerator = ({
  hasGenerated = false,
  ...props
}: ButtonGeneratorProps & ButtonLoaderProps) => {
  
  const renderContent = () => {
   
    if (hasGenerated) {
      return (
        <>
          <RefreshCcw className="mr-2 size-4" />
          Régénérer le plan
        </>
      );
    }

    return (
      <>
        <Wand2 className="mr-2 size-4" />
        Générer le placement
      </>
    );
  };

  return (
    <ButtonLoader
      variant={hasGenerated ? "outline" : "default"}
      className="rounded-full"
      isLoadingText="Calcul du placement..."
      {...props}
    >
      {renderContent()}
    </ButtonLoader>
  );
};

export default ButtonGenerator;
import { HStack } from "./Stack";

const Loader: React.FC = () => {
  return (
    <HStack
      key="loader"
      className="gl_loader justify-center py-6 text-sm text-secondary"
    >
      Loading...
    </HStack>
  );
};

export default Loader;
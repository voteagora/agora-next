import React from "react";
import Image from "next/image";
import DelegateSelector from "../components/DelegateSelector";
import { Button } from "../../../components/ui/button";

const DelegationStage = ({ onSuccess }: { onSuccess: () => void }) => {
  return <DelegateSelector onSuccess={onSuccess} />;
};

export default DelegationStage;

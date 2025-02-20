import { FC } from 'react';

const DevBanner: FC = () => {
  return (
    <div className="bg-black text-center p-[3px]">
      <p className="text-red-500 text-xs">{process.env.AGORA_ENV}</p>
    </div>
  );
};

export default DevBanner;
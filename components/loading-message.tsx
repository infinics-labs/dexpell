import React from "react";
import Image from "next/image";

const LoadingMessage: React.FC = () => {
  return (
    <div className="text-sm">
      <div className="flex flex-col">
        <div className="flex items-start gap-3">
          {/* BurcuX Profile Photo */}
          <div className="flex-shrink-0">
            <Image
              src="/videos/nova-pp.png"
              alt="BurcuX Assistant"
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <div className="mr-4 rounded-[16px] px-4 py-2 md:mr-24 text-black bg-white font-light">
            <div className="w-3 h-3 animate-pulse bg-black rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;

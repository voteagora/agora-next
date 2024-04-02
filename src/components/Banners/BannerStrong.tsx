import { Button } from "@/components/ui/button";

const BannerStrong = () => {
  return (
    <div className="bg-[#0B69F7] p-5 rounded-xl text-white mt-12 mb-8 flex">
      <div className="w-[45px] border-2 border-[#053CFF] rounded-md flex justify-center items-center">
        <svg
          width="22"
          height="21"
          viewBox="0 0 22 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 6.99998V11M9.25 4.49997H5.8C4.11984 4.49997 3.27976 4.49997 2.63803 4.82695C2.07354 5.11457 1.6146 5.57352 1.32698 6.138C0.999998 6.77974 0.999999 7.61982 1 9.29998L1 10.5C1 11.4319 1 11.8978 1.15224 12.2653C1.35523 12.7554 1.74458 13.1447 2.23463 13.3477C2.60218 13.5 3.06812 13.5 4 13.5V17.75C4 17.9821 4 18.0982 4.00963 18.196C4.10316 19.1456 4.85441 19.8968 5.80397 19.9903C5.90175 20 6.01783 20 6.25 20C6.48217 20 6.59826 20 6.69604 19.9903C7.64559 19.8968 8.39685 19.1456 8.49037 18.196C8.5 18.0982 8.5 17.9821 8.5 17.75V13.5H9.25C11.0164 13.5 13.1772 14.4469 14.8443 15.3556C15.8168 15.8858 16.3031 16.1509 16.6216 16.1118C16.9169 16.0757 17.1402 15.9431 17.3133 15.7011C17.5 15.4401 17.5 14.918 17.5 13.8737V4.12626C17.5 3.08197 17.5 2.55982 17.3133 2.29886C17.1402 2.05687 16.9169 1.92427 16.6216 1.8881C16.3031 1.84909 15.8168 2.11417 14.8443 2.64433C13.1772 3.55309 11.0164 4.49997 9.25 4.49997Z"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div className="ml-5">
        <div className="font-semibold">ENS is open to all!</div>
        <p className="text-gray-200">
          Anyone can participate in the discussions for ENS. Learn how you can participate in the decisions.
        </p>
      </div>
    </div>
  );
};
export default BannerStrong;

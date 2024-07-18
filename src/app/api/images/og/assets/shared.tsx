import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { TenantNamespace } from "@/lib/types";

export const LogoPill = () => {
  const { namespace } = Tenant.current();

  return (
    <div tw="flex">
      <div tw="flex flex-row items-center border border-gray-300 rounded-full px-[26px] py-[14px]">
        <svg
          style={{ width: "30px", height: "30px" }}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path
              d="M5.92915 6.52341C5.83864 9.07058 5.87612 11.6279 5.93006 14.0115C5.96206 15.0829 6.71635 15.7156 7.94789 15.7001H8.07681C8.09052 15.7001 8.10332 15.7001 8.11704 15.7001C9.3257 15.7001 10.0636 15.0711 10.0956 14.0105C10.1504 11.6452 10.1879 9.1008 10.0965 6.52341C10.0581 5.33941 8.99476 4.91792 8.01281 4.91701C7.03178 4.91701 5.96938 5.33941 5.92915 6.5225V6.52341Z"
              fill="black"
            />
            <path
              d="M2.09464 4.57965H0.800013C0.575098 4.57874 0.391327 4.76159 0.391327 4.98742V15.6307C0.391327 15.8556 0.574185 16.0393 0.800013 16.0393H2.09464C3.36459 16.0393 4.39772 15.0061 4.39772 13.7363V6.88365C4.39772 5.61371 3.36459 4.58056 2.09464 4.58056V4.57965Z"
              fill="black"
            />
            <path
              d="M15.3965 0H0.591547C0.365718 0 0.182861 0.182857 0.182861 0.408685V1.35132C0.182861 2.62125 1.21601 3.6544 2.48594 3.6544H4.46354C4.47177 3.65348 4.48457 3.65348 4.50286 3.65348C4.51384 3.65348 4.52846 3.65348 4.54584 3.65257H4.55132H4.55681C4.58972 3.6544 4.62354 3.6544 4.65737 3.6544C4.67109 3.6544 4.69121 3.6544 4.71406 3.65348H4.81006C4.82744 3.6544 4.85029 3.6544 4.87954 3.65257H4.88504H4.89052C4.91704 3.65348 4.94264 3.6544 4.96914 3.65348C4.98377 3.65348 5.00206 3.65348 5.02584 3.65165H5.03132H5.03681C5.07154 3.65257 5.09806 3.65348 5.12824 3.65348C5.14012 3.65348 5.15292 3.65348 5.16937 3.65257H5.17486H5.18034C5.21326 3.6544 5.24617 3.6544 5.28092 3.6544C5.29646 3.6544 5.31474 3.6544 5.33669 3.65257H5.34217H5.34766C5.37692 3.65348 5.40801 3.65532 5.43817 3.6544C5.45829 3.6544 5.48114 3.6544 5.50857 3.65257H5.51406H5.52046C5.54332 3.65348 5.56801 3.65257 5.58994 3.65348C5.60457 3.65348 5.62104 3.65348 5.63932 3.65257H5.64297H5.64937C5.68321 3.65348 5.71429 3.6544 5.74721 3.6544C5.76274 3.6544 5.78104 3.6544 5.80024 3.65257H5.80572H5.81121C5.84046 3.65348 5.87064 3.6544 5.89989 3.6544C5.92092 3.6544 5.94469 3.6544 5.97304 3.65257H5.97852H5.98401C6.00686 3.65348 6.03064 3.65257 6.05349 3.65348C6.06994 3.65348 6.09097 3.65348 6.11384 3.65165H6.11932H6.12572C6.15954 3.65257 6.18332 3.65257 6.20801 3.65348C6.22264 3.65348 6.24001 3.65348 6.25921 3.65257C6.30217 3.65348 6.33509 3.6544 6.36709 3.6544C6.38354 3.6544 6.40184 3.6544 6.42194 3.65257H6.42834H6.43474C6.46401 3.65348 6.49143 3.6544 6.52069 3.6544C6.53714 3.6544 6.55544 3.6544 6.57554 3.65257H6.58104H6.58652C6.61669 3.65348 6.64594 3.6544 6.67429 3.6544C6.69532 3.6544 6.72092 3.6544 6.74652 3.65257H6.75201H6.75749C6.78034 3.65348 6.80412 3.6544 6.82606 3.65348C6.84252 3.65348 6.85989 3.65348 6.88001 3.65257H6.88549H6.89097C6.92297 3.6544 6.95132 3.6544 6.98057 3.6544C7.00434 3.6544 7.03177 3.6544 7.06012 3.65257H7.06561H7.07109C7.09303 3.65348 7.11497 3.6544 7.13509 3.65348C7.15429 3.65348 7.17714 3.65348 7.20092 3.65165H7.20641H7.21189C7.24664 3.65257 7.26949 3.65348 7.29509 3.65348C7.31154 3.65348 7.32892 3.65348 7.34812 3.65257H7.35361H7.35909C7.38926 3.6544 7.41944 3.65532 7.44686 3.6544C7.46789 3.6544 7.49074 3.6544 7.51634 3.65257H7.52184H7.52732C7.55749 3.65348 7.58309 3.6544 7.60686 3.6544C7.62881 3.6544 7.64984 3.6544 7.67361 3.65257H7.67909H7.68457C7.71474 3.65348 7.73944 3.6544 7.76321 3.6544C7.78332 3.6544 7.80434 3.6544 7.82721 3.65257H7.83269H7.83817C7.86834 3.65348 7.89303 3.6544 7.91772 3.6544C7.93874 3.6544 7.95977 3.6544 7.98264 3.65257H7.98812H7.99361C8.02469 3.65348 8.04846 3.6544 8.07406 3.6544C8.09874 3.6544 8.12434 3.6544 8.14994 3.65257H8.22217C8.24504 3.65348 8.26789 3.65348 8.29257 3.65165H8.29806H8.30354C8.33829 3.65257 8.36024 3.65348 8.38401 3.65348C8.40412 3.65348 8.42697 3.65348 8.44892 3.65165H8.45441H8.47086C8.49464 3.65257 8.51566 3.65348 8.53669 3.65348C8.55589 3.65348 8.57509 3.65348 8.59612 3.65257H8.60161H8.61166C8.63909 3.6544 8.66469 3.6544 8.68937 3.6544C8.71314 3.6544 8.73874 3.6544 8.76434 3.65257H8.76984H8.77532C8.80184 3.65348 8.82744 3.6544 8.85029 3.6544C8.87314 3.6544 8.89512 3.6544 8.91796 3.65257H8.92347H8.92889C8.96089 3.65348 8.98196 3.65532 9.00205 3.6544C9.02125 3.6544 9.04409 3.6544 9.06427 3.65348H9.06969H9.07521C9.10267 3.65532 9.12916 3.65532 9.15289 3.65532C9.18676 3.65532 9.22152 3.6544 9.25805 3.65165H9.30836C9.33485 3.65165 9.36045 3.65165 9.38792 3.64983H9.39334H9.39885C9.42632 3.65075 9.44827 3.65165 9.46836 3.65165C9.49209 3.65165 9.51592 3.65165 9.54152 3.64983H9.54694H9.55245C9.57992 3.65075 9.60187 3.65165 9.62196 3.65165C9.64392 3.65165 9.66676 3.65165 9.69049 3.65075H9.69601H9.70152C9.72889 3.65257 9.75272 3.65165 9.77467 3.65257C9.79929 3.65257 9.82489 3.65257 9.85049 3.65075H9.85601H9.86241C9.89076 3.65165 9.91272 3.65257 9.93281 3.65257C9.95752 3.65257 9.98312 3.65257 10.0087 3.65075H10.0141H10.0197C10.0525 3.65165 10.0709 3.65257 10.0901 3.65257C10.1148 3.65257 10.1413 3.65257 10.1669 3.65075H10.1724H10.1779C10.208 3.65165 10.2281 3.65348 10.2455 3.65257C10.2701 3.65257 10.2957 3.65257 10.3213 3.65075H10.3269H10.3443C10.3653 3.65075 10.3827 3.65165 10.3991 3.65257C10.4292 3.65257 10.4595 3.65257 10.4905 3.65075H10.496H10.5015C10.5188 3.65075 10.5344 3.65075 10.55 3.65075C10.5773 3.65075 10.6067 3.65075 10.6349 3.64892H10.6405H10.646C10.6752 3.64983 10.6944 3.65165 10.7109 3.65075C10.7373 3.65075 10.7648 3.65075 10.7932 3.64892H10.7987H10.816C10.8343 3.64892 10.8489 3.65075 10.8636 3.65075C10.8864 3.65075 10.9111 3.65075 10.9348 3.64983H10.9404H10.9459C10.9741 3.65165 10.9971 3.65257 11.0163 3.65165C11.0455 3.65165 11.0739 3.65165 11.1049 3.64983H11.1104H11.1269C11.1479 3.64983 11.1644 3.65165 11.178 3.65165C11.2055 3.65165 11.232 3.65165 11.2604 3.64983H11.2659H11.2868C11.306 3.64983 11.3207 3.65165 11.3325 3.65075C11.3636 3.65075 11.3965 3.65075 11.4277 3.64892H11.4332H11.4387C11.4569 3.64983 11.4743 3.65075 11.4861 3.64983C11.51 3.64983 11.5356 3.64983 11.5603 3.64892L11.6599 3.64525V3.65165L13.5031 3.65348C14.7731 3.65348 15.8061 2.62035 15.8061 1.3504V0.408685C15.8061 0.183772 15.6233 0 15.3975 0H15.3965Z"
              fill="black"
            />
            <path
              d="M15.2275 4.57875H13.9328C12.6629 4.57875 11.6297 5.61189 11.6297 6.88183V13.7344C11.6297 15.0043 12.6629 16.0375 13.9328 16.0375H15.2275C15.4524 16.0375 15.6361 15.8547 15.6361 15.6288V4.98743C15.6361 4.76252 15.4533 4.57875 15.2275 4.57875Z"
              fill="black"
            />
          </g>
        </svg>
        <div tw="bg-gray-300 w-px h-3/4 mx-[18px]"></div>
        {ogLogoForNamespace(namespace)}
      </div>
    </div>
  );
};

const ogLogoForNamespace = (namespace: TenantNamespace) => {
  switch (namespace) {
    case TENANT_NAMESPACES.ENS:
      return (
        <svg
          width="36"
          height="40"
          viewBox="0 0 36 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_512_13)">
            <path
              d="M4.60522 16.2176C5.00137 17.0581 5.99174 18.7392 5.99174 18.7392L17.3315 0L6.28885 7.71323C5.64511 8.15822 5.10041 8.75155 4.70426 9.44376C3.66437 11.5698 3.66437 14.042 4.60522 16.2176Z"
              fill="url(#paint0_linear_512_13)"
            />
            <path
              d="M0.148575 22.3486C0.396168 25.958 2.22835 29.3202 5.10043 31.4957L17.3315 40C17.3315 40 9.65614 28.9741 3.21873 17.9975C2.57499 16.8603 2.12932 15.5748 1.93124 14.2398C1.83221 13.6465 1.83221 13.0532 1.93124 12.4598C1.78269 12.7565 1.43606 13.3993 1.43606 13.3993C0.792317 14.7343 0.346649 16.1681 0.0990565 17.6514C-0.0494992 19.2336 -0.0494992 20.8158 0.148575 22.3486Z"
              fill="#A0A8D4"
            />
            <path
              d="M31.3453 23.8319C30.9491 22.9913 29.9588 21.3102 29.9588 21.3102L18.619 40L29.7112 32.3362C30.3549 31.8912 30.8996 31.2979 31.2958 30.6057C32.2861 28.4796 32.3357 26.0074 31.3453 23.8319Z"
              fill="url(#paint1_linear_512_13)"
            />
            <path
              d="M35.8515 17.6514C35.6039 14.042 33.7717 10.6799 30.8997 8.50433L18.6686 0C18.6686 0 26.344 11.026 32.7814 22.0025C33.4251 23.1397 33.8708 24.4252 34.0689 25.7602C34.1679 26.3535 34.1679 26.9468 34.0689 27.5402C34.2174 27.2435 34.564 26.6007 34.564 26.6007C35.2078 25.2658 35.6534 23.8319 35.901 22.398C36.0001 20.7664 36.0001 19.2336 35.8515 17.6514Z"
              fill="#A0A8D4"
            />
            <path
              d="M4.70428 9.44376C5.10043 8.75155 5.59562 8.15822 6.28888 7.71323L17.3315 0L5.99177 18.6897C5.99177 18.6897 5.00139 17.0087 4.60525 16.1681C3.66439 14.042 3.66439 11.5698 4.70428 9.44376ZM0.148575 22.3486C0.396168 25.958 2.22835 29.3201 5.10043 31.4957L17.3315 40C17.3315 40 9.65614 28.974 3.21873 17.9975C2.57499 16.8603 2.12932 15.5748 1.93124 14.2398C1.83221 13.6465 1.83221 13.0532 1.93124 12.4598C1.78269 12.7565 1.43606 13.3993 1.43606 13.3993C0.792316 14.7342 0.346649 16.1681 0.0990565 17.6514C-0.0494992 19.2336 -0.0494992 20.8158 0.148575 22.3486ZM31.3453 23.8319C30.9491 22.9913 29.9588 21.3103 29.9588 21.3103L18.619 40L29.7112 32.3362C30.3549 31.8912 30.8996 31.2979 31.2958 30.6057C32.2861 28.4796 32.3356 26.0074 31.3453 23.8319ZM35.8019 17.7009C35.5544 14.0915 33.7222 10.7293 30.8501 8.55377L18.6685 0C18.6685 0 26.3439 11.026 32.7813 22.0025C33.4251 23.1397 33.8707 24.4252 34.0688 25.7602C34.1678 26.3535 34.1678 26.9468 34.0688 27.5402C34.2174 27.2435 34.564 26.6007 34.564 26.6007C35.2077 25.2658 35.6534 23.8319 35.901 22.398C36 20.7664 36 19.2336 35.8019 17.7009Z"
              fill="url(#paint2_linear_512_13)"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_512_13"
              x1="17.8473"
              y1="0.468776"
              x2="3.3217"
              y2="16.2394"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.58" stop-color="#A0A8D4" />
              <stop offset="0.73" stop-color="#8791C7" />
              <stop offset="0.91" stop-color="#6470B4" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_512_13"
              x1="18.1529"
              y1="39.5641"
              x2="32.673"
              y2="23.8047"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.58" stop-color="#A0A8D4" />
              <stop offset="0.73" stop-color="#8791C7" />
              <stop offset="0.91" stop-color="#6470B4" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_512_13"
              x1="17.9865"
              y1="-0.197726"
              x2="17.9865"
              y2="40.1483"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#513EFF" />
              <stop offset="0.18" stop-color="#5157FF" />
              <stop offset="0.57" stop-color="#5298FF" />
              <stop offset="1" stop-color="#52E5FF" />
            </linearGradient>
            <clipPath id="clip0_512_13">
              <rect width="36" height="40" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );

    case TENANT_NAMESPACES.ETHERFI:
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z"
            fill="#23144F"
          />
          <path
            d="M31.0401 23.3026L31.0842 19.0936C31.0863 18.9701 31.017 18.855 30.9088 18.7949L27.2602 16.7862C27.2329 16.772 27.2016 16.7602 27.1726 16.7524C27.0818 16.7178 26.9774 16.7208 26.8876 16.7726L18.5307 21.5921L18.5701 17.9544C18.5721 17.8307 18.5028 17.7156 18.3947 17.6556L15.2605 15.9296L23.6134 11.1125C23.6624 11.0842 23.6979 11.042 23.7269 10.998C23.7731 10.9414 23.8026 10.87 23.8022 10.7941L23.8462 6.5851C23.8482 6.46153 23.779 6.3464 23.6709 6.28641L20.0222 4.27769C19.9501 4.23767 19.8693 4.22983 19.7931 4.24389L19.7899 4.24302C19.7679 4.24749 19.7484 4.25605 19.7256 4.26375C19.7061 4.27231 19.6818 4.27269 19.6646 4.28535L5.41022 12.5005C5.41022 12.5005 5.38229 12.5275 5.36509 12.5401C5.27183 12.6049 5.21677 12.7073 5.22052 12.8221L5.2924 16.9208C5.29528 17.0388 5.3566 17.1448 5.45512 17.2023L8.83249 19.2314L8.90389 23.1644C8.9068 23.2824 8.96808 23.3885 9.06657 23.4459L12.456 25.4817L12.5263 29.4316C12.5292 29.5497 12.5905 29.6557 12.689 29.7132L16.2209 31.8354C16.2474 31.8528 16.2787 31.8648 16.3076 31.8726C16.3141 31.8743 16.3214 31.8726 16.3311 31.8752C16.3311 31.8752 16.3343 31.8761 16.3375 31.877C16.4212 31.8994 16.5136 31.8898 16.5952 31.8426L30.8554 23.6186C30.9043 23.5903 30.9399 23.5482 30.969 23.5043C31.0153 23.4477 31.0448 23.3762 31.0444 23.3003L31.0401 23.3026ZM24.8272 26.3172L24.8637 22.8959L27.1695 21.5689L30.056 23.3044L24.8295 26.3213L24.8272 26.3172ZM16.7398 30.9813L16.7763 27.5601L20.9486 25.1538L23.8351 26.8894L16.7398 30.9813ZM21.2809 24.1842L21.2279 21.2389L23.866 22.6906L21.2817 24.181L21.2809 24.1842ZM24.186 23.2868L24.1548 26.2888L21.619 24.7644L24.1869 23.2836L24.186 23.2868ZM24.551 22.2983L21.5611 20.6524L26.7745 17.6457L26.8331 20.9822L24.551 22.2983ZM20.5536 21.2306L20.6122 24.5671L16.4603 26.9616L13.4704 25.3156L20.5536 21.2306ZM30.409 19.2817L30.3725 22.703L27.5068 20.9799L27.4464 17.6499L30.409 19.2817ZM13.115 24.71L13.1515 21.2887L14.6539 20.4222L17.5404 22.1578L13.115 24.71ZM14.9861 19.4527L14.9332 16.5074L17.5712 17.9591L14.987 19.4494L14.9861 19.4527ZM17.8592 21.5605L15.3234 20.0361L17.8913 18.5552L17.8601 21.5572L17.8592 21.5605ZM14.3199 19.8397L12.8379 20.6943L9.84799 19.0484L14.2612 16.5032L14.3199 19.8397ZM13.3573 8.69538L13.4159 12.0319L9.22728 14.4475L6.23738 12.8015L13.3573 8.69538ZM19.5423 5.12843L19.601 8.46491L17.3555 9.75981L14.3657 8.11385L19.5423 5.12843ZM17.6317 13.7787L17.6675 10.3606L19.9373 9.05156L22.8247 10.7839L17.6317 13.7787ZM14.0846 11.6489L14.0316 8.70364L16.6697 10.1553L14.0855 11.6457L14.0846 11.6489ZM16.9898 10.7514L16.9585 13.7535L14.4259 12.2301L16.9938 10.7491L16.9898 10.7514ZM13.7564 12.6162L16.6438 14.3485L9.51164 18.4617L9.5473 15.0436L13.7564 12.6162ZM23.1752 6.77082L23.1386 10.1921L20.2728 8.46908L20.2125 5.13904L23.1752 6.77082ZM5.90653 13.3921L8.54464 14.8438L5.96037 16.3342L5.9074 13.3889L5.90653 13.3921ZM6.2968 16.9209L8.8647 15.44L8.83344 18.442L6.30086 16.9186L6.2968 16.9209ZM9.57432 22.9682L9.51395 19.6381L12.4766 21.27L12.44 24.6912L9.57432 22.9682ZM13.1396 25.9063L15.7777 27.358L13.1935 28.8483L13.1404 25.903L13.1396 25.9063ZM13.5298 29.435L16.0977 27.9541L16.0665 30.9561L13.5307 29.4318L13.5298 29.435Z"
            fill="white"
          />
        </svg>
      );

    case TENANT_NAMESPACES.UNISWAP:
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.6103 6.92064C12.2822 6.86975 12.2684 6.86374 12.4228 6.84004C12.7187 6.7945 13.4174 6.85655 13.899 6.97101C15.0231 7.23823 16.0459 7.92274 17.1378 9.13837L17.4279 9.46136L17.8428 9.39464C19.591 9.11371 21.3693 9.33696 22.8568 10.0241C23.266 10.2131 23.9112 10.5895 23.9918 10.6862C24.0175 10.717 24.0647 10.9154 24.0966 11.1271C24.2071 11.8594 24.1518 12.4208 23.9278 12.8401C23.8059 13.0683 23.7991 13.1405 23.881 13.3358C23.9465 13.4917 24.1288 13.607 24.3094 13.6068C24.6791 13.6062 25.0769 13.0087 25.2613 12.1773L25.3345 11.847L25.4796 12.0113C26.2753 12.9128 26.9003 14.1423 27.0076 15.0174L27.0355 15.2455L26.9018 15.0381C26.6716 14.6812 26.4403 14.4382 26.1442 14.2422C25.6103 13.889 25.0458 13.7688 23.5509 13.69C22.2007 13.6188 21.4366 13.5035 20.6788 13.2564C19.3897 12.8361 18.7398 12.2763 17.2084 10.2671C16.5282 9.37476 16.1078 8.88098 15.6896 8.48335C14.7393 7.57987 13.8056 7.10603 12.6103 6.92064Z"
            fill="#FF007A"
          />
          <path
            d="M24.2964 8.91318C24.3303 8.31522 24.4114 7.92074 24.5745 7.56057C24.639 7.41797 24.6995 7.30127 24.7088 7.30127C24.7181 7.30127 24.6901 7.40652 24.6465 7.53513C24.5279 7.88474 24.5085 8.36285 24.5901 8.91919C24.6938 9.62504 24.7527 9.72686 25.4987 10.4894C25.8487 10.847 26.2557 11.2981 26.4032 11.4917L26.6715 11.8438L26.4032 11.5922C26.0751 11.2845 25.3206 10.6843 25.1539 10.5985C25.0422 10.541 25.0256 10.5419 24.9566 10.6106C24.8931 10.6738 24.8797 10.7688 24.8709 11.2179C24.8572 11.9179 24.7618 12.3672 24.5315 12.8164C24.407 13.0594 24.3873 13.0075 24.5001 12.7333C24.5842 12.5285 24.5927 12.4385 24.5921 11.7608C24.5908 10.3994 24.4292 10.0721 23.4813 9.51137C23.2411 9.36933 22.8455 9.16445 22.6021 9.05611C22.3586 8.94778 22.1652 8.85337 22.1722 8.84635C22.1991 8.81962 23.1235 9.08942 23.4956 9.23252C24.049 9.44543 24.1404 9.47301 24.2076 9.44734C24.2527 9.43016 24.2745 9.2989 24.2964 8.91318Z"
            fill="#FF007A"
          />
          <path
            d="M13.2477 11.2423C12.5816 10.3252 12.1695 8.91909 12.2586 7.86796L12.2863 7.54266L12.4379 7.57035C12.7227 7.6223 13.2136 7.80505 13.4435 7.94467C14.0744 8.32781 14.3475 8.83226 14.6254 10.1276C14.7068 10.507 14.8135 10.9364 14.8627 11.0818C14.9418 11.3158 15.2407 11.8623 15.4837 12.2172C15.6588 12.4728 15.5425 12.594 15.1556 12.559C14.5646 12.5057 13.7641 11.9533 13.2477 11.2423Z"
            fill="#FF007A"
          />
          <path
            d="M23.4883 18.0678C20.3753 16.8144 19.2789 15.7264 19.2789 13.8907C19.2789 13.6205 19.2882 13.3995 19.2995 13.3995C19.3108 13.3995 19.4313 13.4887 19.5672 13.5976C20.1984 14.1039 20.9053 14.3202 22.8623 14.6057C24.0139 14.7737 24.6619 14.9094 25.2597 15.1076C27.1598 15.7378 28.3354 17.0166 28.6157 18.7584C28.6972 19.2646 28.6494 20.2136 28.5173 20.7139C28.413 21.109 28.0949 21.8211 28.0105 21.8484C27.9871 21.856 27.9641 21.7664 27.9581 21.6443C27.9261 20.9903 27.5956 20.3535 27.0405 19.8766C26.4095 19.3343 25.5615 18.9025 23.4883 18.0678Z"
            fill="#FF007A"
          />
          <path
            d="M21.3029 18.5885C21.2639 18.3564 21.1963 18.06 21.1526 17.9298L21.0731 17.6931L21.2207 17.8587C21.4248 18.0879 21.5862 18.3812 21.7229 18.7717C21.8273 19.0698 21.839 19.1584 21.8382 19.6429C21.8375 20.1185 21.8244 20.2182 21.7281 20.4865C21.5761 20.9096 21.3875 21.2096 21.071 21.5316C20.5024 22.1104 19.7713 22.4308 18.7162 22.5637C18.5328 22.5868 17.9983 22.6257 17.5284 22.6502C16.3441 22.7117 15.5647 22.839 14.8644 23.0849C14.7637 23.1203 14.6737 23.1418 14.6646 23.1327C14.6363 23.1045 15.1132 22.8202 15.507 22.6304C16.0624 22.3629 16.6152 22.217 17.8538 22.0107C18.4657 21.9088 19.0976 21.7852 19.258 21.736C20.7733 21.2714 21.5522 20.0725 21.3029 18.5885Z"
            fill="#FF007A"
          />
          <path
            d="M22.7299 21.1229C22.3163 20.2337 22.2214 19.3753 22.4479 18.5746C22.4722 18.4891 22.5112 18.4191 22.5347 18.4191C22.5581 18.4191 22.6557 18.4719 22.7515 18.5363C22.9421 18.6647 23.3243 18.8807 24.3428 19.436C25.6136 20.1289 26.3382 20.6654 26.831 21.2783C27.2624 21.8152 27.5295 22.4266 27.6581 23.1721C27.7308 23.5945 27.6882 24.6106 27.5798 25.0359C27.2381 26.3768 26.444 27.43 25.3113 28.0445C25.1454 28.1346 24.9964 28.2085 24.9803 28.2089C24.9642 28.2092 25.0246 28.0554 25.1146 27.8672C25.4957 27.0707 25.5391 26.2959 25.251 25.4336C25.0746 24.9055 24.715 24.2612 23.9889 23.1723C23.1446 21.9063 22.9376 21.5693 22.7299 21.1229Z"
            fill="#FF007A"
          />
          <path
            d="M11.0369 25.9203C12.1922 24.9448 13.6296 24.2519 14.9389 24.0392C15.5032 23.9475 16.4432 23.9839 16.9657 24.1176C17.8033 24.332 18.5525 24.8121 18.9422 25.3841C19.323 25.9431 19.4864 26.4303 19.6565 27.5142C19.7236 27.9418 19.7966 28.3711 19.8186 28.4683C19.9464 29.0301 20.195 29.4791 20.503 29.7046C20.9923 30.0627 21.8348 30.085 22.6635 29.7617C22.8042 29.7068 22.9263 29.6689 22.9349 29.6775C22.9649 29.7073 22.5476 29.9867 22.2532 30.1337C21.8571 30.3316 21.542 30.4081 21.1235 30.4081C20.3644 30.4081 19.7342 30.022 19.2084 29.2346C19.1049 29.0797 18.8723 28.6155 18.6915 28.2033C18.1364 26.937 17.8622 26.5512 17.2175 26.129C16.6565 25.7617 15.9331 25.6959 15.3888 25.9628C14.6738 26.3133 14.4744 27.2269 14.9864 27.806C15.1899 28.0361 15.5695 28.2345 15.8798 28.2731C16.4604 28.3453 16.9593 27.9037 16.9593 27.3175C16.9593 26.9369 16.813 26.7197 16.4448 26.5535C15.9418 26.3266 15.4011 26.5918 15.4037 27.0644C15.4049 27.2659 15.4926 27.3924 15.6945 27.4838C15.8241 27.5424 15.8271 27.5471 15.7214 27.5251C15.26 27.4294 15.1518 26.8731 15.5229 26.5037C15.9684 26.0603 16.8896 26.2559 17.206 26.8612C17.3389 27.1154 17.3543 27.6217 17.2384 27.9274C16.9791 28.6117 16.223 28.9716 15.4559 28.7757C14.9337 28.6424 14.7211 28.4981 14.0914 27.8495C12.9973 26.7225 12.5726 26.5041 10.9953 26.2579L10.693 26.2107L11.0369 25.9203Z"
            fill="#FF007A"
          />
          <path
            d="M2.78679 0.674121C6.44058 5.10873 12.0736 12.0132 12.3533 12.3997C12.5842 12.7189 12.4973 13.0058 12.1017 13.2307C11.8817 13.3558 11.4295 13.4825 11.203 13.4825C10.9469 13.4825 10.6584 13.3591 10.4483 13.1598C10.2998 13.019 9.70041 12.124 8.31674 9.977C7.25802 8.33425 6.37201 6.97148 6.34786 6.94867C6.29198 6.89588 6.29293 6.89768 8.20879 10.3257C9.41179 12.4782 9.8179 13.2392 9.8179 13.3409C9.8179 13.548 9.76145 13.6567 9.50608 13.9416C9.08037 14.4165 8.8901 14.9501 8.75272 16.0545C8.59867 17.2925 8.16566 18.167 6.96559 19.6636C6.26311 20.5398 6.14814 20.7003 5.9709 21.0535C5.74759 21.4981 5.68621 21.7472 5.66133 22.3087C5.63505 22.9024 5.68627 23.2859 5.86767 23.8536C6.02644 24.3505 6.19218 24.6786 6.61592 25.335C6.98159 25.9014 7.1922 26.3223 7.1922 26.4869C7.1922 26.6179 7.21719 26.6181 7.78387 26.4902C9.13991 26.1839 10.2411 25.6453 10.8604 24.9853C11.2436 24.5768 11.3336 24.3512 11.3365 23.7913C11.3384 23.4252 11.3256 23.3485 11.2266 23.1378C11.0655 22.795 10.7722 22.5099 10.1256 22.0679C9.27852 21.4889 8.91672 21.0226 8.81675 20.3815C8.73475 19.8554 8.82989 19.4843 9.29851 18.5021C9.78358 17.4854 9.90377 17.0522 9.98509 16.0275C10.0376 15.3654 10.1103 15.1043 10.3006 14.8947C10.4989 14.6761 10.6775 14.6022 11.1685 14.5351C11.9689 14.4257 12.4786 14.2187 12.8976 13.8326C13.261 13.4977 13.4131 13.175 13.4364 12.6892L13.4541 12.321L13.251 12.0842C12.5155 11.2266 2.29423 0 2.24897 0C2.2393 0 2.48133 0.303376 2.78679 0.674121ZM7.60505 22.9805C7.77135 22.686 7.683 22.3074 7.40483 22.1224C7.14199 21.9476 6.73369 22.03 6.73369 22.2577C6.73369 22.3272 6.77216 22.3778 6.85876 22.4224C7.00456 22.4974 7.01518 22.5818 6.90044 22.7542C6.78424 22.9289 6.79362 23.0825 6.92689 23.1868C7.14171 23.355 7.44577 23.2625 7.60505 22.9805Z"
            fill="#FF007A"
          />
          <path
            d="M13.9592 14.7282C13.5835 14.8436 13.2182 15.2419 13.1051 15.6595C13.0362 15.9143 13.0753 16.3611 13.1786 16.4991C13.3456 16.722 13.507 16.7808 13.9441 16.7777C14.7998 16.7717 15.5437 16.4047 15.6302 15.9459C15.7011 15.5698 15.3744 15.0486 14.9243 14.8198C14.6921 14.7017 14.1982 14.6549 13.9592 14.7282ZM14.9596 15.5105C15.0916 15.323 15.0338 15.1203 14.8094 14.9833C14.382 14.7223 13.7357 14.9382 13.7357 15.342C13.7357 15.543 14.0727 15.7623 14.3817 15.7623C14.5873 15.7623 14.8687 15.6397 14.9596 15.5105Z"
            fill="#FF007A"
          />
        </svg>
      );

    case TENANT_NAMESPACES.OPTIMISM:
    default:
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <mask
              id="mask0_513_21"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="36"
              height="36"
            >
              <path d="M36 0H0V36H36V0Z" fill="white" />
            </mask>
            <g mask="url(#mask0_513_21)">
              <path
                d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z"
                fill="#FF0420"
              />
              <path
                d="M12.7536 22.7841C11.6818 22.7841 10.8037 22.532 10.1191 22.0276C9.44364 21.5142 9.1059 20.7847 9.1059 19.839C9.1059 19.6409 9.1284 19.3977 9.17343 19.1095C9.29054 18.461 9.45714 17.6819 9.67332 16.7722C10.2858 14.2954 11.8664 13.057 14.4153 13.057C15.1088 13.057 15.7303 13.1741 16.2797 13.4083C16.8291 13.6334 17.2614 13.9757 17.5766 14.435C17.8919 14.8853 18.0495 15.4258 18.0495 16.0562C18.0495 16.2454 18.027 16.484 17.9819 16.7722C17.8468 17.5738 17.6847 18.3529 17.4955 19.1095C17.1803 20.3434 16.6354 21.2666 15.8609 21.879C15.0863 22.4824 14.0505 22.7841 12.7536 22.7841ZM12.9427 20.8387C13.4471 20.8387 13.8749 20.6901 14.2262 20.3929C14.5864 20.0957 14.8431 19.6409 14.9962 19.0284C15.2034 18.1818 15.361 17.4432 15.4691 16.8128C15.5051 16.6236 15.5231 16.43 15.5231 16.2318C15.5231 15.4122 15.0953 15.0024 14.2397 15.0024C13.7353 15.0024 13.303 15.1511 12.9427 15.4483C12.5915 15.7455 12.3393 16.2003 12.1861 16.8128C12.024 17.4162 11.8619 18.1548 11.6998 19.0284C11.6638 19.2085 11.6458 19.3977 11.6458 19.5958C11.6458 20.4244 12.0781 20.8387 12.9427 20.8387Z"
                fill="white"
              />
              <path
                d="M18.6698 22.649C18.5707 22.649 18.4941 22.6174 18.4401 22.5544C18.3951 22.4823 18.3816 22.4013 18.3996 22.3112L20.2639 13.5298C20.282 13.4307 20.3315 13.3496 20.4125 13.2866C20.4936 13.2235 20.5792 13.192 20.6692 13.192H24.2629C25.2626 13.192 26.0642 13.3992 26.6676 13.8135C27.2801 14.2278 27.5863 14.8267 27.5863 15.6103C27.5863 15.8355 27.5593 16.0696 27.5053 16.3128C27.2801 17.3486 26.8253 18.1141 26.1408 18.6095C25.4653 19.1048 24.5376 19.3526 23.3577 19.3526H21.5339L20.9124 22.3112C20.8944 22.4103 20.8449 22.4913 20.7638 22.5544C20.6827 22.6174 20.5972 22.649 20.5071 22.649H18.6698ZM23.4523 17.4882C23.8306 17.4882 24.1593 17.3846 24.4385 17.1774C24.7267 16.9703 24.9159 16.6731 25.0059 16.2858C25.0329 16.1327 25.0464 15.9976 25.0464 15.8805C25.0464 15.6193 24.9699 15.4211 24.8168 15.2861C24.6637 15.142 24.4025 15.0699 24.0332 15.0699H22.412L21.8987 17.4882H23.4523Z"
                fill="white"
              />
            </g>
          </g>
          <defs>
            <clipPath id="clip0_513_21">
              <rect width="36" height="36" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );
  }
};

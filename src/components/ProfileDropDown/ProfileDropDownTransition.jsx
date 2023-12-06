import { Transition } from "@headlessui/react";

export const ProfileDropDownTransition = ({ children }) => {
  return (
    <>
      <Transition className="absolute z-10 right-0 block md:hidden">
        {children}
      </Transition>
      <Transition
        className="absolute z-10 right-0 hidden md:block"
        enter="transition duration-00 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        {children}
      </Transition>
    </>
  );
};

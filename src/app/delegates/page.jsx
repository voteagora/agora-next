import styles from "./styles.module.scss";
import {
  ArrowRightIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

import faker from "faker";

const people = Array.from({ length: 33 }, () => ({
  name: faker.name.findName(),
  title: faker.name.jobTitle(),
  email: faker.internet.email(),
  telephone: faker.phone.phoneNumber(),
}));

export default function Page() {
  return (
    <div>
      <h1 className="pageTitle">Delegates</h1>
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {people.map((person) => (
          <li
            key={person.email}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
          >
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {person.name}
                  </h3>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">
                  {person.title}
                </p>
              </div>
              <UserIcon className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300" />
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                  <a
                    href={`mailto:${person.email}`}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                  >
                    <ArrowRightIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    Delegate
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import EventCard from "./EventCard";
import {
  ChatBubbleLeftEllipsisIcon,
  TagIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";

export const EventFeed = ({ events }) => {
  return (
    <div className="mt-6 overflow-hidden border-t border-gray-100">
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {events.map((activityItem, activityItemIdx) => (
            <li key={activityItem.id}>
              <div className="relative pb-8">
                {activityItemIdx !== events.length - 1 ? (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  {activityItem.kind === "VOTE_CAST" ? (
                    <>
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                          <UserCircleIcon
                            className="h-5 w-5 text-gray-500"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1.5">
                        <div className="text-sm text-gray-500">
                          <a href={"#"} className="font-medium text-gray-900">
                            <p>{JSON.parse(activityItem.event_data).address} casted a vote</p>
                          </a>{" "}                          
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>{JSON.parse(activityItem.event_data).reason}</p>
                        </div>
                      </div>
                    </>
                  ) : activityItem.kind === "DELEGATE_CHANGED" ? (
                    <>
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                          <UserCircleIcon
                            className="h-5 w-5 text-gray-500"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1.5">
                        <div className="text-sm text-gray-500">
                          Delegation changed by{" "}
                          <a href={"#"} className="font-medium text-gray-900">
                            <p>{JSON.parse(activityItem.event_data).delegator}</p>
                          </a>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>From: {activityItem.event_data.from_delegate}</p>
                          <p>To: {activityItem.event_data.to_delegate}</p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventFeed;

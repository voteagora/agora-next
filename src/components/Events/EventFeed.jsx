"use client";

export const EventFeed = ({ events }) => {

  return (
    <div className="mt-6 overflow-hidden border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <table className="w-full text-left">
            <tbody>
              {events.map((event) => (
                <tr
                  className="cursor-pointer"
                  key={event.id}
                >
                  <td className="relative py-5 pr-6">
                    <div className="flex gap-x-6">
                      <div className="flex-auto">
                        <div className="">
                          <div className="flex leading-8 text-xs text-gray-500">
                            {event.kind}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                    <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                  </td>
                  <td className="relative py-5 pr-6">
                    <div className="text-sm leading-6 text-gray-900">
                      {event.event_data}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventFeed;

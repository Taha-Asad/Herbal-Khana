import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { TrackingTimelineProps } from "@/types/order";
import { formatDate } from "@/utils/FormatDate";
import { getStatusColor, getStatusIcon } from "@/utils/OrderRelated";
import { MapPin, RefreshCw, Truck } from "lucide-react";

export default function TrackingTimeline({
  events,
  isRefreshing,
  onRefresh,
}: TrackingTimelineProps) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <Truck className="w-6 h-6 text-[#DDA200]" />
          Tracking History
        </h3>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#DDA200] 
            hover:bg-[#DDA200]/10 rounded-lg transition-all duration-300
            disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {events.map((event, index) => {
          const Icon = getStatusIcon(event.status);
          const color = getStatusColor(event.status);

          return (
            <div
              key={event.id}
              className={`relative flex gap-4 pb-8 last:pb-0 transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Timeline Line */}
              {index < events.length - 1 && (
                <div
                  className="absolute left-[22px] top-12 w-0.5 h-[calc(100%-48px)]"
                  style={{
                    backgroundColor: event.isCompleted ? color : "#E5E7EB",
                  }}
                />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center 
                  flex-shrink-0 transition-all duration-300 ${
                    event.isCurrent ? "ring-4 animate-pulse" : ""
                  }`}
                style={{
                  backgroundColor:
                    event.isCompleted || event.isCurrent ? color : "#E5E7EB",
                  color:
                    event.isCompleted || event.isCurrent ? "white" : "#9CA3AF",
                  boxShadow: event.isCurrent
                    ? `0 0 0 4px ${color}30`
                    : undefined,
                }}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4
                      className={`font-bold ${
                        event.isCompleted || event.isCurrent
                          ? "text-stone-800"
                          : "text-stone-400"
                      }`}
                    >
                      {event.title}
                    </h4>
                    <p
                      className={`text-sm mt-0.5 ${
                        event.isCompleted || event.isCurrent
                          ? "text-stone-600"
                          : "text-stone-400"
                      }`}
                    >
                      {event.description}
                    </p>
                    {event.location && (
                      <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      event.isCompleted || event.isCurrent
                        ? "text-stone-500"
                        : "text-stone-400"
                    }`}
                  >
                    {formatDate(event.timestamp, true)}
                  </span>
                </div>

                {/* Current Status Indicator */}
                {event.isCurrent && (
                  <div
                    className="mt-3 px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    Your package is currently here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

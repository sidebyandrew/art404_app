export default function TheTooltip({
  tooltipId,
  tooltipInfo,
}: {
  tooltipId: string;
  tooltipInfo: string;
}) {
  return (
    <div
      id={tooltipId}
      role="tooltip"
      className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300 dark:bg-gray-700"
    >
      {tooltipInfo}
      <div className="tooltip-arrow" data-popper-arrow=""></div>
    </div>
  );
}

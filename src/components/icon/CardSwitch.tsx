import CardLarge from '@/components/icon/CardLarge';
import CardSmall from '@/components/icon/CardSmall';
import TheTooltip from '@/components/tooltip';

export default function CardSwitch({ isLargeView }: { isLargeView: boolean }) {
  const tooltipId = 'card_switch_tooltip_id';

  const icon = () => {
    if (isLargeView) {
      return <CardLarge />;
    } else {
      return <CardSmall />;
    }
  };

  return (
    <>
      <div
        data-tooltip-target={tooltipId}
        // @click="$emit('toggle')"
        className="cursor-pointer"
      >
        {icon()}
      </div>
      <TheTooltip tooltipId={tooltipId} tooltipInfo="Toggle View Mode" />
    </>
  );
}

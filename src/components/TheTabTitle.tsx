export default function TheTabTitle({ title }: { title: string }) {
  return (
    <div className="mb-2 flex flex-row border-b border-b-gray-800 pb-1">
      <div className="w-1/2">
        <h2 className="text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-4xl">
          {title}
        </h2>
      </div>
      <div className="hidden flex-row items-end justify-end sm:flex sm:w-1/2">
        <slot />
      </div>
    </div>
  );
}

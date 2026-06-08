type ContextSidebarProps = {
  children: React.ReactNode;
};

export default function ContextSidebar({ children }: ContextSidebarProps) {
  return (
    <aside className='hidden w-80 shrink-0 xl:block'>
      <div className='sticky top-6 mt-10'>{children}</div>
    </aside>
  );
}

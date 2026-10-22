import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });

export function ReactSelect(props: React.ComponentProps<typeof Select>) {
  const defaultStyles = {
    menuPortal: (old: any) => ({ ...old, zIndex: 9999 }),
    menu: (old: any) => ({ ...old, zIndex: 9999 }),
    placeholder: (old: any) => ({
      ...old,
      color: "#94A3B8",
    }),
    container: (old: any) => ({
      ...old,
    }),
    control: (old: any) => ({
      ...old,
      overflow: "hidden",
      borderRadius: "10px",
      borderColor: "#e5e5e5",
    }),
  };

  return (
    <Select
      {...props}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      menuPosition="fixed"
      styles={{ ...defaultStyles, ...props.styles }}
    />
  );
}

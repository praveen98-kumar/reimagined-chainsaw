"use client";

import { DiscipleDetailCard } from "@/components/v2/DiscipleDetailCard";
import { ReactSelect } from "@/components/v2/ReactSelect";
import { Button } from "@/components/v2/ui/button";
import { regionHirarchy, regionHirarchyMap } from "@/constants/app";
import {
  useCountries,
  useDistricts,
  useDivisions,
  useStates,
  useTehsils,
} from "@/hooks/useLocationAPI";
import { useAppSelector } from "@/redux/store";
import type { Option } from "@/shared/interfaces/option";
import type { TransferSevadar } from "@/shared/interfaces/transfer";
import { useFilterActions, useTransfer } from "@/store/useFilterStore";
import { cn } from "@/utils/cn";
import { ArrowUpRightIcon, MapPin, XIcon } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { toTransferSevadar } from "../_utils/transfer.utils";

type Align = "left" | "right";

const LOCATION_FIELD_ORDER = [
  "country",
  "state",
  "division",
  "district",
  "tehsil",
] as const;

function TransferSection({
  title,
  align = "left",
  showArrow,
  surface = "white",
  children,
}: {
  title?: string;
  align?: Align;
  showArrow?: boolean;
  surface?: "white" | "teal";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-[#0E7C86] p-2",
        title && "pt-6",
        surface === "teal" ? "bg-[#0E7C86]" : "bg-white",
      )}
    >
      {showArrow && (
        <div className="absolute -top-2 -left-2 flex size-6 items-center justify-center rounded-full bg-[#1D6FE0] text-white shadow">
          <ArrowUpRightIcon className="size-3.5" />
        </div>
      )}
      {title && (
        <div
          className={cn(
            "absolute -top-3 rounded-md bg-[#0E7C86] px-4 py-1 text-xs font-bold text-white",
            align === "left" ? (showArrow ? "left-9" : "left-4") : "right-4",
          )}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function SevadarDetails({ person }: { person: TransferSevadar }) {
  return (
    <DiscipleDetailCard
      name={person.name}
      avatar={person.avatar ?? ""}
      relation={person.relation}
      guardian_name={person.guardian_name}
      mobile_no={person.mobile_no}
      district={person.district}
      state={person.state}
      created_at={person.created_at}
    />
  );
}

function PillButton({
  onClick,
  icon,
  children,
  tone = "neutral",
}: {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  tone?: "neutral" | "teal";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border bg-white py-1.5 text-[13px] font-medium shadow-sm",
        tone === "teal"
          ? "border-[#0E7C86]/40 text-[#0E7C86]"
          : "border-slate-200 text-slate-500",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function SelectedCard({
  title,
  align,
  showArrow,
  person,
  onCancel,
}: {
  title: string;
  align: Align;
  showArrow?: boolean;
  person: TransferSevadar;
  onCancel: () => void;
}) {
  return (
    <TransferSection
      title={title}
      align={align}
      showArrow={showArrow}
      surface="teal"
    >
      <div className="rounded-xl bg-white p-1.5">
        <SevadarDetails person={person} />
      </div>
      <PillButton onClick={onCancel} icon={<XIcon className="size-4" />}>
        Cancel
      </PillButton>
    </TransferSection>
  );
}

function ResultPicker({
  title,
  align,
  showArrow,
  users,
  onSelect,
  onCancel,
}: {
  title: string;
  align: Align;
  showArrow?: boolean;
  users: TransferSevadar[];
  onSelect: (person: TransferSevadar) => void;
  onCancel: () => void;
}) {
  return (
    <TransferSection title={title} align={align} showArrow={showArrow}>
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-500">
          {users.length > 0
            ? `${users.length} sevadar${users.length > 1 ? "s" : ""} found — select one`
            : "No sevadar found for this number"}
        </p>
        {users.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => onSelect(person)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-left transition-colors hover:border-[#0E7C86] hover:bg-[#F3FAFB]"
          >
            <SevadarDetails person={person} />
          </button>
        ))}
        <PillButton onClick={onCancel} icon={<XIcon className="size-4" />}>
          Cancel
        </PillButton>
      </div>
    </TransferSection>
  );
}

function LocationEditor({
  onSave,
  onCancel,
}: {
  onSave: (patch: Partial<TransferSevadar>) => void;
  onCancel: () => void;
}) {
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );
  const activeRegion = (active_permission?.region as any)?.[
    active_region_index
  ];
  const roleRegion =
    active_permission?.role_region as keyof typeof regionHirarchyMap;
  const userLevel = regionHirarchyMap[roleRegion] ?? 0;

  const fields = useMemo(
    () => regionHirarchy.slice(userLevel + 1) as string[],
    [userLevel],
  );

  const [values, setValues] = useState<Record<string, number | undefined>>({});

  const baseCountryId = values.country ?? activeRegion?.country_id;
  const baseStateId = values.state ?? activeRegion?.state_id;
  const baseDistrictId = values.district ?? activeRegion?.district_id;

  const { data: countryOptions = [] } = useCountries({
    enabled: fields.includes("country"),
  });
  const { data: stateOptions = [] } = useStates(baseCountryId ?? "", {
    enabled: fields.includes("state") && !!baseCountryId,
  });
  const { data: divisionOptions = [] } = useDivisions(baseStateId ?? "", {
    enabled: fields.includes("division") && !!baseStateId,
  });
  const { data: districtOptions = [] } = useDistricts(baseStateId ?? "", {
    enabled: fields.includes("district") && !!baseStateId,
  });
  const { data: tehsilOptions = [] } = useTehsils(baseDistrictId ?? "", {
    enabled: fields.includes("tehsil") && !!baseDistrictId,
  });

  const locationData: Record<string, Option[]> = {
    country: countryOptions,
    state: stateOptions,
    division: divisionOptions,
    district: districtOptions,
    tehsil: tehsilOptions,
  };

  const handleChange = (field: string, value: number | undefined) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      const index = LOCATION_FIELD_ORDER.indexOf(
        field as (typeof LOCATION_FIELD_ORDER)[number],
      );
      LOCATION_FIELD_ORDER.slice(index + 1).forEach((deeper) => {
        delete next[deeper];
      });
      return next;
    });
  };

  const labelOf = (field: string) =>
    locationData[field]?.find(
      (option) => String(option.value) === String(values[field]),
    )?.label;

  const handleSave = () => {
    const patch: Partial<TransferSevadar> = {};
    const stateLabel = labelOf("state");
    const districtLabel = labelOf("district");
    const tehsilLabel = labelOf("tehsil");
    if (stateLabel) patch.state = stateLabel;
    if (districtLabel) patch.district = districtLabel;
    if (tehsilLabel) patch.tehsil = tehsilLabel;
    onSave(patch);
  };

  return (
    <div className="mt-2 space-y-2">
      {fields.map((field) => {
        const options = locationData[field] ?? [];
        return (
          <ReactSelect
            key={field}
            placeholder={`Select ${field}`}
            options={options}
            isDisabled={options.length === 0}
            value={
              options.find(
                (option) => String(option.value) === String(values[field]),
              ) ?? null
            }
            onChange={(option: any) =>
              handleChange(field, option ? Number(option.value) : undefined)
            }
          />
        );
      })}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="submit"
          size="sm"
          className="rounded-full"
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          variant="cancel"
          size="sm"
          className="rounded-full"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function EditableSevadar({
  person,
  onSaved,
}: {
  person: TransferSevadar;
  onSaved: (person: TransferSevadar) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <TransferSection surface={editing ? "white" : "teal"}>
      <div className="rounded-xl bg-white p-1.5">
        <SevadarDetails person={person} />
      </div>
      {editing ? (
        <LocationEditor
          onCancel={() => setEditing(false)}
          onSave={(patch) => {
            onSaved({ ...person, ...patch });
            setEditing(false);
            toast.success("Location updated");
          }}
        />
      ) : (
        <PillButton
          tone="teal"
          onClick={() => setEditing(true)}
          icon={<MapPin className="size-4" />}
        >
          Edit Location
        </PillButton>
      )}
    </TransferSection>
  );
}

function LocationResults({
  users,
  visible,
  onReset,
}: {
  users: TransferSevadar[];
  visible: boolean;
  onReset: () => void;
}) {
  const [edits, setEdits] = useState<Record<number, Partial<TransferSevadar>>>(
    {},
  );

  useEffect(() => {
    setEdits({});
  }, [users]);

  if (!visible) return null;

  return (
    <div className="space-y-3">
      {users.length === 0 ? (
        <p className="text-center text-[13px] text-slate-500">
          No sevadar found for this number
        </p>
      ) : (
        users.map((person) => {
          const merged = { ...person, ...edits[person.id] };
          return (
            <EditableSevadar
              key={person.id}
              person={merged}
              onSaved={(updated) =>
                setEdits((prev) => ({ ...prev, [person.id]: updated }))
              }
            />
          );
        })
      )}
      <Button
        variant="cancel"
        size="lg"
        className="w-full rounded-full"
        onClick={onReset}
      >
        Cancel
      </Button>
    </div>
  );
}

export function TransferResults({ items }: { items: any[] }) {
  const transfer = useTransfer();
  const { setTransfer, resetTransfer, setFilters } = useFilterActions();

  const users = useMemo(() => items.map(toTransferSevadar), [items]);
  const step: "from" | "to" = transfer.fromUser ? "to" : "from";
  const bothSelected = Boolean(transfer.fromUser && transfer.toUser);

  const clearSearch = () => {
    setTransfer({ searching: false });
    setFilters({ mobile_no: "" });
  };

  const handleReset = () => {
    resetTransfer();
    setFilters({ mobile_no: "" });
  };

  const handleSelect = (person: TransferSevadar) => {
    if (step === "from") {
      setTransfer({ fromUser: person, searching: false });
    } else {
      setTransfer({ toUser: person, searching: false });
    }
    setFilters({ mobile_no: "" });
  };

  if (transfer.type === "location") {
    return (
      <LocationResults
        users={users}
        visible={transfer.searching}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="space-y-3">
      {transfer.fromUser ? (
        <SelectedCard
          title="From"
          align="left"
          showArrow
          person={transfer.fromUser}
          onCancel={() =>
            setTransfer({
              fromUser: null,
              toUser: null,
              toMobile: "",
              searching: false,
            })
          }
        />
      ) : transfer.searching ? (
        <ResultPicker
          title="From"
          align="left"
          showArrow
          users={users}
          onSelect={handleSelect}
          onCancel={clearSearch}
        />
      ) : null}

      {transfer.fromUser &&
        (transfer.toUser ? (
          <SelectedCard
            title="To"
            align="right"
            person={transfer.toUser}
            onCancel={() =>
              setTransfer({ toUser: null, toMobile: "", searching: false })
            }
          />
        ) : transfer.searching ? (
          <ResultPicker
            title="To"
            align="right"
            users={users}
            onSelect={handleSelect}
            onCancel={clearSearch}
          />
        ) : null)}

      {bothSelected && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="submit"
            size="lg"
            className="rounded-full"
            onClick={() => {
              toast.success("Sevadar transferred");
              handleReset();
            }}
          >
            Transfer
          </Button>
          <Button
            variant="cancel"
            size="lg"
            className="rounded-full"
            onClick={handleReset}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

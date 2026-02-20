import * as React from "react";
import { setMonth, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useNavigation } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function DatePickerCaption(props: { displayMonth: Date; id?: string; displayIndex?: number }) {
  const { goToMonth } = useNavigation();
  const { displayMonth } = props;

  const handleMonthChange = (m: string) => {
    goToMonth(setMonth(displayMonth, parseInt(m, 10)));
  };
  const handleYearChange = (y: string) => {
    goToMonth(setYear(displayMonth, parseInt(y, 10)));
  };

  const anos = Array.from({ length: 201 }, (_, i) => 1900 + i);

  return (
    <div className="flex items-center justify-center gap-2 pb-4">
      <Select value={String(displayMonth.getMonth())} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="center">
          {MESES.map((nome, i) => (
            <SelectItem key={i} value={String(i)}>{nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(displayMonth.getFullYear())} onValueChange={handleYearChange}>
        <SelectTrigger className="h-9 w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="center" className="max-h-[240px]">
          {anos.map((ano) => (
            <SelectItem key={ano} value={String(ano)}>{ano}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export interface DatePickerProps {
  value?: string; // yyyy-mm-dd
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function toDisplay(value: string | undefined): string {
  if (!value) return "";
  try {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return value;
  }
}

function parseDisplay(s: string): string | null {
  const cleaned = s.replace(/\D/g, "");
  if (cleaned.length === 8) {
    const dd = cleaned.slice(0, 2);
    const mm = cleaned.slice(2, 4);
    const yyyy = cleaned.slice(4, 8);
    const d = parseInt(dd, 10);
    const m = parseInt(mm, 10);
    const y = parseInt(yyyy, 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
        return `${y}-${mm}-${dd}`;
      }
    }
  }
  return null;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  disabled,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(toDisplay(value));
  const [month, setMonth] = React.useState<Date>(() =>
    value ? new Date(`${value}T00:00:00`) : new Date()
  );

  const date = value ? new Date(`${value}T00:00:00`) : undefined;

  React.useEffect(() => {
    setInputValue(toDisplay(value));
  }, [value]);

  React.useEffect(() => {
    if (date) setMonth(date);
  }, [open, date]);

  const handleSelect = (d: Date | undefined) => {
    if (!d) return;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setInputValue(`${dd}/${mm}/${yyyy}`);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    let v = "";
    if (raw.length >= 2) v = raw.slice(0, 2) + "/";
    if (raw.length >= 4) v += raw.slice(2, 4) + "/";
    if (raw.length > 4) v += raw.slice(4, 8);
    setInputValue(v);
    const parsed = parseDisplay(v);
    if (parsed) onChange(parsed);
  };

  const handleInputBlur = () => {
    if (!value) setInputValue("");
    else setInputValue(toDisplay(value));
  };

  const hoje = new Date();
  const setHoje = () => {
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");
    const dd = String(hoje.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setInputValue(`${dd}/${mm}/${yyyy}`);
    setOpen(false);
  };

  const limpar = () => {
    onChange("");
    setInputValue("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("flex w-full gap-1", className)}>
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={cn(
            "flex-1 min-w-0",
            !inputValue && "text-muted-foreground"
          )}
          inputMode="numeric"
          maxLength={10}
          autoComplete="off"
        />
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          locale={ptBR}
          captionLayout="buttons"
          showOutsideDays={false}
          className="rounded-lg border-0 bg-transparent"
          components={{ Caption: DatePickerCaption }}
          classNames={{
            months: "flex flex-col sm:flex-row gap-4",
            month: "space-y-4 p-4",
            caption: "!p-0 !pb-0",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-lg w-10 font-medium text-[0.8rem]",
            row: "flex w-full mt-1",
            cell: "h-10 w-10 text-center text-sm p-0 relative rounded-lg",
            day: "h-10 w-10 p-0 font-normal rounded-lg hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-lg",
            day_today: "bg-accent/80 text-accent-foreground font-medium rounded-lg",
            day_outside: "text-muted-foreground opacity-40",
            day_disabled: "text-muted-foreground opacity-40",
            day_hidden: "invisible",
          }}
        />
        <div className="flex items-center justify-between gap-2 border-t p-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground"
            onClick={limpar}
          >
            Limpar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={setHoje}
          >
            Hoje
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

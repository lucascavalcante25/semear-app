import * as React from "react";
import { setMonth, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useNavigation } from "react-day-picker";
import { useLocation } from "react-router-dom";

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
import {
  aplicarMascaraData,
  apiParaMascaraData,
  dataMascaraParaApi,
  validarData,
} from "@/lib/mascara-telefone";

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
  /** Rejeita datas futuras ao digitar (útil para nascimento). */
  rejeitarFuturo?: boolean;
}

function parseDisplay(s: string, rejeitarFuturo: boolean): string | null {
  if (!validarData(s, { rejeitarFuturo })) return null;
  const api = dataMascaraParaApi(s);
  return api || null;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  disabled,
  className,
  id,
  rejeitarFuturo = false,
}: DatePickerProps) {
  const { pathname } = useLocation();
  const pathnameAnterior = React.useRef(pathname);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(() => apiParaMascaraData(value ?? ""));
  const [month, setMonth] = React.useState<Date>(() =>
    value ? new Date(`${value}T00:00:00`) : new Date()
  );

  const date = React.useMemo(
    () => (value ? new Date(`${value}T00:00:00`) : undefined),
    [value],
  );

  React.useEffect(() => {
    if (pathnameAnterior.current !== pathname) {
      pathnameAnterior.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  React.useEffect(() => {
    setInputValue(apiParaMascaraData(value ?? ""));
  }, [value]);

  React.useEffect(() => {
    if (date) setMonth(date);
  }, [date]);

  const commitarTexto = (texto: string) => {
    const mascarado = aplicarMascaraData(texto);
    setInputValue(mascarado);
    if (!mascarado.trim()) {
      onChange("");
      return;
    }
    const parsed = parseDisplay(mascarado, rejeitarFuturo);
    if (parsed) onChange(parsed);
  };

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
    const mascarado = aplicarMascaraData(e.target.value);
    setInputValue(mascarado);
    if (!mascarado.trim()) {
      onChange("");
      return;
    }
    const parsed = parseDisplay(mascarado, rejeitarFuturo);
    if (parsed) onChange(parsed);
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      onChange("");
      setInputValue("");
      return;
    }
    const parsed = parseDisplay(inputValue, rejeitarFuturo);
    if (parsed) {
      onChange(parsed);
      setInputValue(apiParaMascaraData(parsed));
    } else if (value) {
      setInputValue(apiParaMascaraData(value));
    }
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
    <div className={cn("flex w-full gap-1", className)}>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitarTexto(inputValue);
          }
        }}
        className="flex-1 min-w-[120px]"
        inputMode="numeric"
        maxLength={10}
        autoComplete="off"
        data-date-input
      />
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={disabled}
            aria-label="Abrir calendário"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="end"
          sideOffset={8}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest("[data-date-input]")) e.preventDefault();
          }}
        >
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
    </div>
  );
}

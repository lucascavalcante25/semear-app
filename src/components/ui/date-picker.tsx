import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: string; // yyyy-mm-dd
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione a data",
  disabled,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(`${value}T00:00:00`) : undefined;

  const handleSelect = (d: Date | undefined) => {
    if (!d) return;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const hoje = new Date();
  const setHoje = () => {
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");
    const dd = String(hoje.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const limpar = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={ptBR}
          defaultMonth={date ?? new Date()}
          showOutsideDays={false}
          className="rounded-lg border-0 bg-transparent"
          classNames={{
            months: "flex flex-col sm:flex-row gap-4",
            month: "space-y-4 p-4",
            caption: "flex justify-center pt-2 pb-4 relative items-center",
            caption_label: "text-sm font-semibold text-foreground",
            nav: "flex items-center gap-1",
            nav_button_previous: "absolute left-2 top-2 h-8 w-8 rounded-lg hover:bg-accent",
            nav_button_next: "absolute right-2 top-2 h-8 w-8 rounded-lg hover:bg-accent",
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

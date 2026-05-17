"use client";

import { buildStudentTimeSlots, DAYS_OF_WEEK } from "@/lib/schedule";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentFormValues, STUDENT_RATE_OPTIONS } from "@/features/students/form-values";

interface StudentFormFieldsProps {
  form: StudentFormValues;
  idPrefix: string;
  onChange: (field: keyof StudentFormValues, value: string) => void;
}

const timeSlots = buildStudentTimeSlots();

export function StudentFormFields({ form, idPrefix, onChange }: StudentFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Nom</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="Nom de l'élève"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-phone`}>Numéro de téléphone</Label>
        <Input
          id={`${idPrefix}-phone`}
          value={form.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          placeholder="Numéro de téléphone"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-address`}>Adresse</Label>
        <Input
          id={`${idPrefix}-address`}
          value={form.address}
          onChange={(event) => onChange("address", event.target.value)}
          placeholder="Adresse"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-course-day`}>Jour du cours</Label>
        <Select value={form.courseDay} onValueChange={(value) => onChange("courseDay", value)}>
          <SelectTrigger id={`${idPrefix}-course-day`}>
            <SelectValue placeholder="Sélectionner un jour" />
          </SelectTrigger>
          <SelectContent>
            {DAYS_OF_WEEK.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-course-hour`}>Heure du cours</Label>
        <Select value={form.courseHour} onValueChange={(value) => onChange("courseHour", value)}>
          <SelectTrigger id={`${idPrefix}-course-hour`}>
            <SelectValue placeholder="Sélectionner une heure" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tarif du cours</Label>
        <RadioGroup value={form.rate} onValueChange={(value) => onChange("rate", value)}>
          {STUDENT_RATE_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${idPrefix}-rate-${option.id}`} />
              <Label htmlFor={`${idPrefix}-rate-${option.id}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </>
  );
}

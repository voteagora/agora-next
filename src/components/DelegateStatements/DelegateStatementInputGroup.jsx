import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function DelegateStatementInputGroup({
  title,
  placeholder,
  value,
  onChange,
}) {
  return (
    <Label variant="black">
      <h4 className="font-bold text-xs mb-2">{title}</h4>
      <Input
        variant="bgGray100"
        inputSize="md"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Label>
  );
}

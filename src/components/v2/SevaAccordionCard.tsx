import { Card, CardContent } from "@/components/v2/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/v2/ui/accordion";

interface Props {
  title: string;
  children?: React.ReactNode;
}
export function SevaAccordionCard({ title, children }: Props) {
  return (
    <Card className="rounded-lg p-0 bg-white/60">
      <CardContent className="px-0">
        <Accordion>
          <AccordionItem value={"plans"}>
            <AccordionTrigger
              className={"px-3 bg-white text-slate-800 text-lg rounded-b-none"}
            >
              {title}
            </AccordionTrigger>
            <AccordionContent className="p-3">{children}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

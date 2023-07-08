import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const EventCard = ({ event }) => {
  return (
    <Card>
      <CardContent>
        <p>{event.kind}</p>
        <p>{event.event_data}</p>
      </CardContent>
    </Card>
  );
};

export default EventCard;

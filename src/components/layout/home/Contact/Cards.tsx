import StatsCard from "@/components/ui/StatsCard";
import { Clock1, MailIcon, MapPinIcon, PhoneCall } from "lucide-react";
import React from "react";
const contactCard = [
  {
    id: 1,
    title: "Visit Us",
    content: `123 Herbal Street \n
Garden Town, Lahore \n
Punjab, Pakistan`,
    icon: MapPinIcon,
  },
  {
    id: 2,
    title: "Call Us",
    content: (
      <>
        +92 300 1234567 <br />
        +92 42 1234567
      </>
    ),
    icon: PhoneCall,
  },
  {
    id: 3,
    title: "Email Us",
    content: (
      <>
        info@herbalkhana.pk <br /> support@herbalkhana.pk
      </>
    ),
    icon: MailIcon,
  },
  {
    id: 4,
    title: "Business Hours",
    content: (
      <>
        Mon - Sat: 10am - 8pm <br /> Sunday: Closed
      </>
    ),
    icon: Clock1,
  },
];
function Cards() {
  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1 gap-4 mx-auto px-10 py-10 text-center">
      {contactCard.map((items) => {
        const Icon = items.icon;
        return (
          <StatsCard
            position="center"
            key={items.id}
            id={items.id}
            title={items.title}
            content={items.content}
            Icon={Icon}
          />
        );
      })}
    </div>
  );
}

export default Cards;
